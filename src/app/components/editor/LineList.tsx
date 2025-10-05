"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { faChessKing, faPlus, faEllipsis, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SavedLine from './SavedLine'
import LoadingLine from './LoadingLine'
import EditLine from './EditLine'
import Dropdown from '../ui/Dropdown'
import Overlay from '../ui/Overlay';
import ModalCreateCharacterNew from './ModalCreateCharacterNew';
import PlaySceneButtonsWrapper from './PlaySceneButtonsWrapper';
import { Line, DraftLine, LineBeingEditedData, Character, DropdownData } from '@/app/types';
import Image from 'next/image';
import { scrollToBottom } from '@/app/utils/utils';
import { useVoicesStore } from '@/app/stores/useVoicesStores';
import { useCharacters } from '@/app/context/charactersContext';
import { usePracticeRange } from '@/app/context/practiceRangeContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
  const { isRangeSelectionMode } = usePracticeRange()

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

  // Handle scrolling when line is opened for editing
  useEffect(() => {
    if (shouldScroll && lineBeingEdited) {
      setTimeout(() => {
        // Find the EditLine element (it should be rendered now)
        const editLineElement = document.querySelector('[data-edit-line="true"]')
        if (editLineElement) {
          editLineElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          })
        } else {
          console.log('EditLine element not found')
        }
        setShouldScroll(false)
      }, 100) // Increased timeout to ensure element is rendered
    }
  }, [shouldScroll, lineBeingEdited])

  /* Editing line */
  // Character dropdown data for DaisyUI dropdown
  const maxCharsForScene = 5
  const canAddNewCharacter = characters && characters.length < maxCharsForScene
  
  const charsDropdownData: DropdownData[] | undefined = characters ? 
  [
    {
      label: "+ New Character",
      onClick: function() {
        if (canAddNewCharacter) {
          setLineBeingEditedData(prev => ({...prev, character: null}))
          setIsCreateCharModalOpen(true)
        }
        // Do nothing if max characters reached
      },
      className: canAddNewCharacter ? "" : "opacity-50 cursor-not-allowed pointer-events-none"
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

  const handleCascadeDelete = async (characterId: number) => {
    // 1. Close EditLine if open
    closeEditLine();
    
    // 2. Immediately set all lines with this character to deleting state
    setLines((prev) => 
      prev?.map((line) => 
        line.character_id === characterId ? { ...line, isDeleting: true } : line
      ) || null
    );

    // 3. Perform the actual API deletion
    try {
      const response = await fetch(`/api/private/scenes/${sceneId}/characters/${characterId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      // 4. Remove character and associated lines from local state
      if (characters) {
        setCharacters(characters.filter(c => c.id !== characterId));
      }
      
      // Remove all lines associated with this character
      setLines((prev) => 
        prev?.filter((line) => line.character_id !== characterId) || null
      );

    } catch (error) {
      console.error('Error deleting character:', error);
      
      // 5. If deletion failed, remove deleting state from affected lines
      setLines((prev) => 
        prev?.map((line) => 
          line.character_id === characterId ? { ...line, isDeleting: false } : line
        ) || null
      );
    }
  }

  // Configure sensors for drag and drop - SUPER RESPONSIVE
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Only start drag after 8px movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Track if we made any swaps during drag
  const [hasMadeSwap, setHasMadeSwap] = useState(false);

  // Handle drag start
  const handleDragStart = () => {
    setHasMadeSwap(false);
  };

  // Handle drag over for smart swapping when items overlap significantly
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !lineItems || active.id === over.id) return;

    const activeIndex = lineItems.findIndex(item => item.id === active.id);
    const overIndex = lineItems.findIndex(item => item.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      // Swap immediately when dragged item overlaps with another
      const newLines = arrayMove(lineItems, activeIndex, overIndex);
      setLines(newLines);
      setHasMadeSwap(true);
    }
  };

  // Handle drag end for backend update
  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('Drag ended, hasMadeSwap:', hasMadeSwap);
    
    // Only update backend if we actually made a swap
    if (!hasMadeSwap || !lineItems) {
      console.log('No swap made or no line items, skipping backend update');
      return;
    }

    // Use current lineItems state (which has already been updated by handleDragOver)
    const currentLines = lineItems;
    
    // Update backend with current order
    const lineUpdates = currentLines
      .filter(l => l.id != null)
      .map((l, idx) => ({ id: l.id as number, order: idx + 1 }));

    console.log('Updating backend with line order:', lineUpdates);

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
        console.error('Response status:', response.status);
        const responseText = await response.text();
        console.error('Response text:', responseText);
      } else {
        console.log('Successfully updated line order in backend');
      }
    } catch (error) {
      console.error('Error updating line order:', error);
    }
  };

  // Check if drag is disabled (when a line is being edited)
  const isDragDisabled = lineBeingEdited !== null;

  return (
    <>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SortableContext 
          items={lineItems?.filter(line => line.id !== null).map(line => line.id!) || []} 
          strategy={verticalListSortingStrategy}
        >
          <div className='w-full'>
            {
            lineItems?.map((line, index) => {
              // Check if this line is being edited
              if (line.id == lineBeingEdited?.id) {
                return false ? (
                  // Show loading state instead of EditLine when characters haven't loaded
                  <div key={line.id} className="rounded-2xl w-full px-6 py-6 mb-8 flex items-center justify-center" style={{backgroundColor: '#E3D6C6', border: '1px solid rgba(32,32,32,0.1)'}}>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg font-medium">Loading characters...</span>
                    </div>
                  </div>
                ) : (
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
                    onCascadeDelete={handleCascadeDelete}
                  />
                )
              }

              // Check if this line is waiting for audio generation
              const character = characters?.find(c => c.id === line.character_id)
              const needsAudio = !character?.is_me && !line.audio_url

              if (needsAudio && character) {
                return (
                  <LoadingLine
                    key={line.id}
                    characterName={character.name}
                    order={line.order || 0}
                  />
                )
              }

              // Show saved line
              return (
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
              )
            })
            }
          </div>
        </SortableContext>
      </DndContext>
      {!isRangeSelectionMode && (
        <button
          className="w-full px-6 py-4 mt-8 rounded-xl border-2 border-[#72a4f2] font-semibold text-base transition-all duration-200 flex items-center justify-center gap-3 bg-[#72a4f2]/5 text-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:border-[#ffa05a] hover:bg-[#ffa05a]/5 group"
          onClick={handleAddLine}
        >
          <div className="w-7 h-7 rounded-full bg-[#72a4f2] group-hover:bg-[#ffa05a] flex items-center justify-center group-hover:rotate-90 transition-all duration-200">
            <FontAwesomeIcon icon={faPlus} className="text-white text-sm" />
          </div>
          <span>Add New Line</span>
        </button>
      )}

      {isCreateCharModalOpen && <ModalCreateCharacterNew originalCharForOpenedLine={originalCharForOpenedLine} setIsCreateCharModalOpen={setIsCreateCharModalOpen} sceneId={sceneId} setLineBeingEditedData={setLineBeingEditedData} lineBeingEditedData={lineBeingEditedData} />}
    </>
  )
}

export default LineList