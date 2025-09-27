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

export const convertVoiceChanger = async (targetVoiceId: string, audioFile: Buffer): Promise<Buffer> => {
  try {
    console.log("Converting voice using Speech-to-Speech to target voice:", targetVoiceId);
    console.log("Audio file size:", audioFile.length);
    
    // Convert Buffer to Blob for the API
    const audioBlob = new Blob([audioFile], { type: 'audio/webm' });
    
    // Use Speech-to-Speech API according to official docs
    const response = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${targetVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: (() => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        formData.append('model_id', 'eleven_english_sts_v2');
        formData.append('voice_settings', JSON.stringify({
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true
        }));
        return formData;
      })()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Speech-to-Speech API failed: ${response.status} - ${errorText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const convertedAudio = Buffer.from(arrayBuffer);
    console.log("Speech-to-Speech conversion completed, size:", convertedAudio.length);
    return convertedAudio;
  } catch (err) {
    console.error("Failed to convert speech:", err);
    throw err;
  }
};

// Fallback function to get a suitable voice ID for characters
export const getCharacterVoiceId = async (characterName: string): Promise<string> => {
  try {
    console.log("Getting voice for character:", characterName);
    
    // Get available voices
    const voices = await client.voices.getAll();
    console.log("Available voices:", voices.voices.length);
    
    // Try to find a good voice based on character name or use a default
    let selectedVoice = voices.voices.find(v => 
      v.category === 'premade' && 
      v.name && 
      (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('female'))
    );
    
    // If no suitable voice found, use the first available voice
    if (!selectedVoice) {
      selectedVoice = voices.voices.find(v => v.category === 'premade') || voices.voices[0];
    }
    
    if (selectedVoice) {
      console.log("Selected voice:", selectedVoice.voice_id, selectedVoice.name);
      return selectedVoice.voice_id;
    }
    
    throw new Error("No voices available");
  } catch (err) {
    console.error("Failed to get character voice:", err);
    throw err;
  }
};
