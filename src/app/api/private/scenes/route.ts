// File: /app/api/private/scenes/route.ts
import { NextResponse, userAgent } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";
import db from "@/app/database";
import { scenes, lines, characters } from "@/database/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  
  // TODO: Pretty sure this needs to be fixed to return scenes for user, not user. Right now I'm doing this in page.tsx...

  // Get the current user from the Supabase session
  const supabase = await createClient(); // this must use cookies() internally
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log(user)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: do I need this? query DB?

  return NextResponse.json(user);
}

export async function POST(req: Request) {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    console.log("user: " + user)

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const body = await req.json()
    const {name} = body

    if (!name || !name.length) {
        return NextResponse.json({error: "Missing scene name"}, {status: 400})
    }

    const insertedScene = await db.insert(scenes).values({
        name,
        user_id: user.id
    }).returning()

    const sceneId = insertedScene[0]?.id

    return NextResponse.json({sceneId})

}

export async function PATCH(req: Request) {

  const supabase = await createClient();
  const {data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401})
  }

  const body = await req.json()
  const {id, ...updates} = body

  const res  = await db
    .update(scenes)
    .set(updates)
    .where(eq(scenes.id, id))
    .returning()
  
  const updatedScene = res[0]

  return NextResponse.json({updatedScene})

}

export async function DELETE(req: Request) {

  const supabase = await createClient();
  const {data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401})
  }

  try {
    const body = await req.json()
    const { id } = body as { id: number }

    if (!id) {
      return NextResponse.json({ error: "Missing scene id" }, { status: 400 })
    }

    // Ensure the scene belongs to the current user
    const sceneOwner = await db.select({ id: scenes.id, user_id: scenes.user_id }).from(scenes).where(eq(scenes.id, id))
    const scene = sceneOwner?.[0]
    if (!scene || scene.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Delete dependent rows first to satisfy FK constraints
    await db.delete(lines).where(eq(lines.scene_id, id))
    await db.delete(characters).where(eq(characters.scene_id, id))

    // Now delete the scene
    await db.delete(scenes).where(and(eq(scenes.id, id), eq(scenes.user_id, user.id)))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error("Error deleting scene:", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }

}