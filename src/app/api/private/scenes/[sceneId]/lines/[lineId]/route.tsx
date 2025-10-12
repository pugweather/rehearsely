import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../../utils/supabase/server";
import { lines } from "@/database/drizzle/schema";
import db from "@/app/database";
import { eq } from "drizzle-orm";
import { createAudioBufferFromText, convertVoiceChanger, getCharacterVoiceId } from "@/app/lib/elevenlabs";
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
    let isVoiceCloning = false;
    let preserveVoiceClonedAudio = false;
    
    if (contentType.includes('multipart/form-data')) {
        // Handle audio file upload (trimmed audio or voice cloning)
        const formData = await req.formData();
        uploadedAudioFile = formData.get('audio') as File;
        isVoiceCloning = formData.get('isVoiceCloning') === 'true';
        preserveVoiceClonedAudio = formData.get('preserveVoiceClonedAudio') === 'true';
        
        // Get any other form fields
        for (const [key, value] of formData.entries()) {
            if (key !== 'audio' && key !== 'isVoiceCloning' && key !== 'preserveVoiceClonedAudio') {
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
    var clonedVoiceId: string | null = null;

    // Handle voice cloning
    if (uploadedAudioFile && isVoiceCloning) {
        try {
            console.log('Starting voice cloning process...');
            const audioBuffer = await uploadedAudioFile.arrayBuffer();
            console.log('Audio buffer size:', audioBuffer.byteLength);
            
            const characterName = updates.characterId ? `Character_${updates.characterId}` : 'Cloned_Voice';
            console.log('Creating voice clone with name:', characterName);
            
            // Use the character's actual voice ID from the request
            const targetVoiceId = updates.voiceId;
            console.log('Target voice ID from character:', targetVoiceId);
            
            if (!targetVoiceId) {
                console.error('No voice ID provided for character');
                return NextResponse.json({error: "Character voice ID is required for voice cloning"}, {status: 400});
            }
            
            // Convert your recorded voice to the character's voice (preserves emotion)
            console.log('Converting your voice to character voice using Voice Changer...');
            const convertedAudio = await convertVoiceChanger(targetVoiceId, Buffer.from(audioBuffer));
            console.log('Voice Changer conversion completed, size:', convertedAudio.length);
            
            const fileName = `${uuid()}.mp3`;
            const filePath = `${userId}/${fileName}`;
            console.log('Uploading converted audio to storage:', filePath);
            
            // Save the converted audio to storage
            const {error: uploadError } = await supabase.storage
                .from('audio-urls')
                .upload(filePath, convertedAudio, {
                    contentType: 'audio/mpeg',
                    upsert: true,
                });
        
            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                return NextResponse.json({error: "Audio upload failed", details: uploadError}, {status: 500})
            }
        
            const {data: publicUrlData} = await supabase.storage
                .from('audio-urls')
                .getPublicUrl(filePath)
            
            publicUrl = publicUrlData.publicUrl;
            console.log('Voice Changer conversion completed successfully, audio URL:', publicUrl);
            
            // Store the voice ID for future use
            clonedVoiceId = targetVoiceId;
        } catch (error) {
            console.error('Voice cloning failed:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            return NextResponse.json({
                error: "Voice cloning failed", 
                details: error instanceof Error ? error.message : 'Unknown error'
            }, {status: 500})
        }
    }
    // Handle uploaded audio file (trimmed audio)
    else if (uploadedAudioFile && !isVoiceCloning) {
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
    // Handle text-to-speech generation (but not if we're preserving voice-cloned audio)
    else if (updates.text && updates.voiceId && !preserveVoiceClonedAudio) {
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
            ...(publicUrl ? {audio_url: publicUrl} : {}),
            ...(clonedVoiceId ? {voice_id: clonedVoiceId} : {})
        })
        .where(eq(lines.id, Number(lineId)))
        .returning()

    // Get the current audio_url from the updated line to return in response
    const updatedLine = res[0];
    const currentAudioUrl = publicUrl || updatedLine?.audio_url;

    return NextResponse.json({id: lineId, updates: {...updates, ...(currentAudioUrl ? {audio_url: currentAudioUrl} : {}), ...(clonedVoiceId ? {voice_id: clonedVoiceId} : {})}}, {status: 200})

}

export async function DELETE(
    req: Request,
    {params}:{params: {sceneId: string, lineId: string}}
) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const {lineId} = params

    try {
        const res = await db
            .delete(lines)
            .where(eq(lines.id, Number(lineId)))

        return NextResponse.json({success: true}, {status: 200})
    } catch (err) {
        console.error('Error deleting line:', err);
        return NextResponse.json({error: "Failed to delete line", details: err}, {status: 500})
    }
}