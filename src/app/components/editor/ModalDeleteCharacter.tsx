"use client"
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Character } from '@/app/types';
import { useCharacters } from '@/app/context/charactersContext';

type Props = {
  character: Character;
  sceneId: number;
  setIsDeleteCharModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCharacterDeleted?: () => void;
}

const ModalDeleteCharacter = ({ character, sceneId, setIsDeleteCharModalOpen, onCharacterDeleted }: Props) => {
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
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/private/scenes/${sceneId}/characters/${character.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      // Remove character from local state
      if (characters) {
        setCharacters(characters.filter(c => c.id !== character.id));
      }

      // Call callback if provided
      if (onCharacterDeleted) {
        onCharacterDeleted();
      }

      setIsDeleteCharModalOpen(false);
    } catch (error) {
      console.error('Error deleting character:', error);
      // You could add error handling/toast here
    } finally {
      setIsDeleting(false);
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
        style={{ width: '520px', height: '250px' }}
      >
        <div 
          className="flex flex-col h-full rounded-2xl"
          style={{
            backgroundColor: 'rgb(227, 214, 198)',
            border: '1px solid rgb(220, 38, 38)'
          }}
        >
          {/* Header */}
          <div className="relative px-6 py-5">
            <div className="text-xl font-semibold" style={{color: 'rgb(32, 32, 32)'}}>
              Delete Character
            </div>
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'rgb(32, 32, 32)'}}
              disabled={isDeleting}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 flex items-start gap-3">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="text-xl"
              style={{color: 'rgb(220, 38, 38)'}}
            />
            <div className="text-base" style={{color: 'rgb(32, 32, 32)'}}>
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                "{character.name}{character.is_me ? ' (me)' : ''}"
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={isDeleting}
            >
              <span 
                className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 ease-in-out text-white hover:opacity-85 hover:shadow-sm tracking-wider px-4 py-2"
                style={{backgroundColor: 'rgba(255, 255, 255, 0.3)', color: 'rgb(32, 32, 32)', border: '1px solid rgba(32,32,32,0.1)'}}
              >
                <span>Cancel</span>
              </span>
            </button>
            <button
              onClick={handleDeleteCharacter}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              style={{backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)'}}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.2)'
                  e.currentTarget.style.color = '#b91c1c'
                  e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)'
                  e.currentTarget.style.color = '#dc2626'
                  e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)'
                }
              }}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTriangleExclamation} />
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
