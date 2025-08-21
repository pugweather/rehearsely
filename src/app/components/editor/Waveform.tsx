"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { faPlay, faSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Waveform({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a WaveSurfer instance
    const ws = WaveSurfer.create({
      container: containerRef.current, // DOM node to draw into
      url: src,                         // MP3 URL
      waveColor: "#bbb",                // waveform color
      progressColor: "#f47c2c",         // playback progress color
      cursorColor: "#333",              // playhead color
      height: 60,                       // pixels tall
      barWidth: 2,                      // draw bars instead of a continuous line
    });

    wsRef.current = ws;

    ws.on("ready", () => {
      console.log("Waveform is ready, duration:", ws.getDuration());
    });

    ws.on("play", () => {
      setIsPlaying(true)
    })

    ws.on("pause", () => {
      setIsPlaying(false)
    })

    return () => {
      ws.destroy();
    };
  }, [src]);

  return (
    <div className="flex items-center gap-3">
  {/* Waveform fills remaining space */}
  <div ref={containerRef} className="flex-1 min-w-0 h-16" />

  {/* Controls */}
  <div className="flex items-center gap-2">
    <button
      onClick={() => wsRef.current?.playPause()}
      aria-label="Play/Pause"
      className="w-8 h-8 rounded-full bg-black flex items-center justify-center"
    >
      <FontAwesomeIcon icon={isPlaying ? faSquare : faPlay} className="text-white text-sm" />
    </button>

    <button
      aria-label="Delete"
      className="w-8 h-8 rounded-full bg-[#ff7875] flex items-center justify-center"
    >
      <FontAwesomeIcon icon={faTrash} className="text-white text-sm" />
    </button>
  </div>
</div>

  );
}
