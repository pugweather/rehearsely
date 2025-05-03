import { ElevenLabsClient } from 'elevenlabs';
import { createWriteStream } from 'fs';
import { v4 as uuid } from 'uuid';

export const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY!,
});

export const createAudioFileFromText = async (text: string, voiceId: string): Promise<string> => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const audio = await client.textToSpeech.convert(voiceId, {
        model_id: 'eleven_multilingual_v2',
        text,
        output_format: 'mp3_44100_128',
        // Optional voice settings that allow you to customize the output
        voice_settings: {
          stability: 0,
          similarity_boost: 0,
          use_speaker_boost: true,
          speed: 1.0,
        },
      });
      const fileName = `${uuid()}.mp3`;
      const fileStream = createWriteStream(fileName);
      audio.pipe(fileStream);
      fileStream.on('finish', () => resolve(fileName)); // Resolve with the fileName
      fileStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}