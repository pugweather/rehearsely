// File: /app/api/private/scenes/route.ts
import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../../utils/supabase/server";
import db from "@/app/database";
import { characters, lines } from "@/database/drizzle/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
    req: Request,
    {params}: {params: {characterId: string, sceneId: string}}
) {

  const supabase = await createClient(); 
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const characterId = Number(params.characterId);
  
  if (!characterId) {
    return NextResponse.json({ error: "Invalid character ID" }, { status: 400 });
  }

  try {
    // First, delete all lines associated with this character
    await db
      .delete(lines)
      .where(eq(lines.character_id, characterId));

    // Then delete the character
    await db
      .delete(characters)
      .where(eq(characters.id, characterId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character and associated lines:', error);
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
  }
}