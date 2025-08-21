import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 hover:text-white"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* File content */}
      <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {fileType === 'image' ? (
          <img
            src={attachmentUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
          />
        ) : fileType === 'pdf' ? (
          <iframe
            src={attachmentUrl}
            className="w-[90vw] h-[90vh]"
            title={fileName}
          />
        ) : (
          <div className="flex items-center justify-center w-[50vw] h-[50vh] bg-white/10 rounded-lg">
            <div className="text-white text-center">
              <p className="text-lg">Cannot preview this file type</p>
              <p className="text-sm opacity-70 mt-2">{fileName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};