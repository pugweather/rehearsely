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
  faH
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DraftLine, Character, LineBeingEditedData, EditLineMode, DropdownData } from "@/app/types";
import Waveform from "./Waveform";
import localFont from "next/font/local";
import clsx from "clsx";
import { waveform } from "elevenlabs/api/resources/voices/resources/pvc/resources/samples";
import WaveformTrim from "./WaveformTrim";
import { cn } from "@/lib/utils"
import { Slider } from "../ui/Slider";
import { lines } from "@/database/drizzle/schema";

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

  const [isLoading, setIsLoading] = useState(false);
  const [lineMode, setLineMode] = useState<EditLineMode>("default"); // default | trim | delay | speed
  const [lineSpeed, setLineSpeed] = useState<number>(lineBeingEditedData.speed); // 1.0x is the default
  const [lineDelay, setLineDelay] = useState<number>(lineBeingEditedData.delay); // 1 second is the default
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  console.log(lineBeingEditedData)

  const handleSave = async () => {
    const trimmed = text?.trim();
    if (!trimmed || !character?.id) return;

    setIsLoading(true);
    let res;

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

    if (res.ok) {
      const result = await res.json();
      console.log(result)
      if (isNewLine) {
        const insertedLine = result.insertedLine[0];
        setLines((prev) => (prev ? [...prev, insertedLine] : [insertedLine]));
      } else {
        const { id, updates } = result;
        setLines((lines) =>
          lines?.map((line) => (line.id === lineId ? { id, ...updates } : line)) || null
        );
      }
      closeEditLine();
    } else {
      console.log(payload)
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

  const toggleLineMode = (btnMode: EditLineMode) => {
    if (lineMode === btnMode) {
      setLineMode("default")
    } else if (btnMode) {
      setLineMode(btnMode)
    }
  }

return (
  <div className={clsx(
    "rounded-2xl w-full px-6 py-6 space-y-6 relative shadow-md transition-all duration-200 hover:shadow-lg mb-8",
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
      <div className="dropdown">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-outline px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm"
          style={{backgroundColor: 'rgba(244,239,232,0.8)', color: '#202020', border: '1px solid rgba(32,32,32,0.1)'}}
        >
          <FontAwesomeIcon icon={faUser} style={{color: '#FFA05A'}} />
          {character ? `${character.name}${character.is_me ? " (me)" : ""}` : "Select Character"}
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
    </div>

    {/* Textarea */}
    <textarea
      placeholder="Type the line..."
      value={text || ""}
      onChange={(e) => setLineBeingEditedData((prev) => ({ ...prev, text: e.target.value }))}
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
    {lineMode === "default" && line?.audio_url && <Waveform src={line.audio_url}/>}

    {/* Action Buttons UI */}
    {lineMode === "trim" && line?.audio_url && <WaveformTrim line={line} setLineMode={setLineMode}/>}

    {lineMode === "speed" && 
      <div className="p-4 rounded-xl border-2" style={{backgroundColor: '#FFF4E6', borderColor: '#FFA05A'}}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#CC7A00'}}>Playback Speed</label>
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
        </div>
      </div>
    }

    {lineMode === "delay" && 
      <div className="p-4 rounded-xl border-2" style={{backgroundColor: '#FFF4E6', borderColor: '#FFA05A'}}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#CC7A00'}}>Delay Time</label>
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
        </div>
      </div>
    }

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
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg text-white transition-colors duration-200 flex items-center gap-2 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
            style={{backgroundColor: '#FFA05A'}}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#FF8A3A'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#FFA05A'
            }}
          >
            {!isLoading && <FontAwesomeIcon icon={faCheck} />}
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

    {/* Record Voice Button (Only show if it's not your character) */}
    {
    character && !character.is_me && 
    <button
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
    }

  </div>
  );
};

export default EditLine;
