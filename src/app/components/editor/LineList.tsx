"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { faChessKing, faPlus, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SavedLine from './SavedLine'
import EditLine from './EditLine'
import Dropdown from '../ui/Dropdown'
import Overlay from '../ui/Overlay';
import ModalCreateCharacter from './ModalCreateCharacter';
import PlaySceneButtonsWrapper from './PlaySceneButtonsWrapper';
import { Line, DraftLine, LineBeingEditedData, Character, DropdownData } from '@/app/types';
import Image from 'next/image';
import { scrollToBottom } from '@/app/utils/utils';
import { useVoicesStore } from '@/app/stores/useVoicesStores';
import { useCharacters } from '@/app/context/charactersContext';
import { DragDropContext, Droppable, DropResult, DroppableProvided } from '@hello-pangea/dnd';

type Props = {
  lineItems: DraftLine[] | null,
  scrollRef: React.RefObject<HTMLElement | null>,
  sceneId: number,
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>
}

const LineList = ({lineItems, scrollRef, sceneId, setLines}: Props) => {

  // const sortedLines = lineItems?.slice().sort((a, b) => {
  //   if (!a || !b || a.order == null || b.order == null) return 0;
  //   return a.order - b.order;
  // });

  // const [lines, setLines] = useState<DraftLine[] | null>(sortedLines || null)
  const [lineBeingEdited, setLineBeingEdited] = useState<DraftLine | null>(null)
  const [lineBeingEditedData, setLineBeingEditedData] = useState<LineBeingEditedData>({voice: null, character: null, text: null, speed: 1, delay: 1, order: null}) // Tracks changes for line that is currently being edited
  const {characters, setCharacters} = useCharacters()
  const [originalCharForOpenedLine, setOriginalCharForOpenedLine] = useState<Character | null>(null) // When a line is opened, we track the original
  const [isCreateCharModalOpen, setIsCreateCharModalOpen] = useState<boolean>(false)
  const [shouldScroll, setShouldScroll] = useState<boolean>(false)

  const TEMP_LINE_ID = -999
  const voices = useVoicesStore(s => s.voices)

  const highestLineOrder = lineItems?.reduce((max, line) => {
    const lineOrder = line.order ? line.order : -1
    return lineOrder > max ? lineOrder : max
  }, -Infinity)
  const newLineOrder = highestLineOrder && Number.isFinite(highestLineOrder) ? highestLineOrder + 1 : 1
  // Unsetting state to "empty"", for clarity
  const LINE_BEING_EDITED_EMPTY: LineBeingEditedData = {
    voice: null,
    character: null,
    text: null,
    speed: 1,
    delay: 1,
    order: null
  }
  // Newly added line (line is placed at end)
  const LINE_BEING_EDITED_NEW: LineBeingEditedData = {
    voice:  null,
    character: null,
    text: null,
    speed: 1,
    delay: 1,
    order: newLineOrder
  }

  const scrollToBottom = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }

  /* Characters */

  // Handle scrolling to bottom when new line is added
  useEffect(() => {
    if (shouldScroll) {
      // 30ms for some extra safety. want to make sure line is added before scrolling
      setTimeout(() => {
        scrollToBottom(scrollRef)
        setShouldScroll(false)
      }, 10)
    }
  }, [shouldScroll])

  /* Editing line */


  // Character dropdown data for DaisyUI dropdown
  const charsDropdownData: DropdownData[] | undefined = characters ? 
  [
    {
      label: "+ New Character",
      onClick: function() {
        let maxCharsForScene = 5
        if (characters.length < maxCharsForScene) {
          setLineBeingEditedData(prev => ({...prev, character: null}))
          setIsCreateCharModalOpen(true)
        }
      },
      className: ""
    },
    ...characters.map(char => {
      const charName = char.is_me ? `${char.name} (me)` : char.name
      return {
        label: charName,
        onClick: function() {
          if (char) {
            const voice = voices?.find(v => v.voice_id === char.voice_id) || null
            setLineBeingEditedData(prev => ({...prev, character: char, voice: voice}))
          }
        },
        className: ""
      } 
    })
  ] : undefined

  /* Lines */ 

  // Adding lines to scene
  const handleAddLine = () => {
    const newLineOrderNumber = lineItems ? lineItems.length : 1
    // Add temp line with negative id to avoid possibl collisions
    if (lineItems && !lineItems.find(l => l.text == null)) {
      const newLine: DraftLine = {
        id: TEMP_LINE_ID,
        character_id: null,
        order: newLineOrderNumber,
        scene_id: sceneId,
        text: null,
        speed: 1,
        delay: 1,
        audio_url: undefined
      }
      setLineBeingEdited(newLine)
      setLineBeingEditedData(LINE_BEING_EDITED_NEW)
      setLines(prev => prev == null ? [newLine] : [...prev, newLine])
      setOriginalCharForOpenedLine(null)
      setShouldScroll(true)
    } else {
      console.log("Can only add one new line at a time")
    }
  }

  const closeEditLine = () => {
    // Remove temp line from lines array. Line isn't in db so no need to hit delete endpoint
    if (lineItems?.find(l => Number(l.id) == TEMP_LINE_ID)) {
      setLines(prev => {
        if (!prev) return null
        return prev.filter(l => l.id != TEMP_LINE_ID)
      })
    }
    // Also reset data for line being edited
    setLineBeingEditedData(LINE_BEING_EDITED_EMPTY)
    setLineBeingEdited(null) // TODO: we'll keep this for now. Maybe we can put all data into lineBeingEditedData....
  }

  // Handle drag and drop reordering
  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination || !lineItems) return;

    const { source, destination } = result;
    
    // If dropped in the same position, do nothing
    if (source.index === destination.index) return;

    // Swap-only behavior: swap positions of the two items and swap their `order` fields
    const newLines = Array.from(lineItems);
    const sourceItem = newLines[source.index];
    const destItem = newLines[destination.index];

    if (!sourceItem || !destItem || sourceItem.id == null || destItem.id == null) return;

    // Swap in the array
    newLines[source.index] = destItem;
    newLines[destination.index] = sourceItem;

    // Swap their order values
    const tempOrder = sourceItem.order;
    sourceItem.order = destItem.order;
    destItem.order = tempOrder;

    // Optimistically update UI
    setLines(newLines);

    // Send a full-scene reorder so DB exactly matches current UI ordering
    const lineUpdates = newLines
      .filter(l => l.id != null)
      .map((l, idx) => ({ id: l.id as number, order: idx + 1 }));

    try {
      const response = await fetch(`/api/private/scenes/${sceneId}/lines/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lineUpdates }),
      });

      if (!response.ok) {
        console.error('Failed to update line order');
        setLines(lineItems);
      }
    } catch (error) {
      console.error('Error updating line order:', error);
      setLines(lineItems);
    }
  };

  // Check if drag is disabled (when a line is being edited)
  const isDragDisabled = lineBeingEdited !== null;

  return (
    <>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="lines-list">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              { 
              lineItems?.map((line, index) => {
                return line.id == lineBeingEdited?.id ? 
                <EditLine 
                  key={line.id}
                  line={line} 
                  characters={characters} 
                  lineBeingEditedData={lineBeingEditedData}
                  newLineOrder={newLineOrder}
                  setLines={setLines}
                  setLineBeingEditedData={setLineBeingEditedData}
                  charsDropdownData={charsDropdownData}
                  closeEditLine={closeEditLine}
                  />
                  : 
                <SavedLine 
                  key={line.id}
                  line={line} 
                  lines={lineItems} 
                  characters={characters} 
                  setLines={setLines}
                  setLineBeingEdited={setLineBeingEdited} 
                  setLineBeingEditedData={setLineBeingEditedData} 
                  setShouldScroll={setShouldScroll}
                  setOriginalCharForOpenedLine={setOriginalCharForOpenedLine}
                  index={index}
                  isDragDisabled={isDragDisabled}
                  />
              }) 
              }
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button 
        className="w-full px-6 py-4 mt-8 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
        style={{
          backgroundColor: '#FFF4E6',
          color: '#CC7A00',
          border: '2px dashed #FFA05A'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FFA05A'
          e.currentTarget.style.color = '#ffffff'
          e.currentTarget.style.borderColor = '#FFA05A'
          e.currentTarget.style.borderStyle = 'solid'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFF4E6'
          e.currentTarget.style.color = '#CC7A00'
          e.currentTarget.style.borderColor = '#FFA05A'
          e.currentTarget.style.borderStyle = 'dashed'
          e.currentTarget.style.transform = 'translateY(0px)'
        }}
        onClick={handleAddLine}
      >
        <FontAwesomeIcon icon={faPlus} className="text-lg" />
        Add New Line
      </button>

      {isCreateCharModalOpen && <ModalCreateCharacter originalCharForOpenedLine={originalCharForOpenedLine} setIsCreateCharModalOpen={setIsCreateCharModalOpen} sceneId={sceneId} setLineBeingEditedData={setLineBeingEditedData} lineBeingEditedData={lineBeingEditedData} />}
    </>
  )
}

export default LineList