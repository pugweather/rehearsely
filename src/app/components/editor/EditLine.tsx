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
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>;
  closeEditLine: () => void;
  charsDropdownData: DropdownData[] | undefined;
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>;
  onCascadeDelete?: (characterId: number) => Promise<void>;
  onMicError?: (errorType: 'permission' | 'no_device') => void;
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
  setLines,
  closeEditLine,
  charsDropdownData,
  setLineBeingEditedData,
  onCascadeDelete,
  onMicError,
}: Props) => {
  const TEMP_LINE_ID = -999;
  const isNewLine = line?.id === TEMP_LINE_ID;
  const sceneId = line?.scene_id;
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
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

    // If text has changed after voice cloning, reset the voice cloning flag
    // This handles the edge case where changing text reverts back to TTS
    if (hasTextChanged && savedWithVoiceCloning) {
      setSavedWithVoiceCloning(false);
    }

    setHasChanges(hasTextChanged || hasCharacterChanged || hasSpeedChanged || hasDelayChanged || hasAudioTrimmed || hasAudioRecorded);
  }, [lineBeingEditedData.text, lineBeingEditedData.character?.id, lineBeingEditedData.speed, lineBeingEditedData.delay, trimmedAudioBlob, recordedAudioBlob, savedWithVoiceCloning]);

  const handleSave = async () => {
    const trimmed = text?.trim();


    setIsLoading(true);
    let res;

    // If we have recorded audio (for voice cloning) or trimmed audio, send it as FormData
    if ((recordedAudioBlob || trimmedAudioBlob) && !isNewLine) {
      // Send recorded/trimmed audio as FormData
      const formData = new FormData();
      
      // Prioritize recorded audio for voice cloning, fallback to trimmed audio
      if (recordedAudioBlob) {
        formData.append('audio', recordedAudioBlob, 'recorded_voice.webm');
        formData.append('isVoiceCloning', 'true'); // Flag to indicate this is for voice cloning
      } else if (trimmedAudioBlob) {
        formData.append('audio', trimmedAudioBlob, 'trimmed_audio.wav');
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
      console.log(result)
      if (isNewLine) {
        const insertedLine = result.insertedLine[0];
        // Replace the temporary line with the actual saved line from the database
        setLines((prev) => {
          if (!prev) return [insertedLine];
          return prev.map(line => 
            line.id === -999 ? insertedLine : line
          ).sort((a, b) => (a.order || 0) - (b.order || 0));
        });
      } else {
        const { id, updates } = result;
        console.log('API Response updates:', updates);
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

      closeEditLine();
    } else {
      console.log("Save failed - request body:", trimmedAudioBlob ? "FormData with audio" : "JSON payload")
      console.error("Save failed");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (lineId === TEMP_LINE_ID) return closeEditLine();

    // Immediately set the line to deleting state and close EditLine
    setLines((prev) => 
      prev?.map((line) => 
        line.id === lineId ? { ...line, isDeleting: true } : line
      ) || null
    );
    closeEditLine();

    // Perform the actual deletion
    const res = await fetch(`/api/private/scenes/${sceneId}/lines/${lineId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lineId }),
    });

    if (res.ok) {
      // Remove the line from the list after successful deletion
      setLines((prev) => prev?.filter((line) => line.id !== lineId) || null);
    } else {
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
    setLineMode("default")
  }

  const handleSaveLineDelay = () => {
    setLineBeingEditedData(prev => ({...prev, delay: lineDelay}))
    setLineMode("default")
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

  // Start recording
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
        // Auto-start recording now that permission is granted
        // Fall through to the recording logic below
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
      // Don't return here - continue to start recording
    }

    // Permission already granted, start actual recording
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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Close any other popups - recording mode is now active
      setLineMode("recording");

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

  // Save voice cloning (similar to handleSaveLineDelay/Speed)
  const handleSaveVoiceCloning = async () => {
    if (!recordedAudioBlob || !character?.id || !text?.trim()) return;

    console.log('Starting voice cloning...');
    console.log('recordedAudioBlob size:', recordedAudioBlob.size);
    console.log('character.id:', character.id);
    console.log('text:', text.trim());
    console.log('sceneId:', sceneId);
    console.log('line?.id:', line?.id);

    // Use separate loading state for voice cloning to avoid affecting main save button
    setIsVoiceCloningSaving(true);

    try {
      // Create FormData for voice cloning
      const formData = new FormData();
      formData.append('audio', recordedAudioBlob, 'recorded_voice.webm');
      formData.append('isVoiceCloning', 'true');
      formData.append('text', text.trim());
      formData.append('characterId', character.id.toString());
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
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
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
      setLineMode("default")
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
                  <button
                    className={`${item.className} flex items-center w-full px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 font-quicksand text-left ${
                      index === 0 ? 'rounded-t-xl' : ''
                    } ${
                      index === charsDropdownData.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
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
                            {item.label}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Always reserve space for trash button to align everything */}
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      {isCharacterItem && character && (
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
                  </button>
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


    {/* Default Waveform to show when not in edit mode for other characters */}
    {lineMode === "default" && line && (localAudioUrl || line.audio_url) && (
      <>
        {console.log('Speed being passed to Waveform:', lineBeingEditedData.speed)}
        <Waveform src={localAudioUrl || line.audio_url!} speed={lineBeingEditedData.speed || 1.0} />
      </>
    )}

    {/* Action Buttons UI */}
    {lineMode === "trim" && line && (localAudioUrl || line.audio_url) && (
      <>
        {console.log('Speed being passed to BeautifulWaveform:', lineBeingEditedData.speed)}
        <BeautifulWaveform
          line={{...line, audio_url: localAudioUrl || line.audio_url}}
          setLineMode={setLineMode}
          onAudioTrimmed={handleAudioTrimmed}
          speed={lineBeingEditedData.speed || 1.0}
        />
      </>
    )}

    {lineMode === "speed" && 
      <div className="p-3 rounded-lg border-2 border-black bg-white shadow-md animate-in slide-in-from-top-2 fade-in duration-300">
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
          <div className="px-3 py-1 rounded-lg text-xs font-bold w-14 text-center bg-[#72a4f2] border border-black text-white shadow-md">
            {lineSpeed}x
          </div>
          <button
            onClick={handleSaveLineSpeed}
            className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg bg-[#72a4f2] border border-black group"
          >
            <FontAwesomeIcon icon={faCheck} className="text-xs group-hover:scale-110 transition-transform duration-200" />
          </button>
          <button
            onClick={() => setLineMode("default")}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg bg-white border border-black text-gray-700 group"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>
    }

    {lineMode === "delay" && 
      <div className="p-3 rounded-lg border-2 border-black bg-white shadow-md animate-in slide-in-from-top-2 fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#ffa05a] border border-black flex items-center justify-center">
            <FontAwesomeIcon icon={faHand} className="text-white text-xs" />
          </div>
          <div className="flex-1">
            <input 
              type="range" 
              min={0} 
              max={10} 
              step={0.1} 
              value={lineDelay} 
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer" 
              onChange={(e) => setLineDelay(Number(e.target.value))}
            />
          </div>
          <div className="px-3 py-1 rounded-lg text-xs font-bold w-14 text-center bg-[#ffa05a] border border-black text-white shadow-md">
            {lineDelay}s
          </div>
          <button
            onClick={handleSaveLineDelay}
            className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg bg-[#ffa05a] border border-black group"
          >
            <FontAwesomeIcon icon={faCheck} className="text-xs group-hover:scale-110 transition-transform duration-200" />
          </button>
          <button
            onClick={() => setLineMode("default")}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg bg-white border border-black text-gray-700 group"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>
    }

    {/* Voice Cloning Mode - Reorganized Layout */}
    {lineMode === "voice" && recordedAudioBlob && (
      <div className="p-3 rounded-xl border-2 animate-in slide-in-from-top-2 fade-in duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:fade-out overflow-hidden transition-all duration-300 ease-in-out" style={{backgroundColor: '#FFF4E6', borderColor: '#FFA05A'}}>
        {/* Waveform with all controls on same line */}
        <div className="space-y-2">
          {/* Waveform component */}
          <RecordedAudioWaveform
            ref={waveformRef}
            audioBlob={recordedAudioBlob}
            onPlayingChange={setIsWaveformPlaying}
          />

          {/* All buttons on same line: Play on left, others on right */}
          <div className="flex items-center justify-between">
            {/* Play button on left */}
            <button
              onClick={() => {
                waveformRef.current?.togglePlayback();
              }}
              className="flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#FFA05A',
                color: '#FFFFFF',
                border: '1px solid #FF8A3A'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF8A3A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFA05A';
              }}
            >
              <FontAwesomeIcon icon={isWaveformPlaying ? faStop : faPlay} className="text-xs" />
              {isWaveformPlaying ? 'Stop' : 'Play'}
            </button>

            {/* Action buttons on right */}
            <div className="flex items-center gap-3">
              {/* Rerecord Button */}
              <button
                onClick={handleRerecord}
                disabled={isLoading}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                style={{backgroundColor: '#72A5F2', color: '#ffffff'}}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#5B94E8'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#72A5F2'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                <FontAwesomeIcon icon={faRedo} className="text-sm" />
              </button>

              {/* Save Voice Button */}
              <button
                onClick={handleSaveVoiceCloning}
                disabled={isVoiceCloningSaving}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                style={{backgroundColor: '#FFA05A'}}
                onMouseEnter={(e) => {
                  if (!isVoiceCloningSaving) {
                    e.currentTarget.style.backgroundColor = '#FF8A3A'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isVoiceCloningSaving) {
                    e.currentTarget.style.backgroundColor = '#FFA05A'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                {isVoiceCloningSaving ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                style={{backgroundColor: '#F4F3F0', color: '#FFA05A'}}
                onMouseEnter={(e) => {
                  if (!isVoiceCloningSaving) {
                    e.currentTarget.style.backgroundColor = '#E8E6E1'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isVoiceCloningSaving) {
                    e.currentTarget.style.backgroundColor = '#F4F3F0'
                    e.currentTarget.style.transform = 'scale(1)'
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
        disabled={isLoading || !hasChanges || !lineBeingEditedData.character || !text?.trim()}
        className={`px-4 py-2 rounded-lg border border-black font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl text-white text-sm font-quicksand ${
          (isLoading || !hasChanges || !lineBeingEditedData.character || !text?.trim()) ? "opacity-50 cursor-not-allowed" : ""
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

        {/* Recording in Progress */}
        {lineMode === "recording" && isRecording && (
          <div className="w-full px-4 py-3 rounded-lg border-2 border-red-500 bg-red-50 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-red-700 text-sm font-quicksand">Recording...</span>
                <span className="font-mono text-sm font-bold text-red-700 bg-white px-2 py-1 rounded border border-red-500">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <button
                onClick={stopRecording}
                className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg border border-red-700 font-medium text-sm font-quicksand"
              >
                <FontAwesomeIcon icon={faStop} className="text-sm" />
                <span>Stop</span>
              </button>
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
