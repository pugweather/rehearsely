// File: /app/api/private/scenes/route.ts
import { NextResponse, userAgent } from "next/server";
import { createClient } from "../../../../..//utils/supabase/server";
import db from "@/app/database";
import { scenes } from "@/database/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  

  // Get the current user from the Supabase session
  const supabase = await createClient(); // this must use cookies() internally
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: do I need this? query DB?

  return NextResponse.json(user);
}

export async function POST(req: Request) {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

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