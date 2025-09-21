"use client";
import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

type Props = {
  src: string;
};

const SimpleWaveform = ({ src }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const peaksInstanceRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !audioRef.current || !src) return;

    // Load Peaks.js dynamically
    const loadPeaks = async () => {
      if (!window.Peaks) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/peaks.js@3.4.1/dist/peaks.min.js';
        script.onload = initializePeaks;
        document.head.appendChild(script);
      } else {
        initializePeaks();
      }
    };

    const initializePeaks = () => {
      const options = {
        containers: {
          zoomview: containerRef.current,
        },
        mediaElement: audioRef.current,
        webAudio: {
          audioContext: new (window.AudioContext || (window as any).webkitAudioContext)(),
        },
        // Custom styling to match your image exactly
        zoomview: {
          container: containerRef.current,
          waveformColor: '#E5E7EB',      // Light gray bars (unplayed)
          playedWaveformColor: '#9CA3AF', // Medium gray (played portion)
          backgroundColor: '#F9FAFB',     // Light background
          axisGridlineColor: 'transparent',
          axisLabelColor: 'transparent',
          height: 40,
          showPlayheadTime: false,
          timeLabelPrecision: 1,
        },
        keyboard: false,
        mouseWheelMode: 'none',
      };

      window.Peaks.init(options, (err: any, peaks: any) => {
        if (err) {
          console.error('Peaks.js initialization error:', err);
          setIsLoading(false);
          return;
        }

        peaksInstanceRef.current = peaks;
        setIsLoading(false);
      });
    };

    loadPeaks();

    return () => {
      if (peaksInstanceRef.current) {
        peaksInstanceRef.current.destroy();
      }
    };
  }, [src]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-12 bg-gray-50 rounded-lg border">
        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center gap-3">
      {/* Play button */}
      <button
        onClick={togglePlayback}
        className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors flex-shrink-0"
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-xs" />
      </button>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Waveform Container */}
      <div 
        ref={containerRef} 
        className="flex-1 h-10 bg-white rounded border"
        style={{ minHeight: '40px' }}
      />
    </div>
  );
};

export default SimpleWaveform;
