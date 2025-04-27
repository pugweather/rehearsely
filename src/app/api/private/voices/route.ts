import "dotenv/config"; 
import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function GET(req: NextRequest) {
  try {
    const allowedVoiceIds = [
        "9BWtsMINqrJLrRacOk9x", // Aria
        "CwhRBWXzGAHq8TQ4Fs17", // Roger
        "EXAVITQu4vr4xnSDxMaL", // Sarah
        "IKne3meq5aSn9XLyUdCD", // Charlie
        "JBFqnCBsd6RMkjVDRZzb", // George
        "XB0fDUnXU5powFXDhCwa", // Charlotte
        "SAz9YHcvj6GT2YYXdXww", // River
        "TX3LPaxmHKxFdv7VOQHJ", // Liam
        "cgSgspJ2msm6clMCkdW9", // Jessica
        "pqHfZKP75CvOlQylNhV4", // Bill
    ];

    const voicesRes = await client.voices.getAll();
    const voices = voicesRes.voices
        .filter(voice => allowedVoiceIds.includes(voice.voice_id))
        .map(voice => {
            console.log(voice)
            return {

            }
        })

    return NextResponse.json({voices}, {status: 200})

  } catch (error) {
    return NextResponse.json({status: 500})
  }
}