/**** Delete this? I'm using preview_url passed in from voice. WAAY better ****/

// export const runtime = "nodejs";
// import { NextRequest } from "next/server";
// import { ElevenLabsClient } from "elevenlabs";
// import { Readable } from "stream";

// const client = new ElevenLabsClient({
//   apiKey: process.env.ELEVENLABS_API_KEY!,
// });

// export async function GET(
//   req: NextRequest, 
//   context: { params: { voiceId?: string } }
// ) {
//   try {
//     const voiceId = context.params.voiceId;
//     if (!voiceId) return new Response("Missing voice ID", { status: 400 });
//     var audioStream = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
//       output_format: "mp3_44100_128",
//       text: "The first move is what sets everything in motion.",
//       model_id: "eleven_multilingual_v2",
//   });

//     // Collect all chunks from the Readable stream
//     const chunks: Buffer[] = [];
//     for await (const chunk of audioStream as Readable) {
//       chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
//     }
//     const audioBuffer = Buffer.concat(chunks);

//     return new Response(audioBuffer, {
//       headers: {
//         'Content-Type': 'audio/mpeg',
//       },
//     });

//   } catch (error) {
//     console.error(error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }
