import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../../utils/supabase/server";
import { lines } from "@/database/drizzle/schema";
import db from "@/app/database";
import { eq } from "drizzle-orm";
import { createAudioBufferFromText } from "@/app/lib/elevenlabs";
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
    const contentType = req.headers.get('content-type') || '';
    
    // Handle FormData (audio file upload) vs JSON (text updates)
    let updates: any = {};
    let uploadedAudioFile: File | null = null;
    
    if (contentType.includes('multipart/form-data')) {
        // Handle audio file upload (trimmed audio)
        const formData = await req.formData();
        uploadedAudioFile = formData.get('audio') as File;
        
        // Get any other form fields
        for (const [key, value] of formData.entries()) {
            if (key !== 'audio') {
                updates[key] = value;
            }
        }
    } else {
        // Handle JSON updates
        const body = await req.json();
        updates = body;
    }

    const userId = user.id;
    var publicUrl: string | null = null;

    // Handle uploaded audio file (trimmed audio)
    if (uploadedAudioFile) {
        const fileName = `${uuid()}.wav`;
        const filePath = `${userId}/${fileName}`;
        
        const audioBuffer = await uploadedAudioFile.arrayBuffer();
        
        // Save trimmed audio to storage
        const {error: uploadError } = await supabase.storage
            .from('audio-urls')
            .upload(filePath, audioBuffer, {
                contentType: 'audio/wav',
                upsert: true,
            });
    
        if (uploadError) {
            return NextResponse.json({error: "Audio upload failed"}, {status: 500})
        }
    
        const {data: publicUrlData} = await supabase.storage
            .from('audio-urls')
            .getPublicUrl(filePath)
        
        publicUrl = publicUrlData.publicUrl;
    } 
    // Handle text-to-speech generation
    else if (updates.text && updates.voiceId) {
        const text = updates.text;
        const voiceId = updates.voiceId;
        
        const generatedAudioFile = await createAudioBufferFromText(text, voiceId);
        const fileName = `${uuid()}.mp3`;
        const filePath = `${userId}/${fileName}`;
        
        // Save generated audio to storage
        const {error: uploadError } = await supabase.storage
            .from('audio-urls')
            .upload(filePath, generatedAudioFile, {
                contentType: 'audio/mpeg',
                upsert: true,
            });
    
        if (uploadError) {
            return NextResponse.json({error: "Audio upload failed"}, {status: 500})
        }
    
        const {data: publicUrlData} = await supabase.storage
            .from('audio-urls')
            .getPublicUrl(filePath)
        
        publicUrl = publicUrlData.publicUrl;
    }

    // Update line in db
    const res = await db
        .update(lines)
        .set({
            ...updates,
            ...(publicUrl ? {audio_url: publicUrl} : {})
        })
        .where(eq(lines.id, Number(lineId)))
        .returning()

    return NextResponse.json({id: lineId, updates: {...updates, ...(publicUrl ? {audio_url: publicUrl} : {})}}, {status: 200})

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