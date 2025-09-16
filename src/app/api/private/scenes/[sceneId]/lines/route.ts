import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../utils/supabase/server";
import { lines } from "@/database/drizzle/schema";
import db from "@/app/database";
import { createAudioBufferFromText } from "@/app/lib/elevenlabs";
import { v4 as uuid } from 'uuid';

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
    const {text, characterId, order, speed, delay, voiceId} = body

    if (!text || !order || !characterId) {
        return NextResponse.json({error: "Must pass in text, order, and characterId"}, {status: 400})
    }

    var publicUrl: string | null = null;
    var userId = user.id

    if (voiceId) {
        var audioFile = await createAudioBufferFromText(text, voiceId)
        var fileName = `${uuid()}.mp3`;
        var filePath = `${userId}/${fileName}`
        // Save audio to S3
        const {error: uploadError } = await supabase.storage
            .from('audio-urls')
            .upload(filePath, audioFile, {
                contentType: 'audio/mpeg',
                upsert: true,
            });
    
        if (uploadError) {
            return NextResponse.json({error: "Audio upload failed"}, {status: 500})
        }
    
        var {data: publicUrlData} = await supabase.storage
            .from('audio-urls')
            .getPublicUrl(filePath)
        
        publicUrl = publicUrlData.publicUrl
            
    }

    const insertedLine = await db.insert(lines).values({
        ...(publicUrl ? {audio_url: publicUrl} : {audio_url: null}),
        text,
        order,
        speed,
        delay,
        character_id: characterId,
        scene_id: Number(params.sceneId)
    }).returning()

    return NextResponse.json({insertedLine})
}