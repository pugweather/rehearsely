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
import { DraftLine, Character, LineBeingEditedData, EditLineMode } from "@/app/types";
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
  openCharacterDropdown: (ref: React.RefObject<HTMLDivElement | null>) => void;
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
  openCharacterDropdown,
  setLineBeingEditedData,
}: Props) => {
  const TEMP_LINE_ID = -999;
  const isNewLine = line?.id === TEMP_LINE_ID;
  const sceneId = line?.scene_id;
  const lineId = line?.id;
  const { character, text } = lineBeingEditedData;

  const [isLoading, setIsLoading] = useState(false);
  const [lineMode, setLineMode] = useState<EditLineMode>("default"); // default | trim | delay | speed
  const [lineSpeed, setLineSpeed] = useState<number[]>([1.0]); // 1.0x is the default
  const [lineDelay, setLineDelay] = useState<number[]>([1]); // 1 second is the default
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  console.log(lineBeingEditedData)

  const handleSave = async () => {
    const trimmed = text?.trim();
    if (!trimmed || !character?.id) return;

    setIsLoading(true);
    let res;

    console.log(lineBeingEditedData)

    const payload = {
      text: trimmed,
      characterId: character.id,
      order: lineBeingEditedData.order,
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
    setLineBeingEditedData(prev => ({...prev, speed: lineSpeed[0]}))
    setLineMode("default")
  }

  const handleSaveLineDelay = () => {
    setLineBeingEditedData(prev => ({...prev, delay: lineDelay[0]}))
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
    "bg-[#fffbf2] shadow-lg rounded-2xl w-full max-w-3xl px-6 py-6 space-y-6 relative",
    isLoading ? "pointer-none:" : ""
    )}>
    {/* Close Button (X) */}
    <button
      onClick={closeEditLine}
      className="absolute top-4 right-4 w-9 h-9 rounded-md hover:bg-[#f3e9d8] flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
    >
      <FontAwesomeIcon icon={faXmark} />
    </button>

    {/* Character Dropdown */}
    <div className="flex justify-between pr-12">
      <div
        ref={dropdownRef}
        onClick={() => openCharacterDropdown(dropdownRef)}
        className="text-sm bg-white hover:bg-[#f5eee2] transition px-3 py-1.5 rounded-full cursor-pointer inline-flex items-center gap-2 shadow-sm"
      >
        <FontAwesomeIcon icon={faUser} className="text-gray-500" />
        {character ? `${character.name}${character.is_me ? " (me)" : ""}` : "Select Character"}
        <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
      </div>
    </div>

    {/* Textarea */}
    <textarea
      placeholder="Type the line..."
      value={text || ""}
      onChange={(e) => setLineBeingEditedData((prev) => ({ ...prev, text: e.target.value }))}
      className="w-full min-h-[100px] px-4 py-3 rounded-lg bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-[#f47c2c] focus:outline-none"
    />

    {/* Default Waveform to show when not in edit mode for other characters */}
    {lineMode === "default" && line?.audio_url && <Waveform src={line.audio_url}/>}

    {/* Action Buttons UI */}
    {lineMode === "trim" && line?.audio_url && <WaveformTrim line={line} setLineMode={setLineMode}/>}

    {lineMode === "speed" && 

      <div className="flex items-center">
        <Slider 
          min={0.5}
          max={2}
          value={lineSpeed}
          step={0.1}
          onValueChange={setLineSpeed}
          className={"flex-1"}
        />
        <div className="ml-2">{lineSpeed}x</div>
        <button
          onClick={handleSaveLineSpeed}
          className="w-8 h-8 ml-2 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50"
        >
        <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
        </button>
      </div>
    }

    {lineMode === "delay" && 

      <div className="flex items-center">
        <Slider 
          min={0}
          max={10}
          value={lineDelay}
          step={1}
          onValueChange={setLineDelay}
          className={"flex-1"}
        />
        <div className="ml-2">{lineDelay}s</div>
        <button
          onClick={handleSaveLineDelay}
          className="w-8 h-8 ml-2 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50"
        >
        <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
        </button>
      </div>
    }

    {/* Action Buttons (icon-only) */}
    <div className="flex items-center justify-between">
      {
      character && !character.is_me &&
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
            className={clsx(
              "w-10 h-10 flex items-center justify-center rounded-lg bg-[#fef5ec] hover:bg-[#f47c2c] text-[#f47c2c] hover:text-white font-medium transition duration-150 shadow-sm hover:shadow-md",
              lineMode === item.mode && "bg-orange-400 text-white" // Change this to actual orange color
            )}
            onClick={() => toggleLineMode(item.mode as EditLineMode)}
          >
            <FontAwesomeIcon icon={item.img} className="text-sm" />
          </button>
        ))}
      </div>
      }

        <div className="flex gap-3 ml-auto">
          {/* Delete */}
          <button
            onClick={handleDelete}
            className={`bg-[#ff7875] hover:brightness-105 text-white text-md px-4 py-2 rounded-md font-medium transition ${certaSansMedium.className}`}
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`bg-[#f47c2c] text-white text-md px-4 py-2 rounded-md font-medium hover:brightness-105 transition ${certaSansMedium.className} ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            {isLoading ? "Saving..." : "Save Line"}
          </button>
        </div>
      </div>

    {/* Record Voice Button (Only show if it's not your character) */}
    
    {
    character && !character.is_me && 
    <button
      className={`w-full text-md font-medium text-[#f47c2c] bg-white border border-transparent px-6 py-3 rounded-lg hover:bg-[#f47c2c] hover:text-white transition shadow-sm ${certaSansMedium.className}`}
    >
      <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
      Record Voice
    </button>
    }

  </div>
  );
};

export default EditLine;
