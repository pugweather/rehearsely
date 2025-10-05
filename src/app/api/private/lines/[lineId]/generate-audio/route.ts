import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../../../utils/supabase/server'
import db from '@/app/database'
import { lines } from '@/database/drizzle/schema'
import { eq } from 'drizzle-orm'
import { ElevenLabsClient } from 'elevenlabs'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
})

export async function POST(
  request: NextRequest,
  { params }: { params: { lineId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lineId = parseInt(params.lineId)
    const { text, voiceId } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Missing text or voiceId' },
        { status: 400 }
      )
    }

    console.log(`Generating audio for line ${lineId} with voice ${voiceId}`)

    // Generate audio using ElevenLabs
    const audioStream = await elevenlabs.generate({
      voice: voiceId,
      text: text,
      model_id: 'eleven_monolingual_v1'
    })

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    const audioBuffer = Buffer.concat(chunks)

    // Upload to Supabase Storage
    const fileName = `${user.id}/line_${lineId}_${Date.now()}.mp3`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-urls')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading audio:', uploadError)
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-urls')
      .getPublicUrl(fileName)

    const audioUrl = urlData.publicUrl

    // Update line in database with audio URL
    await db
      .update(lines)
      .set({ audio_url: audioUrl })
      .where(eq(lines.id, lineId))

    console.log(`Audio generated and saved for line ${lineId}`)

    return NextResponse.json({
      success: true,
      audioUrl,
      lineId
    })

  } catch (error: any) {
    console.error('Error generating audio:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error.message },
      { status: 500 }
    )
  }
}
