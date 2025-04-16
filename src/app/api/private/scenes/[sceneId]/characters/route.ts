// File: /app/api/private/scenes/route.ts
import { NextResponse, userAgent } from "next/server";
import { createClient } from "../../../../../../../utils/supabase/server";
import db from "@/app/database";
import { scenes, characters } from "@/database/drizzle/schema";
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