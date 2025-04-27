// import "dotenv/config";
// import { ElevenLabsClient, play } from "elevenlabs";

// if (!process.env.ELEVENLABS_API_KEY) {
//   throw new Error("Missing ELEVENLABS_API_KEY in environment!");
// }

// const client = new ElevenLabsClient({
//   apiKey: process.env.ELEVENLABS_API_KEY,
// });

// const voiceId = "JBFqnCBsd6RMkjVDRZzb";

// (async () => {
//   try {
//     console.log("Fetching sample audio...");
//     const response = await fetch(
//       "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
//     );

//     const arrayBuffer = await response.arrayBuffer();
//     const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" }); // 👈 careful MIME type!

//     console.log("Sending to ElevenLabs:");
//     console.log({
//       voiceId,
//       modelId: "eleven_multilingual_sts_v2",
//       blobType: audioBlob.type,
//       blobSize: audioBlob.size,
//     });

//     const audioStream = await client.speechToSpeech.convert(voiceId, {
//       audio: audioBlob,
//       model_id: "eleven_multilingual_sts_v2",
//       output_format: "mp3_44100_128",
//     });

//     console.log("Audio stream received. Playing...");
//     await play(audioStream);
//   } catch (error) {
//     console.error("🔥 Error occurred while generating speech:", error);
//   }
// })();
