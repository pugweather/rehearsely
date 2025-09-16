// deepgramServer.ts - Server-side Deepgram integration for virtual scene partner
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

// This file can be used for server-side Deepgram operations if needed
// Currently, the app uses client-side WebSocket connections directly

export const createDeepgramConnection = () => {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY as string);

  const connection = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
    interim_results: true,
    endpointing: 300,
  });

  return connection;
};

// Example usage for server-side transcription
export const startServerTranscription = () => {
  const connection = createDeepgramConnection();

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log('Server-side Deepgram connection opened');
  });

  connection.on(LiveTranscriptionEvents.Close, () => {
    console.log('Server-side Deepgram connection closed');
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel.alternatives[0].transcript;
    if (transcript) {
      console.log('Server transcript:', transcript);
      // Process transcript for line matching here
    }
  });

  connection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error('Server Deepgram error:', err);
  });

  return connection;
};
