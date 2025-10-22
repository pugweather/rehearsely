"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  faMicrophone,
  faScissors,
  faPersonRunning,
  faHand,
  faCheck,
  faTrash,
  faUser,
  faXmark,
  faChevronDown,
  faStop,
  faRedo,
  faPlay,
  faPause,
  faPlusCircle,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DraftLine, Character, LineBeingEditedData, EditLineMode, DropdownData } from "@/app/types";
import Waveform from "./Waveform";
import localFont from "next/font/local";
import clsx from "clsx";
import { waveform } from "elevenlabs/api/resources/voices/resources/pvc/resources/samples";
import BeautifulWaveform from "./BeautifulWaveform";
import RecordedAudioWaveform, { RecordedAudioWaveformRef } from "./RecordedAudioWaveform";
import { cn } from "@/lib/utils"
import { Slider } from "../ui/Slider";
import { lines } from "@/database/drizzle/schema";
import { useCharacters } from '@/app/context/charactersContext';
import { useVoicesStore } from '@/app/stores/useVoicesStores';
import Dropdown from '../ui/Dropdown';
import ModalDeleteCharacter from './ModalDeleteCharacter';
import { Poppins } from "next/font/google";

type Props = {
  line: DraftLine | null;
  characters: Character[] | null;
  lineBeingEditedData: LineBeingEditedData;
  newLineOrder: number;
  sceneId: number;
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>;
  closeEditLine: (removeTempLine?: boolean) => void;
  charsDropdownData: DropdownData[] | undefined;
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>;
  onCascadeDelete?: (characterId: number) => Promise<void>;
  onMicError?: (errorType: 'permission' | 'no_device') => void;
  deletingCharacterIds?: Set<number>;
  onLineSaveStart?: (lineId: number) => void;
  onLineSaveComplete?: (lineId: number) => void;
  onLineSaveError?: (lineId: number) => void;
};

const certaSansMedium = localFont({
    src: "../../../../public/fonts/certaSansMedium.otf",
})

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

const noyhSlimMedium = localFont({
    src: "../../../../public/fonts/noyhSlimMedium.ttf",
})

const nunitoVariable = localFont({
    src: "../../../../public/fonts/Nunito-Variable.ttf",
})

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
})

const EditLine = ({
  line,
  characters,
  lineBeingEditedData,
  newLineOrder,
  sceneId,
  setLines,
  closeEditLine,
  charsDropdownData,
  setLineBeingEditedData,
  onCascadeDelete,
  onMicError,
  deletingCharacterIds = new Set(),
  onLineSaveStart,
  onLineSaveComplete,
  onLineSaveError,
}: Props) => {
  const TEMP_LINE_ID = -999;
  const isNewLine = line?.id === TEMP_LINE_ID;
  const lineId = line?.id;
  const { character, text } = lineBeingEditedData;

  const { characters: chars, setCharacters } = useCharacters();
  const voices = useVoicesStore((s: any) => s.voices);
  const isCharactersLoading = characters === null;

  const [isLoading, setIsLoading] = useState(false);
  const [lineMode, setLineMode] = useState<EditLineMode>("default"); // default | trim | delay | speed
  const [lineSpeed, setLineSpeed] = useState<number>(lineBeingEditedData.speed); // 1.0x is the default
  const [lineDelay, setLineDelay] = useState<number>(lineBeingEditedData.delay); // 1 second is the default
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isModePanelClosing, setIsModePanelClosing] = useState(false);
  const [closingMode, setClosingMode] = useState<EditLineMode | null>(null);

  console.log(lineBeingEditedData)
  
  // Animation state for smooth open/close
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Track if any changes have been made
  const [hasChanges, setHasChanges] = useState(false);
  
  // Store trimmed audio blob for later API submission
  const [trimmedAudioBlob, setTrimmedAudioBlob] = useState<Blob | null>(null);
  
  // Store local audio URL for immediate playback
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isWaveformPlaying, setIsWaveformPlaying] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Delete character modal state
  const [isDeleteCharModalOpen, setIsDeleteCharModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

  // Check if microphones are available
  const checkMicrophoneAvailability = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
      return audioInputs.length > 0
    } catch (error) {
      console.error('Error checking microphone availability:', error)
      return false
    }
  }

  // Track if this line was saved with voice cloning in this session
  const [savedWithVoiceCloning, setSavedWithVoiceCloning] = useState<boolean>(false);

  // Separate loading state for voice cloning save
  const [isVoiceCloningSaving, setIsVoiceCloningSaving] = useState<boolean>(false);

  // Transcription state
  const [shouldTranscribe, setShouldTranscribe] = useState<boolean>(true);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<RecordedAudioWaveformRef>(null);
  
  // Store original values to compare against
  const originalValues = useRef({
    text: lineBeingEditedData.text,
    characterId: lineBeingEditedData.character?.id,
    speed: lineBeingEditedData.speed,
    delay: lineBeingEditedData.delay,
  });

  console.log(lineBeingEditedData)

  // Stop recording and cleanup when lineMode changes away from "recording"
  React.useEffect(() => {
    if (lineMode !== "recording") {
      // Clear countdown if it's running
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setCountdown(null);

      // Stop recording if it's active
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      }

      // Always stop any active media streams to release microphone
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
  }, [lineMode, isRecording]);

  // Check for changes whenever relevant values change
  React.useEffect(() => {
    const currentValues = {
      text: lineBeingEditedData.text,
      characterId: lineBeingEditedData.character?.id,
      speed: lineBeingEditedData.speed,
      delay: lineBeingEditedData.delay,
    };
    
    const hasTextChanged = currentValues.text !== originalValues.current.text;
    const hasCharacterChanged = currentValues.characterId !== originalValues.current.characterId;
    const hasSpeedChanged = currentValues.speed !== originalValues.current.speed;
    const hasDelayChanged = currentValues.delay !== originalValues.current.delay;
    const hasAudioTrimmed = trimmedAudioBlob !== null;
    const hasAudioRecorded = recordedAudioBlob !== null;

    // Keep voice-cloned audio even if text changes - voice should take priority over TTS
    // Only reset voice cloning if user explicitly records a new voice or trims audio
    if ((hasAudioRecorded || hasAudioTrimmed) && savedWithVoiceCloning) {
      setSavedWithVoiceCloning(false);
    }

    setHasChanges(hasTextChanged || hasCharacterChanged || hasSpeedChanged || hasDelayChanged || hasAudioTrimmed || hasAudioRecorded || savedWithVoiceCloning);
  }, [lineBeingEditedData.text, lineBeingEditedData.character?.id, lineBeingEditedData.speed, lineBeingEditedData.delay, trimmedAudioBlob, recordedAudioBlob, savedWithVoiceCloning]);

  const handleSave = async () => {
    const trimmed = text?.trim();

    // For existing lines, use the savingLineIds set
    if (lineId && onLineSaveStart && !isNewLine) {
      onLineSaveStart(lineId);
    }

    // For new lines, set isSaving flag and update line data before closing EditLine
    if (isNewLine) {
      setLines((prev) =>
        prev?.map((line) =>
          line.id === TEMP_LINE_ID ? {
            ...line,
            isSaving: true,
            character_id: character?.id || null,
            text: trimmed || '',
            speed: lineBeingEditedData.speed,
            delay: lineBeingEditedData.delay,
            order: lineBeingEditedData.order
          } : line
        ) || null
      );
      // Close edit state but don't remove the temp line (we need it to replace with real line)
      closeEditLine(false);
    }

    setIsLoading(true);
    let res;

    // If we have recorded audio (for voice cloning) or trimmed audio, send it as FormData
    // Also check if we've saved with voice cloning but don't have the blob anymore
    if ((recordedAudioBlob || trimmedAudioBlob || (savedWithVoiceCloning && !isNewLine)) && !isNewLine) {
      // Send recorded/trimmed audio as FormData
      const formData = new FormData();
      
      // Prioritize recorded audio for voice cloning, fallback to trimmed audio
      if (recordedAudioBlob) {
        formData.append('audio', recordedAudioBlob, 'recorded_voice.webm');
        formData.append('isVoiceCloning', 'true'); // Flag to indicate this is for voice cloning
      } else if (trimmedAudioBlob) {
        formData.append('audio', trimmedAudioBlob, 'trimmed_audio.wav');
      } else if (savedWithVoiceCloning) {
        // We have voice-cloned audio but no blob - preserve existing audio
        formData.append('preserveVoiceClonedAudio', 'true');
      }
      
      formData.append('text', trimmed);
      formData.append('characterId', character.id.toString());
      formData.append('order', (lineBeingEditedData.order || 0).toString());
      formData.append('delay', lineBeingEditedData.delay.toString());
      formData.append('speed', lineBeingEditedData.speed.toString());
      formData.append('character_id', character.id.toString());
      formData.append('scene_id', sceneId!.toString());

      res = await fetch(`/api/private/scenes/${sceneId}/lines/${line?.id}`, {
        method: "PATCH",
        body: formData, // No Content-Type header for FormData
      });
    } else {
      // Send regular JSON payload
      const payload = {
        text: trimmed,
        characterId: character.id,
        order: lineBeingEditedData.order,
        delay: lineBeingEditedData.delay,
        speed: lineBeingEditedData.speed,
        ...(character.is_me === false ? { voiceId: lineBeingEditedData.voice?.voice_id } : {}),
      };

      if (isNewLine) {
        res = await fetch(`/api/private/scenes/${sceneId}/lines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/private/scenes/${sceneId}/lines/${line?.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            character_id: character.id,
            scene_id: sceneId,
          }),
        });
      }
    }

    if (res.ok) {
      const result = await res.json();
      console.log('✅ Save result:', result)
      if (isNewLine) {
        const insertedLine = result.insertedLine[0];
        console.log('📝 Inserted line from DB:', insertedLine);
        console.log('🔍 TEMP_LINE_ID:', TEMP_LINE_ID);
        // Replace the temporary line with the actual saved line from the database
        setLines((prev) => {
          console.log('📊 Previous state before update:', prev);
          console.log('🔎 Looking for line with id:', TEMP_LINE_ID);
          const foundTemp = prev?.find(line => line.id === TEMP_LINE_ID);
          console.log('🎯 Found temp line:', foundTemp);

          if (!prev) return [insertedLine];
          const updated = prev.map(line => {
            const willReplace = line.id === TEMP_LINE_ID;
            console.log(`  Line ${line.id}: ${willReplace ? '🔄 REPLACING' : '✓ keeping'}`);
            // Make sure isSaving is not set on the inserted line
            return willReplace ? { ...insertedLine, isSaving: false } : line;
          }).sort((a, b) => (a.order || 0) - (b.order || 0));
          console.log('🎉 New state after update:', updated);
          return updated;
        });
      } else {
        const { id, updates } = result;
        console.log('API Response updates:', updates);
        
        // Update local audio URL if we got a new one from the API
        if (updates.audio_url) {
          setLocalAudioUrl(updates.audio_url);
        }
        
        setLines((lines) =>
          lines?.map((line) => {
            if (line.id === lineId) {
              // Preserve original line data and apply updates
              const updatedLine = { 
                ...line, // Keep all original data including character_id
                ...updates, // Apply API updates
                id: Number(id) // Ensure ID is correct number type
              };
              console.log('Updated line:', updatedLine);
              console.log('Original line character_id:', line.character_id);
              console.log('Updated line character_id:', updatedLine.character_id);
              return updatedLine;
            }
            return line;
          }) || null
        );
      }

      // If we saved without recorded/trimmed audio, this is TTS (not voice cloned)
      if (!recordedAudioBlob && !trimmedAudioBlob) {
        setSavedWithVoiceCloning(false);
      }

      // Notify parent that saving completed successfully (only for existing lines)
      if (lineId && onLineSaveComplete && !isNewLine) {
        onLineSaveComplete(lineId);
      }

      // Only close EditLine for existing lines (new lines already closed)
      if (!isNewLine) {
        closeEditLine();
      }
    } else {
      console.log("Save failed - request body:", trimmedAudioBlob ? "FormData with audio" : "JSON payload")
      console.error("Save failed");

      // For new lines, remove isSaving flag on error
      if (isNewLine) {
        setLines((prev) =>
          prev?.map((line) =>
            line.id === TEMP_LINE_ID ? { ...line, isSaving: false } : line
          ) || null
        );
      }

      // Notify parent that saving failed (only for existing lines)
      if (lineId && onLineSaveError && !isNewLine) {
        onLineSaveError(lineId);
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (lineId === TEMP_LINE_ID) return closeEditLine();

    if (!lineId || !sceneId) {
      console.error('Missing lineId or sceneId for delete operation');
      return;
    }

    // Immediately set the line to deleting state and close EditLine
    setLines((prev) =>
      prev?.map((line) =>
        line.id === lineId ? { ...line, isDeleting: true } : line
      ) || null
    );
    closeEditLine();

    try {
      const res = await fetch(`/api/private/scenes/${sceneId}/lines/${lineId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove the line from the list after successful deletion
        setLines((prev) => prev?.filter((line) => line.id !== lineId) || null);
      } else {
        console.error('Failed to delete line');
        // If deletion failed, remove the deleting state
        setLines((prev) =>
          prev?.map((line) =>
            line.id === lineId ? { ...line, isDeleting: false } : line
          ) || null
        );
      }
    } catch (error) {
      console.error('Error during delete:', error);
      // If deletion failed, remove the deleting state
      setLines((prev) =>
        prev?.map((line) =>
          line.id === lineId ? { ...line, isDeleting: false } : line
        ) || null
      );
    }
  };
  
  const handleSaveLineSpeed = () => {
    console.log(lineSpeed)
    setLineBeingEditedData(prev => ({...prev, speed: lineSpeed}))
    setClosingMode("speed")
    setIsModePanelClosing(true)
    setTimeout(() => {
      setLineMode("default")
      setIsModePanelClosing(false)
      setClosingMode(null)
    }, 200)
  }

  const handleSaveLineDelay = () => {
    setLineBeingEditedData(prev => ({...prev, delay: lineDelay}))
    setClosingMode("delay")
    setIsModePanelClosing(true)
    setTimeout(() => {
      setLineMode("default")
      setIsModePanelClosing(false)
      setClosingMode(null)
    }, 200)
  }

  // Handle when audio is trimmed - store the blob and mark as changed
  const handleAudioTrimmed = (trimmedBlob: Blob) => {
    setTrimmedAudioBlob(trimmedBlob);

    // Create local URL for immediate playback
    const localUrl = URL.createObjectURL(trimmedBlob);
    setLocalAudioUrl(localUrl);

    setHasChanges(true);
  }

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check if there's audio available to trim (either existing audio_url or recorded audio)
  const hasAudioToTrim = (): boolean => {
    return !!(line?.audio_url || recordedAudioBlob || localAudioUrl);
  };

  // Start recording with countdown
  const startRecording = async () => {
    // If permission not yet granted, request it
    if (!micPermissionGranted) {
      // First check if microphones are available
      const hasMicrophone = await checkMicrophoneAvailability()
      if (!hasMicrophone) {
        onMicError?.('no_device')
        return
      }

      try {
        console.log('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1
          }
        });
        console.log('Microphone access granted');
        // Stop the stream immediately since we just needed permission
        stream.getTracks().forEach(track => track.stop());
        setMicPermissionGranted(true);
        // Continue to countdown below
      } catch (error) {
        console.error('Failed to access microphone:', error);
        // Check the specific error to determine if it's a permission issue or no device
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          onMicError?.('no_device')
        } else {
          onMicError?.('permission')
        }
        return; // Only return on error
      }
    }

    // Show recording mode immediately
    setLineMode("recording");

    // Start countdown from 2
    setCountdown(2);

    // Countdown timer
    let currentCount = 2;
    countdownTimerRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        // Countdown finished, clear it and start actual recording
        setCountdown(null);
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        // Start actual recording
        startActualRecording();
      }
    }, 1000);
  };

  // Actual recording logic
  const startActualRecording = async () => {
    try {
      console.log('Starting recording with granted permission...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      console.log('Microphone access granted, starting recording...');

      // Store the stream reference for cleanup
      mediaStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, total chunks:', audioChunks.length);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        setLineMode("voice"); // Switch to voice mode to show waveform + buttons

        // Stop all tracks to release microphone
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      console.log('MediaRecorder started, setting up timer...');
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        console.log('Timer tick');
        setRecordingTime(prev => {
          const newTime = prev + 1;
          console.log('Recording time:', newTime);
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      // Clean up stream on error
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      onMicError?.('permission');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }

    // Ensure microphone is released even if mediaRecorder is not active
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Handle rerecording - clear current recording and start new one
  const handleRerecord = () => {
    // Clear the current recorded audio and reset playing state
    setRecordedAudioBlob(null);
    setRecordingTime(0);
    setIsWaveformPlaying(false); // Reset playing state for new recording
    setLineMode("default");

    // Start new recording immediately
    setTimeout(() => {
      startRecording();
    }, 100); // Small delay to ensure state is updated
  };

  // Transcribe audio using Deepgram
  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recorded_voice.webm');

      const res = await fetch('/api/private/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data.transcript;
      } else {
        console.error('Transcription failed:', await res.text());
        return null;
      }
    } catch (error) {
      console.error('Transcription error:', error);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  // Save voice cloning (similar to handleSaveLineDelay/Speed)
  const handleSaveVoiceCloning = async () => {
    if (!recordedAudioBlob || !character?.id || !text?.trim()) return;

    console.log('Starting voice cloning...');
    console.log('recordedAudioBlob size:', recordedAudioBlob.size);
    console.log('character.id:', character.id);
    console.log('text:', text.trim());
    console.log('sceneId:', sceneId);
    console.log('line?.id:', line?.id);
    console.log('shouldTranscribe:', shouldTranscribe);

    // Use separate loading state for voice cloning to avoid affecting main save button
    setIsVoiceCloningSaving(true);

    try {
      // Transcribe audio if checkbox is checked
      let transcribedText: string | null = null;
      if (shouldTranscribe) {
        transcribedText = await transcribeAudio(recordedAudioBlob);
        if (transcribedText) {
          console.log('Transcribed text:', transcribedText);
          // Update the line text with transcribed text
          setLineBeingEditedData(prev => ({ ...prev, text: transcribedText || prev.text }));
        } else {
          console.warn('Transcription returned empty, using existing text');
        }
      }

      // Create FormData for voice cloning
      const formData = new FormData();
      formData.append('audio', recordedAudioBlob, 'recorded_voice.webm');
      formData.append('isVoiceCloning', 'true');
      formData.append('text', transcribedText || text.trim());
      formData.append('characterId', character.id.toString());
      formData.append('voiceId', lineBeingEditedData.voice?.voice_id || '');
      formData.append('order', (lineBeingEditedData.order || 0).toString());
      formData.append('delay', lineBeingEditedData.delay.toString());
      formData.append('speed', lineBeingEditedData.speed.toString());
      formData.append('character_id', character.id.toString());
      formData.append('scene_id', sceneId!.toString());

      console.log('Sending API request to:', `/api/private/scenes/${sceneId}/lines/${line?.id}`);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File(${value.size} bytes)` : value);
      }

      const res = await fetch(`/api/private/scenes/${sceneId}/lines/${line?.id}`, {
        method: "PATCH",
        body: formData,
      });

      console.log('API Response status:', res.status);
      console.log('API Response ok:', res.ok);

      if (res.ok) {
        const data = await res.json();
        console.log('API Response data:', data);
        // Update the line with new audio URL
        if (data.updates.audio_url) {
          setLocalAudioUrl(data.updates.audio_url);
        }

        // Mark that this line was saved with voice cloning
        setSavedWithVoiceCloning(true);

        setLineMode("default");
        setRecordedAudioBlob(null);
        setRecordingTime(0);
        setShouldTranscribe(false); // Reset checkbox

        // Enable the main save button after voice cloning
        setHasChanges(true);
      } else {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Voice cloning failed: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Voice cloning error:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      alert(`Voice cloning failed. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVoiceCloningSaving(false);
    }
  };

  // Cleanup local URL and recording timer when component unmounts
  React.useEffect(() => {
    return () => {
      // Revoke local audio URL
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }

      // Clear all timers
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }

      // Stop media recorder
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // CRITICAL: Always release microphone on unmount
      if (mediaStreamRef.current) {
        console.log('Cleanup: Releasing microphone on unmount');
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('Cleanup: Stopped track:', track.kind, track.label);
        });
        mediaStreamRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run on unmount

  // Animation useEffect - trigger opening animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30); // Faster entrance delay
    return () => clearTimeout(timer);
  }, []);

  // Animated close function
  const handleAnimatedClose = () => {
    // Stop recording and release microphone immediately when closing
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Clear all timers
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    // Release microphone immediately
    if (mediaStreamRef.current) {
      console.log('Closing: Releasing microphone');
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setIsClosing(true);
    setIsVisible(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      closeEditLine();
    }, 200); // Faster animation duration
  };

  const toggleLineMode = (btnMode: EditLineMode) => {
    // If recording is active, stop it when switching to other modes
    if (isRecording && btnMode !== "recording") {
      stopRecording();
    }

    if (lineMode === btnMode) {
      setClosingMode(btnMode)
      setIsModePanelClosing(true)
      setTimeout(() => {
        setLineMode("default")
        setIsModePanelClosing(false)
        setClosingMode(null)
      }, 200)
    } else if (btnMode) {
      setLineMode(btnMode)
    }
  }


  // Helper function to determine if a line is voice-cloned (not TTS)
  const isVoiceClonedLine = () => {
    // Never show for "me" characters since you don't record for yourself
    if (character?.is_me) return false;

    // If we have recorded audio in this session, it's voice-cloned
    if (recordedAudioBlob) return true;

    // If we saved with voice cloning in this session, it's voice-cloned
    if (savedWithVoiceCloning) return true;

    // For existing lines, check if they have the is_voice_cloned flag from database
    if (line?.is_voice_cloned) {
      return true;
    }

    return false;
  }


return (
  <div
    data-edit-line="true"
    className={clsx(
      "rounded-xl w-full p-4 space-y-4 relative shadow-lg mb-4 bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] border-2 border-black",
      "transition-all duration-200 ease-out transform-gpu",
      isVisible && !isClosing 
        ? "opacity-100 scale-100 translate-y-0 shadow-xl" 
        : "opacity-0 scale-95 translate-y-2 shadow-lg",
      isLoading ? "pointer-events-none opacity-75" : ""
    )}
  >
    {/* Close Button (X) */}
    <button
      onClick={handleAnimatedClose}
      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-white border border-black shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
    >
      <FontAwesomeIcon icon={faXmark} className="text-gray-700 text-sm group-hover:scale-110 transition-transform duration-200" />
    </button>

    {/* Character Dropdown */}
    <div className="flex justify-between pr-10">
      {isCharactersLoading ? (
        <div className="px-4 py-2 rounded-lg bg-white border border-black text-gray-600 font-medium flex items-center gap-2 shadow-md">
          <div className="w-4 h-4 border-2 border-[#72a4f2] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-quicksand">Loading...</span>
        </div>
      ) : (
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="px-4 py-2 rounded-lg border border-black font-medium transition-all duration-200 inline-flex items-center gap-2 text-sm bg-white text-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer font-quicksand"
          >
            <div className="w-6 h-6 rounded-full bg-[#72a4f2] border border-black flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
            </div>
            <span className="truncate flex-1 text-left min-w-0 max-w-[120px]">
              {character ? `${character.name}${character.is_me ? " (me)" : ""}` : (isCharactersLoading ? "Loading..." : "Select Character")}
            </span>
            <FontAwesomeIcon icon={faChevronDown} className="text-gray-600 text-xs" />
          </div>
          <div
            tabIndex={0}
            className="dropdown-content bg-white rounded-xl z-50 w-64 shadow-xl border-2 border-black overflow-hidden mt-2"
          >
            {charsDropdownData?.map((item, index) => {
              // Check if this is a character item (not "New Character")
              const isCharacterItem = !item.label.startsWith("+ New Character");
              const isNewCharacterItem = item.label.startsWith("+ New Character");
              const character = isCharacterItem ? characters?.find(c => 
                item.label === (c.is_me ? `${c.name} (me)` : c.name)
              ) : null;
              
              return (
                <div key={index} className="w-full">
                  <div
                    className={`${item.className} flex items-center w-full px-4 py-3 transition-colors duration-200 font-quicksand text-left ${
                      character && deletingCharacterIds.has(character.id) 
                        ? 'cursor-not-allowed opacity-60' 
                        : 'hover:bg-gray-50 cursor-pointer'
                    } ${
                      index === 0 ? 'rounded-t-xl' : ''
                    } ${
                      index === charsDropdownData.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      // Don't allow clicking if character is being deleted
                      if (character && deletingCharacterIds.has(character.id)) return;
                      
                      item.onClick();
                      // Close dropdown immediately for character selection
                      const activeElement = document.activeElement as HTMLElement;
                      if (activeElement) {
                        activeElement.blur();
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isNewCharacterItem ? (
                        <>
                          <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center bg-white">
                            <FontAwesomeIcon icon={faPlus} className="text-black text-xs" />
                          </div>
                          <span className="truncate text-left font-medium text-gray-800 w-32">
                            New Character
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-[#72a4f2] border border-black flex items-center justify-center">
                            <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                          </div>
                          <span className="truncate text-left font-medium w-32">
                            {character && deletingCharacterIds.has(character.id) ? (
                              <span className="text-gray-500">
                                Deleting
                                <span className="inline-block animate-pulse">...</span>
                              </span>
                            ) : (
                              item.label
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Always reserve space for trash button to align everything */}
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      {isCharacterItem && character && !character.is_me && (
                        <button
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200 flex items-center justify-center border border-red-200 hover:border-red-300"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCharacterToDelete(character);
                            setIsDeleteCharModalOpen(true);
                          }}
                          title={`Delete ${character.name}`}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>


    {/* Textarea */}
    <textarea
      placeholder="Type the line..."
      value={text || ""}
      onChange={(e) => {
        setLineBeingEditedData((prev) => ({ ...prev, text: e.target.value }))
      }}
      className={`w-full min-h-[80px] px-4 py-3 rounded-lg text-base resize-none border border-black focus:outline-none transition-all duration-200 bg-white text-gray-800 shadow-md focus:shadow-lg focus:border-[#72a4f2] ${poppins.className}`}
      style={{ fontWeight: 500 }}
    />


    {/* Waveform and Mode Panels Container */}
    {line && (localAudioUrl || line.audio_url) && (
      <div className="relative min-h-[80px]">
        {/* Default Waveform */}
        <div className={clsx(
          "transition-opacity duration-200 ease-in-out",
          lineMode === "default"
            ? "opacity-100 relative"
            : "opacity-0 pointer-events-none absolute inset-0"
        )}>
          {(lineMode === "default" || isModePanelClosing) && (
            <>
              {console.log('Speed being passed to Waveform:', lineBeingEditedData.speed)}
              <Waveform
                key={localAudioUrl || line.audio_url}
                src={localAudioUrl || line.audio_url!}
                speed={lineBeingEditedData.speed || 1.0}
              />
            </>
          )}
        </div>

        {/* Trim Panel */}
        {(lineMode === "trim" || (isModePanelClosing && closingMode === "trim")) && (
          <div className={clsx(
            "transition-opacity duration-200 ease-in-out",
            lineMode === "trim" && !isModePanelClosing
              ? "opacity-100 relative"
              : "opacity-0 pointer-events-none absolute inset-0"
          )}>
            <>
              {console.log('Speed being passed to BeautifulWaveform:', lineBeingEditedData.speed)}
              <BeautifulWaveform
                key={localAudioUrl || line.audio_url}
                line={{...line, audio_url: localAudioUrl || line.audio_url}}
                setLineMode={setLineMode}
                onAudioTrimmed={handleAudioTrimmed}
                speed={lineBeingEditedData.speed || 1.0}
              />
            </>
          </div>
        )}

        {/* Speed Panel */}
        {(lineMode === "speed" || (isModePanelClosing && closingMode === "speed")) && (
          <div className={clsx(
            "transition-opacity duration-200 ease-in-out",
            lineMode === "speed" && !isModePanelClosing
              ? "opacity-100 relative"
              : "opacity-0 pointer-events-none absolute inset-0"
          )}>
            <div className="bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#72a4f2] border border-black flex items-center justify-center">
                  <FontAwesomeIcon icon={faPersonRunning} className="text-white text-xs" />
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={lineSpeed}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    onChange={(e) => setLineSpeed(Number(e.target.value))}
                  />
                </div>
                <div className="px-3 py-1 rounded-xl text-xs font-bold w-14 text-center bg-[#72a4f2] text-white shadow-sm">
                  {lineSpeed}x
                </div>
                <button
                  onClick={handleSaveLineSpeed}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg border border-gray-300"
                  style={{backgroundColor: '#f8f9fa', color: '#000000'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                    e.currentTarget.style.borderColor = '#000000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                    e.currentTarget.style.borderColor = '#dee2e6'
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} className="text-sm" />
                </button>
                <button
                  onClick={() => {
                    setClosingMode("speed")
                    setIsModePanelClosing(true)
                    setTimeout(() => {
                      setLineMode("default")
                      setIsModePanelClosing(false)
                      setClosingMode(null)
                    }, 200)
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg border border-gray-300"
                  style={{backgroundColor: '#f8f9fa', color: '#000000'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                    e.currentTarget.style.borderColor = '#000000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                    e.currentTarget.style.borderColor = '#dee2e6'
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delay Panel */}
        {(lineMode === "delay" || (isModePanelClosing && closingMode === "delay")) && (
          <div className={clsx(
            "transition-opacity duration-200 ease-in-out",
            lineMode === "delay" && !isModePanelClosing
              ? "opacity-100 relative"
              : "opacity-0 pointer-events-none absolute inset-0"
          )}>
            <div className="bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ffa05a] border border-black flex items-center justify-center">
                  <FontAwesomeIcon icon={faHand} className="text-white text-xs" />
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={lineDelay}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    onChange={(e) => setLineDelay(Number(e.target.value))}
                  />
                </div>
                <div className="px-3 py-1 rounded-xl text-xs font-bold w-14 text-center bg-[#ffa05a] text-white shadow-sm">
                  {lineDelay}s
                </div>
                <button
                  onClick={handleSaveLineDelay}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg border border-gray-300"
                  style={{backgroundColor: '#f8f9fa', color: '#000000'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                    e.currentTarget.style.borderColor = '#000000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                    e.currentTarget.style.borderColor = '#dee2e6'
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} className="text-sm" />
                </button>
                <button
                  onClick={() => {
                    setClosingMode("delay")
                    setIsModePanelClosing(true)
                    setTimeout(() => {
                      setLineMode("default")
                      setIsModePanelClosing(false)
                      setClosingMode(null)
                    }, 200)
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg border border-gray-300"
                  style={{backgroundColor: '#f8f9fa', color: '#000000'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                    e.currentTarget.style.borderColor = '#000000'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                    e.currentTarget.style.borderColor = '#dee2e6'
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Voice Cloning Mode - Reorganized Layout */}
    {lineMode === "voice" && recordedAudioBlob && (
      <div className="bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] rounded-2xl p-4 space-y-3 shadow-lg relative overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:fade-out transition-all duration-300 ease-in-out">
        {/* Floating orange circles like snow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-2 h-2 bg-[#ffa05a] rounded-full opacity-5" 
               style={{
                 top: '25%', 
                 left: '10%',
                 animation: 'float 9s ease-in-out infinite, fadeInOut 7s ease-in-out infinite'
               }}></div>
          <div className="absolute w-1.5 h-1.5 bg-[#ffa05a] rounded-full opacity-6" 
               style={{
                 top: '50%', 
                 right: '20%',
                 animation: 'float 13s ease-in-out infinite reverse, fadeInOut 9s ease-in-out infinite 1.5s'
               }}></div>
          <div className="absolute w-1 h-1 bg-[#ffa05a] rounded-full opacity-8" 
               style={{
                 top: '70%', 
                 left: '30%',
                 animation: 'float 11s ease-in-out infinite, fadeInOut 6s ease-in-out infinite 2.5s'
               }}></div>
          <div className="absolute w-2.5 h-2.5 bg-[#ffa05a] rounded-full opacity-4" 
               style={{
                 bottom: '25%', 
                 right: '15%',
                 animation: 'float 16s ease-in-out infinite reverse, fadeInOut 8s ease-in-out infinite 3.5s'
               }}></div>
          <div className="absolute w-1.5 h-1.5 bg-[#ffa05a] rounded-full opacity-7" 
               style={{
                 bottom: '10%', 
                 left: '25%',
                 animation: 'float 12s ease-in-out infinite, fadeInOut 5s ease-in-out infinite 4.5s'
               }}></div>
        </div>
        
        {/* Waveform with all controls */}
        <div className="space-y-3">
          {/* Transcription checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={shouldTranscribe}
                onChange={(e) => setShouldTranscribe(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-7 h-7 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                shouldTranscribe 
                  ? 'bg-[#ffa05a] border-[#ffa05a] shadow-md' 
                  : 'bg-white border-gray-400 hover:border-[#ffa05a]'
              }`}>
                {shouldTranscribe && (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" strokeWidth="3">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-base font-medium text-gray-700" style={{fontFamily: 'Comic Sans MS, cursive, sans-serif'}}>
              Auto-transcribe voice to text?
            </span>
          </label>

          {/* Waveform component */}
          <RecordedAudioWaveform
            ref={waveformRef}
            audioBlob={recordedAudioBlob}
            onPlayingChange={setIsWaveformPlaying}
          />

          {/* All buttons on same line: Play and Redo on left, others on right */}
          <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-lg p-3 shadow-sm">
            {/* Play and Redo buttons on left */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  waveformRef.current?.togglePlayback();
                }}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: '#FFA05A',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF8A3A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFA05A';
                }}
              >
                <FontAwesomeIcon icon={isWaveformPlaying ? faPause : faPlay} className="text-xs" />
                {isWaveformPlaying ? 'Pause' : 'Play'}
              </button>

              {/* Redo Button with text */}
              <button
                onClick={handleRerecord}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
                style={{
                  backgroundColor: '#72A5F2',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#5B94E8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#72A5F2'
                  }
                }}
              >
                <FontAwesomeIcon icon={faRedo} className="text-xs" />
                Redo
              </button>
            </div>

            {/* Action buttons on right */}
            <div className="flex items-center gap-2">
              {/* Save Voice Button */}
              <button
                onClick={handleSaveVoiceCloning}
                disabled={isVoiceCloningSaving || isTranscribing}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 border border-gray-300"
                style={{backgroundColor: '#f8f9fa', color: '#000000'}}
                onMouseEnter={(e) => {
                  if (!isVoiceCloningSaving && !isTranscribing) {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                    e.currentTarget.style.borderColor = '#000000'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isVoiceCloningSaving && !isTranscribing) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                    e.currentTarget.style.borderColor = '#dee2e6'
                  }
                }}
              >
                {(isVoiceCloningSaving || isTranscribing) ? (
                  <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FontAwesomeIcon icon={faCheck} className="text-sm" />
                )}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setLineMode("default");
                  setRecordedAudioBlob(null);
                  setRecordingTime(0);
                  setHasChanges(false);
                }}
                disabled={isVoiceCloningSaving}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 border border-gray-300"
                style={{backgroundColor: '#f8f9fa', color: '#000000'}}
                onMouseEnter={(e) => {
                  if (!isVoiceCloningSaving) {
                    e.currentTarget.style.backgroundColor = '#e9ecef'
                    e.currentTarget.style.borderColor = '#000000'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isVoiceCloningSaving) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                    e.currentTarget.style.borderColor = '#dee2e6'
                  }
                }}
              >
                <FontAwesomeIcon icon={faXmark} className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Action Buttons */}
    {character && !character.is_me && (
      <div className="flex gap-2">
        {[
          {
            img: faScissors,
            mode: "trim",
            label: "Trim",
            color: "#72a4f2"
          },
          {
            img: faPersonRunning,
            mode: "speed",
            label: "Speed",
            color: "#72a4f2"
          },
          {
            img: faHand,
            mode: "delay",
            label: "Delay",
            color: "#ffa05a"
          }
        ].map((item, i) => {
          const isTrimButton = item.mode === "trim";
          const isDisabled = isTrimButton && !hasAudioToTrim();
          const isActive = lineMode === item.mode;

          return (
            <button
              key={i}
              disabled={isDisabled}
              className={`px-3 py-2 rounded-lg border border-black font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg text-sm font-quicksand ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isActive ? 'text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: isActive ? item.color : undefined
              }}
              onClick={() => !isDisabled && toggleLineMode(item.mode as EditLineMode)}
            >
              <FontAwesomeIcon icon={item.img} className="text-sm" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    )}

    {/* Save and Delete Actions */}
    <div className="flex items-center justify-between pt-2 border-t border-gray-300">
      <button
        onClick={handleDelete}
        className="px-3 py-2 rounded-lg border border-black font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-quicksand"
      >
        <FontAwesomeIcon icon={faTrash} className="text-sm" />
        <span>Delete</span>
      </button>

      <button
        onClick={handleSave}
        disabled={isLoading || !hasChanges || !lineBeingEditedData.character || !text?.trim() || lineMode === "voice"}
        className={`px-4 py-2 rounded-lg border border-black font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl text-white text-sm font-quicksand ${
          (isLoading || !hasChanges || !lineBeingEditedData.character || !text?.trim() || lineMode === "voice") ? "opacity-50 cursor-not-allowed" : ""
        }`}
        style={{
          backgroundColor: '#72a4f2'
        }}
      >
        {isLoading ? (
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
          </div>
        ) : (
          <FontAwesomeIcon icon={faCheck} className="text-sm" />
        )}
        <span>{isLoading ? "Saving..." : "Save"}</span>
      </button>
    </div>

    {/* Voice Recording Section */}
    {character && !character.is_me && lineMode !== "voice" && (
      <div>
        {/* Recording Controls */}
        {lineMode !== "recording" && !recordedAudioBlob && (
          <button
            onClick={startRecording}
            className="w-full px-4 py-2 rounded-lg border border-black font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg bg-[#ffa05a] text-white hover:bg-[#ff8a3a] text-sm font-quicksand"
          >
            <FontAwesomeIcon icon={faMicrophone} className="text-sm" />
            <span>Record Voice</span>
          </button>
        )}

        {/* Recording in Progress or Countdown */}
        {lineMode === "recording" && (
          <div className="w-full bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] rounded-2xl p-4 shadow-lg relative overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300">
            {/* Floating orange circles like snow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute w-1.5 h-1.5 bg-[#ffa05a] rounded-full opacity-6"
                   style={{
                     top: '30%',
                     left: '20%',
                     animation: 'float 10s ease-in-out infinite, fadeInOut 8s ease-in-out infinite'
                   }}></div>
              <div className="absolute w-1 h-1 bg-[#ffa05a] rounded-full opacity-8"
                   style={{
                     top: '60%',
                     right: '30%',
                     animation: 'float 14s ease-in-out infinite reverse, fadeInOut 6s ease-in-out infinite 2s'
                   }}></div>
              <div className="absolute w-2 h-2 bg-[#ffa05a] rounded-full opacity-4"
                   style={{
                     bottom: '40%',
                     left: '15%',
                     animation: 'float 12s ease-in-out infinite, fadeInOut 7s ease-in-out infinite 3s'
                   }}></div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center z-10">
                <div className="text-6xl font-bold text-white drop-shadow-2xl"
                     style={{
                       textShadow: '0 0 30px rgba(255,255,255,0.5)'
                     }}>
                  {countdown}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="font-semibold text-red-700 text-sm font-quicksand">
                  {countdown !== null ? 'Get ready...' : 'Recording...'}
                </span>
                {isRecording && (
                  <span className="font-mono text-xs font-bold text-red-700 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium text-sm font-quicksand"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                >
                  <FontAwesomeIcon icon={faStop} className="text-xs" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )}


    {/* Delete Character Modal */}
    {isDeleteCharModalOpen && characterToDelete && sceneId && (
      <ModalDeleteCharacter
        character={characterToDelete}
        sceneId={sceneId}
        setIsDeleteCharModalOpen={setIsDeleteCharModalOpen}
        onCascadeDelete={onCascadeDelete}
        onCharacterDeleted={() => {
          // Reset character selection if the deleted character was selected
          if (character?.id === characterToDelete.id) {
            setLineBeingEditedData(prev => ({ ...prev, character: null, voice: null }));
          }
        }}
      />
    )}

  </div>
  );
};

export default EditLine;
