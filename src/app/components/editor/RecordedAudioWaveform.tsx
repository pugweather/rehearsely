"use client";
import React, { useRef, useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons';

type Props = {
  audioBlob: Blob;
  onPlayingChange?: (isPlaying: boolean) => void;
};

export type RecordedAudioWaveformRef = {
  togglePlayback: () => void;
  isPlaying: boolean;
};

const RecordedAudioWaveform = React.forwardRef<RecordedAudioWaveformRef, Props>(({ audioBlob, onPlayingChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number>();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Initialize audio and load waveform data
  useEffect(() => {
    if (!audioBlob) {
      setIsLoading(false);
      return;
    }

    const loadAudio = async () => {
      setIsLoading(true);
      try {
        // Create object URL for the blob
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Convert blob to array buffer and decode
        const arrayBuffer = await audioBlob.arrayBuffer();
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
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading recorded audio:', error);
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioBlob]);

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
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Calculate bar spacing
    const barSpacing = 1;
    const barWidth = Math.max(1, (width - (waveformData.length - 1) * barSpacing) / waveformData.length);

    // Draw waveform bars
    waveformData.forEach((amplitude, index) => {
      const normalizedAmplitude = amplitude / maxAmplitude;
      const barHeight = Math.max(2, normalizedAmplitude * height * 0.7);
      const x = index * (barWidth + barSpacing);
      const y = centerY - barHeight / 2;

      // Determine color based on position relative to crosshair
      const timePosition = (index / waveformData.length) * duration;
      let color = '#E5E7EB'; // Default light gray

      // Gray for left of crosshair (already played), Orange for right of crosshair (to be played)
      if (timePosition <= currentTime) {
        color = '#9CA3AF'; // Gray - already played
      } else {
        color = '#FFA05A'; // Orange - to be played
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw playhead/crosshair
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;

      // Vertical line (crosshair)
      ctx.strokeStyle = '#FF8A3A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Small circle at the center of the crosshair
      ctx.fillStyle = '#FF8A3A';
      ctx.beginPath();
      ctx.arc(playheadX, centerY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

  }, [waveformData, duration, currentTime]);

  // Update canvas when data changes
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Handle clicking on waveform to seek
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0 || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPercent = x / rect.width;
    const seekTime = clickPercent * duration;

    // Pause audio when seeking
    if (isPlaying) {
      audioRef.current.pause();
      onPlayingChange?.(false);
    }

    // Update audio time and current time state
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Play/pause functionality
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayingChange?.(false);
    } else {
      // Don't reset time when playing - maintain current position
      audioRef.current.play();
      setIsPlaying(true);
      onPlayingChange?.(true);
    }
  };

  // Update current time during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayingChange?.(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl, isPlaying]);

  // Expose controls to parent component
  useImperativeHandle(ref, () => ({
    togglePlayback,
    isPlaying,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-12 bg-white rounded-lg border-2" style={{borderColor: '#FFA05A'}}>
        <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-orange-600 text-sm">Loading audio...</span>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Interactive Waveform Canvas - Full width on top */}
      <div className="bg-white rounded-lg border-2 p-3" style={{borderColor: '#FFA05A'}}>
        <canvas
          ref={canvasRef}
          width={600}
          height={60}
          className="w-full h-15 rounded cursor-pointer"
          onClick={handleCanvasClick}
          title="Click to seek to position"
        />
      </div>
    </div>
  );
});

RecordedAudioWaveform.displayName = 'RecordedAudioWaveform';

export default RecordedAudioWaveform;