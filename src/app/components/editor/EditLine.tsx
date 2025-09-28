"use client";
import React, { useRef, useState } from "react";
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
  faPlay
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
import MicErrorModal from '../ui/MicErrorModal';

type Props = {
  line: DraftLine | null;
  characters: Character[] | null;
  lineBeingEditedData: LineBeingEditedData;
  newLineOrder: number;
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>;
  closeEditLine: () => void;
  charsDropdownData: DropdownData[] | undefined;
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>;
};

const certaSansMedium = localFont({
    src: "../../../../public/fonts/certaSansMedium.otf",
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
  const [showMicErrorModal, setShowMicErrorModal] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);


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
    
    setHasChanges(hasTextChanged || hasCharacterChanged || hasSpeedChanged || hasDelayChanged || hasAudioTrimmed || hasAudioRecorded);
  }, [lineBeingEditedData.text, lineBeingEditedData.character?.id, lineBeingEditedData.speed, lineBeingEditedData.delay, trimmedAudioBlob, recordedAudioBlob]);

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
        setLines((prev) => (prev ? [...prev, insertedLine] : [insertedLine]));
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
      closeEditLine();
    } else {
      console.log("Save failed - request body:", trimmedAudioBlob ? "FormData with audio" : "JSON payload")
      console.error("Save failed");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (lineId === TEMP_LINE_ID) return closeEditLine();

    const res = await fetch(`/api/private/scenes/${sceneId}/lines/${lineId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lineId }),
    });

    if (res.ok) {
      setLines((prev) => prev?.filter((line) => line.id !== lineId) || null);
      closeEditLine();
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

  // Start recording
  const startRecording = async () => {
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
      setShowMicErrorModal(true);
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

    setIsLoading(true);
    
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
        setLineMode("default");
        setRecordedAudioBlob(null);
        setRecordingTime(0);
        setHasChanges(false);
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
      setIsLoading(false);
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

  const toggleLineMode = (btnMode: EditLineMode) => {
    if (lineMode === btnMode) {
      setLineMode("default")
    } else if (btnMode) {
      setLineMode(btnMode)
    }
  }

return (
  <div className={clsx(
    "rounded-2xl w-full px-6 py-6 space-y-6 relative shadow-md transition-all duration-300 hover:shadow-lg mb-8",
    isLoading ? "pointer-events-none opacity-75" : ""
    )} style={{backgroundColor: '#E3D6C6', border: '1px solid rgba(32,32,32,0.1)'}}>
    {/* Close Button (X) */}
    <button
      onClick={closeEditLine}
      className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
      style={{color: '#202020', backgroundColor: 'rgba(255,255,255,0.2)'}} 
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
    >
      <FontAwesomeIcon icon={faXmark} />
    </button>

    {/* Character Dropdown */}
    <div className="flex justify-between pr-12">
      {isCharactersLoading ? (
        <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          Loading characters...
        </div>
      ) : (
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm"
            style={{backgroundColor: 'rgba(244,239,232,0.8)', color: '#202020', border: '1px solid rgba(32,32,32,0.1)'}}
          >
            <FontAwesomeIcon icon={faUser} style={{color: '#FFA05A'}} />
            {character ? `${character.name}${character.is_me ? " (me)" : ""}` : (isCharactersLoading ? "Loading..." : "Select Character")}
            <FontAwesomeIcon icon={faChevronDown} style={{color: '#202020', opacity: 0.6}} />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow"
          >
            {charsDropdownData?.map((item, index) => (
              <li key={index}>
                <a 
                  className={item.className} 
                  onClick={(e) => {
                    e.preventDefault();
                    item.onClick();
                    // Only close dropdown after a delay to allow modal to open
                    setTimeout(() => {
                      const activeElement = document.activeElement as HTMLElement;
                      if (activeElement) {
                        activeElement.blur();
                      }
                      document.body.click();
                    }, 100);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
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
      className="w-full min-h-[100px] px-4 py-3 rounded-lg text-base resize-none border-0 focus:outline-none transition-all duration-200"
      style={{
        backgroundColor: 'rgba(244,239,232,0.9)',
        color: '#202020',
        border: '1px solid rgba(32,32,32,0.1)'
      }}
      onFocus={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff'
        e.currentTarget.style.boxShadow = `0 0 0 2px #72A5F2`
        e.currentTarget.style.borderColor = '#72A5F2'
      }}
      onBlur={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(244,239,232,0.9)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'rgba(32,32,32,0.1)'
      }}
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
      <div className="p-4 rounded-xl border-2 animate-in slide-in-from-top-2 fade-in duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:fade-out overflow-hidden transition-all duration-300 ease-in-out" style={{backgroundColor: '#FFF4E6', borderColor: '#FFA05A'}}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#CC7A00'}}>Speed</label>
            <input 
              type="range" 
              min={0} 
              max={2} 
              step={0.1} 
              value={lineSpeed} 
              className="w-full h-3 rounded-lg appearance-none cursor-pointer" 
              style={{backgroundColor: '#ffffff', border: '2px solid #FFA05A'}}
              onChange={(e) => setLineSpeed(Number(e.target.value))}
            />
          </div>
          <div className="px-4 py-2 rounded-lg text-sm font-mono font-bold w-16 text-center" style={{backgroundColor: '#FFA05A', color: '#ffffff', border: '2px solid #FF8A3A'}}>
            {lineSpeed}x
          </div>
          <button
            onClick={handleSaveLineSpeed}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            style={{backgroundColor: '#FFA05A'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FF8A3A'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFA05A'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <FontAwesomeIcon icon={faCheck} className="text-sm" />
          </button>
          
          {/* Close Button */}
          <button
            onClick={() => setLineMode("default")}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            style={{backgroundColor: '#F4F3F0', color: '#FFA05A'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E8E6E1'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F4F3F0'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>
      </div>
    }

    {lineMode === "delay" && 
      <div className="p-4 rounded-xl border-2 animate-in slide-in-from-top-2 fade-in duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:fade-out overflow-hidden transition-all duration-300 ease-in-out" style={{backgroundColor: '#FFF4E6', borderColor: '#FFA05A'}}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#CC7A00'}}>Delay</label>
            <input 
              type="range" 
              min={0} 
              max={2} 
              step={0.1} 
              value={lineDelay} 
              className="w-full h-3 rounded-lg appearance-none cursor-pointer" 
              style={{backgroundColor: '#ffffff', border: '2px solid #FFA05A'}}
              onChange={(e) => setLineDelay(Number(e.target.value))}
            />
          </div>
          <div className="px-4 py-2 rounded-lg text-sm font-mono font-bold w-16 text-center" style={{backgroundColor: '#FFA05A', color: '#ffffff', border: '2px solid #FF8A3A'}}>
            {lineDelay}s
          </div>
          <button
            onClick={handleSaveLineDelay}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            style={{backgroundColor: '#FFA05A'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FF8A3A'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFA05A'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <FontAwesomeIcon icon={faCheck} className="text-sm" />
          </button>
          
          {/* Close Button */}
          <button
            onClick={() => setLineMode("default")}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            style={{backgroundColor: '#F4F3F0', color: '#FFA05A'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E8E6E1'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F4F3F0'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
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
                disabled={isLoading}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                style={{backgroundColor: '#FFA05A'}}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#FF8A3A'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#FFA05A'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                {isLoading ? (
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
                disabled={isLoading}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                style={{backgroundColor: '#F4F3F0', color: '#FFA05A'}}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#E8E6E1'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
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

    {/* Action Buttons (icon-only) */}
    <div className="flex items-center justify-between">
      {character && !character.is_me &&
      <div className="flex gap-2">
        {
        [
          {
            img: faScissors, 
            mode: "trim"
          }, 
          {
            img: faPersonRunning, 
            mode: "speed"
          }, 
          {
            img: faHand, 
            mode: "delay"
          }
        ].map((item, i) => (
          <button
            key={i}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
            style={{
              backgroundColor: lineMode === item.mode ? '#72A5F2' : 'rgba(244,239,232,0.8)',
              color: lineMode === item.mode ? '#ffffff' : '#202020',
              border: '1px solid rgba(32,32,32,0.1)'
            }}
            onMouseEnter={(e) => {
              if (lineMode !== item.mode) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = 'rgba(32,32,32,0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (lineMode !== item.mode) {
                e.currentTarget.style.backgroundColor = 'rgba(244,239,232,0.8)'
                e.currentTarget.style.borderColor = 'rgba(32,32,32,0.1)'
              }
            }}
            onClick={() => toggleLineMode(item.mode as EditLineMode)}
          >
            <FontAwesomeIcon icon={item.img} />
          </button>
        ))}
      </div>
      }

        <div className="flex gap-3 ml-auto">
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ml-2"
            style={{backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.2)'
              e.currentTarget.style.color = '#b91c1c'
              e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)'
              e.currentTarget.style.color = '#dc2626'
              e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)'
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isLoading || !hasChanges || !lineBeingEditedData.character || !text?.trim()}
            className={`px-6 py-2 rounded-lg text-white transition-colors duration-200 flex items-center gap-2 ${(isLoading || !hasChanges || !lineBeingEditedData.character || !text?.trim()) ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              backgroundColor: '#FFA05A' // Always orange, opacity handles disabled state
            }}
            onMouseEnter={(e) => {
              if (!isLoading && hasChanges && lineBeingEditedData.character && text?.trim()) e.currentTarget.style.backgroundColor = '#FF8A3A'
            }}
            onMouseLeave={(e) => {
              if (!isLoading && hasChanges && lineBeingEditedData.character && text?.trim()) e.currentTarget.style.backgroundColor = '#FFA05A'
            }}
          >
            {!isLoading && <FontAwesomeIcon icon={faCheck} />}
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

    {/* Voice Recording Section (Only show if it's not your character and not in voice mode) */}
    {character && !character.is_me && lineMode !== "voice" && (
      <div className="space-y-4">
        {/* Recording Controls */}
        {!isRecording && !recordedAudioBlob && (
          <div className="relative">
            <button
              onClick={startRecording}
              className="w-full px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
              style={{backgroundColor: 'rgba(244,239,232,0.8)', color: '#202020', border: '1px solid rgba(32,32,32,0.1)'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFA05A'
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.borderColor = '#FFA05A'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(244,239,232,0.8)'
                e.currentTarget.style.color = '#202020'
                e.currentTarget.style.borderColor = 'rgba(32,32,32,0.1)'
              }}
            >
              <FontAwesomeIcon icon={faMicrophone} />
              Record Voice
            </button>
          </div>
        )}

        {/* Recording in Progress */}
        {isRecording && (
          <div className="w-full px-6 py-3 rounded-lg border-2 animate-pulse" 
               style={{backgroundColor: '#FFE6E6', borderColor: '#FF4444'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-red-700">Recording...</span>
                <span className="font-mono text-lg font-bold text-red-700">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <button
                onClick={stopRecording}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faStop} />
                Stop
              </button>
            </div>
          </div>
        )}

      </div>
    )}

    <MicErrorModal
      isOpen={showMicErrorModal}
      onClose={() => setShowMicErrorModal(false)}
    />

  </div>
  );
};

export default EditLine;
