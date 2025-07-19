"use client";
import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faScissors,
  faHand,
  faCircleCheck,
  faXmark,
  faPersonRunning,
  faTrashCan,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import ButtonLink from "../ui/ButtonLink";
import { DraftLine, Character, LineBeingEditedData } from "@/app/types";
import clsx from "clsx";

type Props = {
  line: DraftLine | null;
  characters: Character[] | null;
  lineBeingEditedData: LineBeingEditedData;
  newLineOrder: number;
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>;
  closeEditLine: () => void;
  openCharacterDropdown: (ref: React.RefObject<HTMLDivElement | null>) => void;
  setLineBeingEditedData: React.Dispatch<
    React.SetStateAction<LineBeingEditedData>
  >;
};

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
  const LINE_BEING_EDITED_EMPTY: LineBeingEditedData = {
    voice: null,
    character: null,
    text: null,
    order: null,
  };

  const TEMP_LINE_ID = -999;
  const isNewLine = line?.id === TEMP_LINE_ID;
  const sceneId = line?.scene_id;
  const lineId = line?.id;
  const { character, text } = lineBeingEditedData;

  const [isLoading, setIsLoading] = useState(false);
  const dropdownBtnRef = useRef<HTMLDivElement | null>(null);

  const handleSaveLine = async () => {
    const text = lineBeingEditedData.text?.trim();
    const characterId = lineBeingEditedData.character?.id;
    const voiceId = lineBeingEditedData.voice?.voice_id;
    const order = lineBeingEditedData.order;
    const charIsMe = character?.is_me;

    if (!text || !characterId) return;

    setIsLoading(true);
    let res;

    if (isNewLine) {
      res = await fetch(`/api/private/scenes/${sceneId}/lines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(charIsMe === false ? { voiceId } : {}),
          text,
          characterId,
          order,
        }),
      });
    } else {
      res = await fetch(`/api/private/scenes/${sceneId}/lines/${line?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(charIsMe === false ? { voiceId } : {}),
          text,
          order,
          character_id: characterId,
          scene_id: sceneId,
        }),
      });
    }

    setIsLoading(false);

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
  };

  const handleChangeLineText = (text: string) => {
    setLineBeingEditedData((prev) => ({ ...prev, text }));
  };

  const handleDeleteLine = async () => {
    if (lineId === TEMP_LINE_ID) {
      closeEditLine();
    } else {
      const res = await fetch(`/api/private/scenes/${sceneId}/lines/${lineId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lineId }),
      });

      if (res.ok) {
        setLines((prev) => prev?.filter((line) => line.id !== lineId) || null);
        setLineBeingEditedData(LINE_BEING_EDITED_EMPTY);
      }
    }
  };

  const displaySelectedCharacterName = () => {
    const meText = character?.is_me ? " (me)" : "";
    return character ? `${character.name}${meText}` : "Select Character";
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl bg-white shadow-lg border border-gray-100 p-0 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-6 bg-gradient-to-br from-[#fdfbf6] to-[#fdfdfd]">
        {/* Left column: Controls */}
        <div className="flex md:flex-col gap-3 shrink-0">
          <div
            className="flex items-center justify-between md:justify-start gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
            ref={dropdownBtnRef}
            onClick={() => openCharacterDropdown(dropdownBtnRef)}
          >
            <span className="text-sm font-medium text-gray-800">
              {displaySelectedCharacterName()}
            </span>
            <FontAwesomeIcon icon={faCaretDown} className="text-gray-500" />
          </div>

          <button
            className="w-9 h-9 rounded-full bg-black text-white hover:scale-105 transition flex items-center justify-center"
            aria-label="Record"
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </button>

          <button
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition flex items-center justify-center"
            onClick={closeEditLine}
            aria-label="Cancel edit"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Right column: Text + Actions */}
        <div className="flex-1 flex flex-col gap-4">
          <textarea
            placeholder="Type the line and choose a voice (optional)."
            className="w-full min-h-[120px] rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            value={text || ""}
            onChange={(e) => handleChangeLineText(e.target.value)}
          />

          {lineBeingEditedData.character && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {[faScissors, faPersonRunning, faHand].map((icon, i) => (
                  <button
                    key={i}
                    className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={icon} />
                  </button>
                ))}
                <button
                  onClick={handleDeleteLine}
                  className="w-9 h-9 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              </div>

              <ButtonLink
                icon={faCircleCheck}
                text={isLoading ? "Saving..." : "Save"}
                bgColor={isLoading ? "#ccc" : "#3b82f6"}
                className="px-6 py-2 text-sm rounded-lg text-white"
                onClick={handleSaveLine}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditLine;
