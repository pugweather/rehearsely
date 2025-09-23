"use client";
import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

type Props = {
  src: string;
  speed?: number;
};

const Waveform = ({ src, speed = 1.0 }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Set playback rate before playing
      audioRef.current.playbackRate = speed;
      console.log('Setting playbackRate to:', speed);
      audioRef.current.play();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // Set playback rate when metadata loads
      audio.playbackRate = speed;
      console.log('Audio loaded, setting playbackRate to:', speed);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [speed]);

  // Update playback rate when speed changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
      console.log('Speed changed, setting playbackRate to:', speed);
    }
  }, [speed]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle clicking on progress bar to seek
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPercent = x / rect.width;
    const seekTime = clickPercent * duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center gap-3">
      {/* Play button */}
      <button
        onClick={togglePlayback}
        className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors flex-shrink-0"
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-xs" />
      </button>

      {/* Clickable progress bar */}
      <div 
        className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
        onClick={handleProgressClick}
        title="Click to seek"
      >
        <div 
          className="h-full bg-gray-600 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Time display */}
      <div className="text-xs text-gray-500 font-mono">
        {Math.floor(currentTime)}s / {Math.floor(duration)}s
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};

export default Waveform;
