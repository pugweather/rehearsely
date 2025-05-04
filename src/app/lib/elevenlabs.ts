import { ElevenLabsClient } from 'elevenlabs';
import { Buffer } from 'buffer';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export const createAudioBufferFromText = async (text: string, voiceId: string): Promise<Buffer> => {
  try {
    const stream = await client.textToSpeech.convert(voiceId, {
      model_id: 'eleven_multilingual_v2',
      text,
      output_format: 'mp3_44100_128',
      voice_settings: {
        stability: 0,
        similarity_boost: 0,
        use_speaker_boost: true,
        speed: 1.0,
      },
    });
    const chunks: Buffer[] = [];

    for await (const chunk of stream as any) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch (err) {
    console.error("Failed to create audio buffer:", err);
    throw err;
  }
};
