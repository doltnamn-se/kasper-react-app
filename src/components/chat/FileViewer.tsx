import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  attachmentUrl: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'document' | 'other';
}

export const FileViewer: React.FC<FileViewerProps> = ({
  isOpen,
  onClose,
  attachmentUrl,
  fileName,
  fileType
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Use native event listeners for reliable mobile touch handling
  useEffect(() => {
    if (!isOpen || !overlayRef.current || !closeButtonRef.current) return;

    const overlay = overlayRef.current;
    const closeButton = closeButtonRef.current;

    const handleOverlayClick = (e: MouseEvent | TouchEvent) => {
      if (e.target === overlay) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Overlay clicked, closing viewer');
        onClose();
      }
    };

    const handleCloseButtonClick = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button clicked, closing viewer');
      onClose();
    };

    // Add listeners for both click and touchend
    overlay.addEventListener('click', handleOverlayClick);
    overlay.addEventListener('touchend', handleOverlayClick);
    closeButton.addEventListener('click', handleCloseButtonClick);
    closeButton.addEventListener('touchend', handleCloseButtonClick);

    return () => {
      overlay.removeEventListener('click', handleOverlayClick);
      overlay.removeEventListener('touchend', handleOverlayClick);
      closeButton.removeEventListener('click', handleCloseButtonClick);
      closeButton.removeEventListener('touchend', handleCloseButtonClick);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const viewerContent = (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 flex items-center justify-center backdrop-blur-xl bg-black/20 transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        zIndex: 9999999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed'
      }}
    >
      {/* Close button */}
      <button
        ref={closeButtonRef}
        className="absolute bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 dark:text-white dark:bg-black/50 dark:hover:bg-black/70 rounded-full flex items-center justify-center"
        aria-label="Close"
        style={{
          top: 'max(env(safe-area-inset-top, 0px), 1rem)',
          right: 'max(env(safe-area-inset-right, 0px), 1rem)',
          width: '40px',
          height: '40px',
          minWidth: '40px',
          minHeight: '40px',
          padding: 0,
          zIndex: 10000000,
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <X className="w-6 h-6" />
      </button>

      {/* File content */}
      <div 
        className={`flex items-center justify-center w-full h-full p-4 transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ pointerEvents: 'none' }}
      >
        {fileType === 'image' ? (
          <img
            src={attachmentUrl}
            alt={fileName}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              pointerEvents: 'none'
            }}
          />
        ) : fileType === 'pdf' ? (
          <iframe
            src={attachmentUrl}
            className="w-[90vw] h-[90vh]"
            title={fileName}
            style={{ pointerEvents: 'auto' }}
          />
        ) : (
          <div 
            className="flex items-center justify-center w-[50vw] h-[50vh] bg-white/10 rounded-lg"
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-white text-center">
              <p className="text-lg">Cannot preview this file type</p>
              <p className="text-sm opacity-70 mt-2">{fileName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render using portal to ensure it's at the root level
  return createPortal(viewerContent, document.body);
};