import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../utils/supabase/server";
import { lines } from "@/database/drizzle/schema";
import db from "@/app/database";

export async function POST(
    req: Request,
    {params}:{params: {sceneId: string}}
) {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const body = await req.json()
    const {text, characterId, order, sceneId} = body

    if (!text || !text.length) {
        return NextResponse.json({error: "lines must have at least one character"}, {status: 400})
    }

    const insertedLine = await db.insert(lines).values({
        text,
        order,
        character_id: characterId,
        scene_id: sceneId
    }).returning()

    console.log(insertedLine)

    return NextResponse.json({insertedLine})
}