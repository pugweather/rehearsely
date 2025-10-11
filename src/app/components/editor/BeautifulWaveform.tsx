"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { DraftLine, EditLineMode } from '@/app/types';

type Props = {
  line: DraftLine;
  setLineMode: React.Dispatch<React.SetStateAction<EditLineMode>>;
  onAudioTrimmed?: (trimmedAudioBlob: Blob) => void; // Callback with the trimmed audio blob
  speed?: number; // Added speed prop
};

type TrimRange = {
  start: number;
  end: number;
};

const BeautifulWaveform = ({ line, setLineMode, onAudioTrimmed, speed = 1.0 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number>();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 3 });
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'selection' | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize audio and load waveform data - NO EXTERNAL DEPENDENCIES
  useEffect(() => {
    if (!line.audio_url) {
      setIsLoading(false);
      return;
    }

    const loadAudio = async () => {
      setIsLoading(true);
      try {
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Fetch and decode audio
        const response = await fetch(line.audio_url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;

        // Generate waveform data
        const samples = 100;
        const blockSize = Math.floor(audioBuffer.length / samples);
        const waveData: number[] = [];

        for (let i = 0; i < samples; i++) {
          const start = i * blockSize;
          const end = Math.min(start + blockSize, audioBuffer.length);
          let sum = 0;
          
          // Average all channels
          for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let j = start; j < end; j++) {
              sum += Math.abs(channelData[j]);
            }
          }
          
          waveData.push(sum / ((end - start) * audioBuffer.numberOfChannels));
        }

        setWaveformData(waveData);
        setDuration(audioBuffer.duration);
        setTrimRange({ start: 0, end: Math.min(3, audioBuffer.duration) });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading audio:', error);
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [line.audio_url]);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const centerY = height / 2;
    const maxAmplitude = Math.max(...waveformData) || 1;

    // Clear canvas with light background
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, width, height);

    // Calculate bar spacing
    const barSpacing = 2;
    const barWidth = Math.max(1, (width - (waveformData.length - 1) * barSpacing) / waveformData.length);

    // Draw waveform bars
    waveformData.forEach((amplitude, index) => {
      const normalizedAmplitude = amplitude / maxAmplitude;
      const barHeight = Math.max(2, normalizedAmplitude * height * 0.7);
      const x = index * (barWidth + barSpacing);
      const y = centerY - barHeight / 2;

      // Determine color based on position
      const timePosition = (index / waveformData.length) * duration;
      let color = '#E5E7EB'; // Light gray

      // Selection range
      if (timePosition >= trimRange.start && timePosition <= trimRange.end) {
        color = '#9CA3AF'; // Medium gray
      }

      // Progress - ONLY within the trim selection range AND only if currently playing
      if (timePosition >= trimRange.start && 
          timePosition <= trimRange.end && 
          timePosition <= currentTime && 
          currentTime >= trimRange.start &&
          isPlaying) {
        color = '#6B7280'; // Dark gray
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw selection handles - MUCH THICKER AND EASIER TO GRAB
    const startX = (trimRange.start / duration) * width;
    const endX = (trimRange.end / duration) * width;

    // Selection area background - softer orange like your theme
    ctx.fillStyle = 'rgba(255, 160, 90, 0.15)';
    ctx.fillRect(startX, 0, endX - startX, height);

    // Thick handle bars - much easier to grab
    ctx.fillStyle = '#FFA05A'; // Your theme orange
    ctx.fillRect(startX - 3, 0, 6, height); // 6px wide instead of 2px
    ctx.fillRect(endX - 3, 0, 6, height);   // 6px wide instead of 2px

    // Large handle circles for easy grabbing
    ctx.beginPath();
    ctx.arc(startX, height / 2, 8, 0, 2 * Math.PI); // 8px radius instead of 4px
    ctx.fillStyle = '#FFA05A';
    ctx.fill();
    ctx.strokeStyle = '#FF8A3A';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(endX, height / 2, 8, 0, 2 * Math.PI); // 8px radius instead of 4px
    ctx.fillStyle = '#FFA05A';
    ctx.fill();
    ctx.strokeStyle = '#FF8A3A';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [waveformData, duration, trimRange, currentTime, isPlaying]);

  // Update canvas when data changes
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Handle mouse interactions - FIXED POSITIONING
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Use actual canvas dimensions and scale factor
    const canvasWidth = canvas.width;
    const scaleX = canvasWidth / rect.width;
    const scaledX = x * scaleX;
    const timePosition = (scaledX / canvasWidth) * duration;

    const startX = (trimRange.start / duration) * canvasWidth;
    const endX = (trimRange.end / duration) * canvasWidth;

    // Check if clicking on handles - BIGGER HIT AREA (40px)
    if (Math.abs(scaledX - startX) < 40) {
      setIsDragging('start');
    } else if (Math.abs(scaledX - endX) < 40) {
      setIsDragging('end');
    } else if (scaledX >= startX && scaledX <= endX) {
      // Click inside selection area - enable sliding
      setIsDragging('selection');
      setDragStartOffset(scaledX - startX); // Remember where in the selection we clicked
    } else {
      // Click outside - create new selection
      const selectionSize = Math.min(3, duration * 0.2);
      const newStart = Math.max(0, timePosition - selectionSize / 2);
      const newEnd = Math.min(duration, newStart + selectionSize);
      setTrimRange({ start: newStart, end: newEnd });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Change cursor when hovering over handles - FIXED POSITIONING
    if (!isDragging) {
      // Use actual canvas dimensions, not the CSS width
      const canvasWidth = canvas.width;
      const scaleX = canvasWidth / rect.width; // Scale factor for canvas vs display
      const scaledX = x * scaleX;
      
      const startX = (trimRange.start / duration) * canvasWidth;
      const endX = (trimRange.end / duration) * canvasWidth;
      
      // BIGGER click radius - 40px instead of 20px
      if (Math.abs(scaledX - startX) < 40 || Math.abs(scaledX - endX) < 40) {
        canvas.style.cursor = 'grab';
      } else if (scaledX >= startX && scaledX <= endX) {
        canvas.style.cursor = 'move'; // Show move cursor inside selection
      } else {
        canvas.style.cursor = 'pointer';
      }
    } else {
      canvas.style.cursor = 'grabbing';
    }

    // Handle dragging - FIXED POSITIONING
    if (isDragging) {
      const canvasWidth = canvas.width;
      const scaleX = canvasWidth / rect.width;
      const scaledX = x * scaleX;
      const timePosition = Math.max(0, Math.min(duration, (scaledX / canvasWidth) * duration));

      if (isDragging === 'start') {
        setTrimRange(prev => ({
          ...prev,
          start: Math.min(timePosition, prev.end - 0.1)
        }));
      } else if (isDragging === 'end') {
        setTrimRange(prev => ({
          ...prev,
          end: Math.max(timePosition, prev.start + 0.1)
        }));
      } else if (isDragging === 'selection') {
        // Slide the entire selection - like a sliding door
        const selectionLength = trimRange.end - trimRange.start;
        const newStartX = scaledX - dragStartOffset;
        const newStartTime = Math.max(0, Math.min(duration - selectionLength, (newStartX / canvasWidth) * duration));
        
        setTrimRange({
          start: newStartTime,
          end: newStartTime + selectionLength
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Create local trimmed audio (no API call)
  const saveTrimmedAudio = async () => {
    if (!line.audio_url || !audioBufferRef.current || isSaving) return;
    
    setIsSaving(true);
    try {
      // Get the audio buffer
      const audioBuffer = audioBufferRef.current;
      
      // Calculate sample positions
      const startSample = Math.floor(trimRange.start * audioBuffer.sampleRate);
      const endSample = Math.floor(trimRange.end * audioBuffer.sampleRate);
      const trimmedLength = endSample - startSample;
      
      if (trimmedLength <= 0) {
        throw new Error('Invalid trim range');
      }
      
      // Create trimmed audio buffer
      const trimmedBuffer = audioContextRef.current!.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        audioBuffer.sampleRate
      );
      
      // Copy trimmed audio data
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        
        for (let i = 0; i < trimmedLength; i++) {
          trimmedData[i] = originalData[startSample + i];
        }
      }
      
      // Convert to WAV blob for local use
      const wavBlob = audioBufferToWavBlob(trimmedBuffer);
      
      // Success - exit trim mode and pass the trimmed audio blob to parent
      setLineMode('default');
      
      // Notify parent with the trimmed audio blob (for local preview)
      if (onAudioTrimmed) {
        onAudioTrimmed(wavBlob);
      }
      
    } catch (error) {
      console.error('Error creating trimmed audio:', error);
      alert('Failed to create trimmed audio. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to convert AudioBuffer to WAV blob
  const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const bufferSize = 44 + dataSize;
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Write audio data
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  // Play/pause functionality
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Always start from trim start and reset current time
      audioRef.current.currentTime = trimRange.start;
      setCurrentTime(trimRange.start);
      audioRef.current.playbackRate = speed;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Update current time during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const currentAudioTime = audio.currentTime;
      setCurrentTime(currentAudioTime);
      
      // Stop at trim end and reset state properly
      if (currentAudioTime >= trimRange.end) {
        audio.pause();
        setIsPlaying(false);
        // Reset to start of trim for next play
        setCurrentTime(trimRange.start);
        return;
      }
      
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, trimRange.end]);

  // Reset current time when trim range changes
  useEffect(() => {
    if (!isPlaying) {
      setCurrentTime(trimRange.start);
    }
  }, [trimRange.start, trimRange.end, isPlaying]);

  // Never show loading state for more than 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Waveform loading timeout - showing fallback');
        setIsLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-16 bg-gray-50 rounded-lg border">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading audio...</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] rounded-2xl p-4 space-y-3 shadow-lg relative overflow-hidden">
      {/* Floating orange circles like snow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-2 h-2 bg-[#ffa05a] rounded-full opacity-5 animate-pulse" 
             style={{
               top: '20%', 
               left: '15%',
               animation: 'float 8s ease-in-out infinite, fadeInOut 6s ease-in-out infinite'
             }}></div>
        <div className="absolute w-1.5 h-1.5 bg-[#ffa05a] rounded-full opacity-8" 
             style={{
               top: '60%', 
               right: '25%',
               animation: 'float 12s ease-in-out infinite reverse, fadeInOut 8s ease-in-out infinite 2s'
             }}></div>
        <div className="absolute w-1 h-1 bg-[#ffa05a] rounded-full opacity-6" 
             style={{
               top: '35%', 
               right: '15%',
               animation: 'float 10s ease-in-out infinite, fadeInOut 7s ease-in-out infinite 1s'
             }}></div>
        <div className="absolute w-2.5 h-2.5 bg-[#ffa05a] rounded-full opacity-4" 
             style={{
               bottom: '30%', 
               left: '20%',
               animation: 'float 15s ease-in-out infinite reverse, fadeInOut 9s ease-in-out infinite 3s'
             }}></div>
        <div className="absolute w-1.5 h-1.5 bg-[#ffa05a] rounded-full opacity-7" 
             style={{
               bottom: '15%', 
               right: '35%',
               animation: 'float 11s ease-in-out infinite, fadeInOut 5s ease-in-out infinite 4s'
             }}></div>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} src={line.audio_url} preload="metadata" />
      
      {/* Waveform Canvas */}
      <div className="relative bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <canvas
          ref={canvasRef}
          width={600}
          height={50}
          className="w-full h-12 rounded"
          style={{ cursor: 'pointer' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Controls - Compact styling */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <button
          onClick={togglePlayback}
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
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-xs" />
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-xl text-xs font-bold shadow-sm" style={{ color: '#CC7A00' }}>
          {trimRange.start.toFixed(1)}s - {trimRange.end.toFixed(1)}s
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={saveTrimmedAudio}
            disabled={isSaving}
            className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
            style={{backgroundColor: isSaving ? '#D1D5DB' : '#FFA05A'}}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = '#FF8A3A'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = '#FFA05A'
              }
            }}
          >
            <FontAwesomeIcon icon={faCheck} className="text-sm" />
          </button>

          <button
            onClick={() => setLineMode('default')}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg border border-gray-300"
            style={{backgroundColor: '#f8f9fa', color: '#dc3545'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef'
              e.currentTarget.style.borderColor = '#dc3545'
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
  );
};

export default BeautifulWaveform;
