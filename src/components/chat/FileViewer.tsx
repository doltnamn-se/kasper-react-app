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

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleBackgroundClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onClose();
  };

  const viewerContent = (
    <div 
      className={`fixed inset-0 flex items-center justify-center backdrop-blur-xl bg-black/20 transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        zIndex: 99999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed'
      }}
      onClick={handleBackgroundClick}
      onTouchEnd={handleBackgroundClick}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute z-[100000] bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 dark:text-white dark:bg-black/50 dark:hover:bg-black/70 rounded-full flex items-center justify-center p-0 aspect-square"
        aria-label="Close"
        style={{
          top: 'max(env(safe-area-inset-top, 0px), 1rem)',
          right: 'max(env(safe-area-inset-right, 0px), 1rem)',
          width: '40px',
          height: '40px',
          minWidth: '40px',
          minHeight: '40px',
          padding: 0
        }}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* File content */}
      <div className={`flex items-center justify-center w-full h-full p-4 transition-all duration-300 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {fileType === 'image' ? (
          <img
            src={attachmentUrl}
            alt={fileName}
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}
          />
        ) : fileType === 'pdf' ? (
          <iframe
            src={attachmentUrl}
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="w-[90vw] h-[90vh]"
            title={fileName}
          />
        ) : (
          <div 
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-[50vw] h-[50vh] bg-white/10 rounded-lg"
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