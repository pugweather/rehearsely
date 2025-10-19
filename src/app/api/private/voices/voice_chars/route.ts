import "dotenv/config"; 
import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function GET(req: NextRequest) {
  try {
    const voicesRes = await client.voices.getAll();
    const voices = voicesRes.voices
        .map(voice => {
            return {
              voice_id: voice.voice_id,
              name: voice.name,
              labels: voice.labels,
              preview_url: voice.preview_url,
              category: voice.category
            }
        })

    return NextResponse.json({voices}, {status: 200})

  } catch (error) {
    return NextResponse.json({status: 500})
  }
}