import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../../utils/supabase/server";
import { lines } from "@/database/drizzle/schema";
import db from "@/app/database";
import { eq } from "drizzle-orm";
import { createAudioBufferFromText } from "@/app/lib/elevenlabs";
import { readFileSync } from "fs";
import { v4 as uuid } from 'uuid';

export async function PATCH(
    req: Request,
    {params}:{params: {sceneId: string, lineId: string}}
) {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const {lineId} = params
    const body = await req.json()
    const {...updates} = body

    // Create audio, create buffer
    const userId = user.id
    const text = updates.text
    const voiceId = updates.voiceId

    if (!text || !voiceId) {
        return NextResponse.json({error: "Error: Missing either text or order"}, {status: 500})
    }

    const audioFile = await createAudioBufferFromText(text, voiceId)
    const fileName = `${uuid()}.mp3`;
    const filePath = `${userId}/${fileName}`

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

    const {data: publicUrl} = await supabase.storage
        .from('audio-urls')
        .getPublicUrl(filePath)

    // Update line in db
    const res = await db
        .update(lines)
        .set({
            ...updates,
            audio_url: filePath
        })
        .where(eq(lines.id, Number(lineId)))
        .returning()

    return NextResponse.json({id: lineId, updates: {...updates, audio_url: filePath}}, {status: 200})

}

export async function DELETE(
    req: Request,
    {params}:{params: {sceneId: string}}
) {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const body = await req.json()
    const {id} = body

    const res = await db
        .delete(lines)
        .where(eq(lines.id, id))

    return NextResponse.json({success: 201})

}