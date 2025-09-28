"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

type Props = {
  src: string;
  speed?: number;
};

const Waveform = ({ src, speed = 1.0 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number>();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load audio and generate waveform data
  useEffect(() => {
    if (!src) {
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
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Generate waveform data - simplified version
        const samples = 60; // Fewer samples for simpler waveform
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
  }, [src]);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const centerY = height / 2;
    const maxAmplitude = Math.max(...waveformData) || 1;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, width, height);

    // Calculate bar spacing
    const barSpacing = 1;
    const barWidth = Math.max(2, (width - (waveformData.length - 1) * barSpacing) / waveformData.length);

    // Draw waveform bars - all dark grey
    waveformData.forEach((amplitude, index) => {
      const normalizedAmplitude = amplitude / maxAmplitude;
      const barHeight = Math.max(2, normalizedAmplitude * height * 0.8);
      const x = index * (barWidth + barSpacing);
      const y = centerY - barHeight / 2;

      // All bars are darker grey
      ctx.fillStyle = '#4B5563'; // Darker gray for all bars
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw playhead/crosshair
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;

      // Draw vertical line (crosshair)
      ctx.strokeStyle = '#FFA05A'; // Orange color to stand out
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [waveformData, duration, currentTime]);

  // Update canvas when data changes
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Set playback rate before playing
      audioRef.current.playbackRate = speed;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio events and update current time during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      // Set playback rate when metadata loads
      audio.playbackRate = speed;
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
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed, isPlaying]);

  // Update playback rate when speed changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
    }
  }, [speed]);

  // Handle clicking on waveform to seek
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || duration === 0 || isTransitioning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPercent = x / rect.width;
    const seekTime = clickPercent * duration;

    const startTime = currentTime;
    const targetTime = seekTime;
    const startTimestamp = performance.now();
    const transitionDuration = 150; // 150ms smooth transition

    setIsTransitioning(true);

    const animateSeek = (timestamp: number) => {
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / transitionDuration, 1);

      // Use easeOut function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const interpolatedTime = startTime + (targetTime - startTime) * easeOut;

      setCurrentTime(interpolatedTime);

      if (progress < 1) {
        requestAnimationFrame(animateSeek);
      } else {
        // Set final position and update audio
        audioRef.current!.currentTime = targetTime;
        setCurrentTime(targetTime);
        setIsTransitioning(false);
      }
    };

    requestAnimationFrame(animateSeek);
  };

  if (isLoading) {
    return (
      <div className="p-3 flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Loading waveform...</span>
      </div>
    );
  }

  return (
    <div className="p-3 flex items-center gap-3">
      {/* Play/Pause button */}
      <button
        onClick={togglePlayback}
        className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
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
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-sm" />
      </button>

      {/* Waveform Canvas */}
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          width={400}
          height={40}
          className="w-full h-10 cursor-pointer block"
          style={{ minHeight: '40px', maxHeight: '40px' }}
          onClick={handleWaveformClick}
          title="Click to seek"
        />
      </div>

      {/* Time display */}
      <div className="text-xs text-gray-600 font-mono">
        {Math.floor(currentTime)}s / {Math.floor(duration)}s
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};

export default Waveform;
