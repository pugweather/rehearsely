// File: /app/api/private/scenes/route.ts
import { NextResponse, userAgent } from "next/server";
import { createClient } from "../../../../../../../utils/supabase/server";
import db from "@/app/database";
import { characters } from "@/database/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(
    req: Request,
    {params}: {params: {sceneId: string}}
) {

  const supabase = await createClient(); 
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const characterItems = await db
    .select()
    .from(characters)
    .where(eq(characters.scene_id, Number(params.sceneId)))

  return NextResponse.json(characterItems);
}

export async function POST(req: Request) {

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const body = await req.json()
  const {name, sceneId, voiceId} = body

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Missing or invalid name" }, { status: 400 });
  }
  
  if (!sceneId || typeof sceneId !== "number") {
    return NextResponse.json({ error: "Missing or invalid sceneId" }, { status: 400 });
  }
  
  if (!voiceId || typeof voiceId !== "string") {
    return NextResponse.json({ error: "Missing or invalid voiceId" }, { status: 400 });
  }

  const insertedCharacterArr = await db.insert(characters).values({
      name,
      scene_id: sceneId,
      voice_id: voiceId
  }).returning()

  const insertedCharacter = insertedCharacterArr[0]

  return NextResponse.json({insertedCharacter})

}