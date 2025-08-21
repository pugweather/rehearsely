"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlay, faSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { EditLineMode, DraftLine } from "@/app/types";

type TrimRange = { start: number; end: number };

type Props = {
  line: DraftLine,
  onDelete?: () => void;
  initialSeconds?: number;   // default initial selection length
  minSeconds?: number;       // minimum selection length
  setLineMode: React.Dispatch<React.SetStateAction<EditLineMode>>
};

export default function WaveformTrim({
  line,
  onDelete,
  initialSeconds = 3,
  minSeconds = 0.5,
  setLineMode
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<ReturnType<typeof RegionsPlugin.create> | null>(null);
  const regionRef = useRef<any | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [range, setRange] = useState<TrimRange | null>(null);
  const [saving, setSaving] = useState(false);

  // Track current URL (original or last blob) so repeated trims work
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const wsOptions = useMemo(
    () => ({
      waveColor: "#bbb",
      progressColor: "#f47c2c",
      cursorColor: "#333",
      height: 60,
      barWidth: 2,
    }),
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      url: line.audio
      ,
      ...wsOptions,
    });
    wsRef.current = ws;
    setCurrentUrl(src);

    // (TS types don’t include options, but runtime supports them)
    // @ts-expect-error
    const regions = ws.registerPlugin(
      RegionsPlugin.create({
        dragSelection: true,   // allow click-drag to define region
        maxRegions: 1,         // keep one region
      })
    );
    // const regions = wavesurfer.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    ws.on("ready", ensureRegion);

    regions.on("region-created", (r: any) => {
      regionRef.current = r;
      setRange({ start: r.start, end: r.end });
      r.on("update-end", () => setRange({ start: r.start, end: r.end }));
    });

    regions.on("region-updated", (r: any) => {
      if (r === regionRef.current) setRange({ start: r.start, end: r.end });
    });

    regions.on("region-removed", () => {
      regionRef.current = null;
      setRange(null);
      ensureRegion(); // always remain in trim mode
    });

    return () => {
      ws.destroy();
      if (currentUrl?.startsWith("blob:")) URL.revokeObjectURL(currentUrl);
    };

    function ensureRegion() {
      if (!wsRef.current || !regionsRef.current || regionRef.current) return;
      const dur = wsRef.current.getDuration() || 0;
      const len = Math.min(initialSeconds, Math.max(minSeconds, dur || initialSeconds));
      const r = regionsRef.current.addRegion({
        start: 0,
        end: len,
        drag: true,
        resize: true,
        color: "rgba(244,124,44,0.25)",
      });
      regionRef.current = r;
      setRange({ start: r.start, end: r.end });
    }
  }, [line.audio_url, wsOptions, initialSeconds, minSeconds]);

  const playSelection = () => {
    if (!wsRef.current || !range) return;
    if (wsRef.current.isPlaying()) {
      wsRef.current.pause();
    } else {
      wsRef.current.setTime(range.start);
      wsRef.current.play(range.start, range.end);
    }
  };

  // ✅ Save: trim locally & reload waveform with new blob URL
  const confirmTrim = async () => {
    if (!range || !currentUrl) return;
    setSaving(true);
    try {
      // 1) Fetch the currently loaded audio (can be http or blob URL)
      const res = await fetch(currentUrl);
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      const arr = await res.arrayBuffer();

      // 2) Decode via Web Audio
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const audioBuf: AudioBuffer = await new Promise((resolve, reject) => {
        // @ts-ignore Safari-safe callback form
        ctx.decodeAudioData(arr.slice(0), resolve, reject);
      });

      // 3) Slice to selection (sample-accurate)
      const s0 = Math.floor(range.start * audioBuf.sampleRate);
      const s1 = Math.min(Math.floor(range.end * audioBuf.sampleRate), audioBuf.length);
      const frames = Math.max(0, s1 - s0);
      if (frames <= 0) return;

      const out = ctx.createBuffer(audioBuf.numberOfChannels, frames, audioBuf.sampleRate);
      for (let ch = 0; ch < audioBuf.numberOfChannels; ch++) {
        out.getChannelData(ch).set(audioBuf.getChannelData(ch).subarray(s0, s1));
      }

      // 4) Encode to WAV and load
      const wavBlob = audioBufferToWavBlob(out);
      const blobUrl = URL.createObjectURL(wavBlob);

      if (currentUrl.startsWith("blob:")) URL.revokeObjectURL(currentUrl);

      // Wait for ready so region gets recreated immediately
      await new Promise<void>((resolve) => {
        const ws = wsRef.current!;
        const onReady = () => {
          ws.un("ready", onReady);
          resolve();
        };
        ws.on("ready", onReady);
        ws.load(blobUrl);
      });
      setCurrentUrl(blobUrl);
    } catch (e) {
      console.error("Local trim failed:", e);
      alert("Trim failed. If your audio is cross-origin, enable CORS or proxy it.");
    } finally {

      const blob = await fetch(currentUrl).then(r => r.blob());

      const fd = new FormData();
      fd.append("file", blob, "trimmed.mp3"); // 👈 file itself
      fd.append("userId", userId);            // 👈 optional: who owns it
      fd.append("sceneId", sceneId.toString()); // 👈 optional: context

      await fetch("/api/audio/save", { method: "POST", body: fd });

      setLineMode("default" as EditLineMode)
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div ref={containerRef} className="flex-1 min-w-0 h-16 sm:h-14 lg:h-16" />

      <div className="flex items-center gap-2">
        {/* Play/Pause selection */}
        <button
          onClick={playSelection}
          disabled={!range}
          aria-label={isPlaying ? "Pause Selection" : "Play Selection"}
          className="w-8 h-8 rounded-full bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title={range ? `Play ${range.start.toFixed(2)}s → ${range.end.toFixed(2)}s` : "Select a region"}
        >
          <FontAwesomeIcon icon={isPlaying ? faSquare : faPlay} className="text-white text-sm" />
        </button>

        {/* Save (local trim) */}
        <button
          onClick={confirmTrim}
          disabled={!range || saving}
          aria-label="Trim"
          className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50"
          title={range ? `Save ${range.start.toFixed(2)}s → ${range.end.toFixed(2)}s` : "Select a region"}
        >
          {saving ? <span className="animate-pulse">…</span> : <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />}
        </button>
      </div>
    </div>
  );
}

/* --- helper: AudioBuffer -> WAV Blob --- */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels, sr = buffer.sampleRate, frames = buffer.length;
  const dataLen = frames * numCh * 2, totalLen = 44 + dataLen;
  const ab = new ArrayBuffer(totalLen), dv = new DataView(ab);
  let off = 0;
  const w8=(s:string)=>{for(let i=0;i<s.length;i++)dv.setUint8(off++,s.charCodeAt(i))};
  const w32=(v:number)=>{dv.setUint32(off,v,true);off+=4};
  const w16=(v:number)=>{dv.setUint16(off,v,true);off+=2};
  w8("RIFF"); w32(36+dataLen); w8("WAVE");
  w8("fmt "); w32(16); w16(1); w16(numCh);
  w32(sr); w32(sr*numCh*2); w16(numCh*2); w16(16);
  w8("data"); w32(dataLen);
  for(let i=0;i<frames;i++){
    for(let ch=0; ch<numCh; ch++){
      let s = buffer.getChannelData(ch)[i];
      s = Math.max(-1, Math.min(1, s));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      dv.setInt16(off, s, true); off += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}
