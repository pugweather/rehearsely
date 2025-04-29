import { NextRequest } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function GET(
  req: NextRequest, 
  {params}: {params: {voiceId: string}}
) {
  try {
    const audioStream = await client.textToSpeech.convert(params.voiceId, {
      text: "The first move is what sets everything in motion.",
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });

    // Collect all chunks from the Readable stream
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream as Readable) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
