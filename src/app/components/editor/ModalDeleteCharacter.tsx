"use client"
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faClose, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Character } from '@/app/types';
import { useCharacters } from '@/app/context/charactersContext';

type Props = {
  character: Character;
  sceneId: number;
  setIsDeleteCharModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCharacterDeleted?: () => void;
  onCascadeDelete?: (characterId: number) => void;
}

const ModalDeleteCharacter = ({ character, sceneId, setIsDeleteCharModalOpen, onCharacterDeleted, onCascadeDelete }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const { characters, setCharacters } = useCharacters();

  // Animation effect - same as Modal component
  useEffect(() => {
    setShouldRender(true);
    // Small delay to ensure the modal is rendered before animating
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteCharacter = async () => {
    // 1. Immediately close modal and trigger cascade delete visualization
    handleCancel(); // Close modal with animation
    
    // 2. Trigger cascade delete in parent component
    if (onCascadeDelete) {
      onCascadeDelete(character.id);
    }
  };

  const handleCancel = () => {
    setIsVisible(false);
    // Wait for animation to complete before calling parent close function
    setTimeout(() => {
      setIsDeleteCharModalOpen(false);
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      handleCancel();
    }
  };

  if (!shouldRender) return null;

  const modalContent = (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-200 ease-out ${
        isVisible 
          ? 'opacity-100' 
          : 'opacity-0'
      }`}
      style={{
        backgroundColor: isVisible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className={`relative rounded-2xl bg-white overflow-hidden shadow-xl transition-all duration-200 ease-out ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 translate-y-4'
        }`}
        style={{ width: '560px', height: '260px' }}
      >
        <div className='flex flex-col h-full rounded-2xl bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] shadow-xl border-4 border-red-600'>
          {/* Header */}
          <div className='relative px-6 py-5'>
            <div className='text-2xl font-bold text-gray-800'>Confirm Deletion</div>
            <button 
              onClick={handleCancel} 
              className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200"
              disabled={isDeleting}
            >
              <FontAwesomeIcon icon={faClose} className="text-gray-700" />
            </button>
          </div>

          {/* Body */}
          <div className='px-6 py-4 flex items-start gap-4'>
            <div className="w-12 h-12 rounded-full border-3 border-black bg-red-50 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faTriangleExclamation} className='text-xl text-red-600' />
            </div>
            <div className='text-lg text-gray-800 leading-relaxed'>
              Are you sure you want to delete <span className="font-bold text-red-600">"{character.name}{character.is_me ? ' (me)' : ''}"</span>?
            </div>
          </div>

          {/* Footer */}
          <div className='mt-auto px-6 py-4 flex items-center justify-end gap-3'>
            <button 
              onClick={handleCancel}
              disabled={isDeleting}
              className="px-6 py-3 bg-white rounded-xl border-3 border-black font-bold text-gray-700 transition-all duration-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCharacter}
              disabled={isDeleting}
              className={`px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl border-3 border-black font-bold transition-all duration-200 flex items-center gap-2 ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrashCan} />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ModalDeleteCharacter;
