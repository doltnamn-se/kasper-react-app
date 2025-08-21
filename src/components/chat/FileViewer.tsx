import React from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadText = t('nav.dashboard') === 'Översikt' ? 'Ladda ner' : 'Download';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      {/* Modal content */}
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {fileName}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadText}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {fileType === 'image' ? (
            <img
              src={attachmentUrl}
              alt={fileName}
              className="max-w-full max-h-[70vh] object-contain mx-auto"
            />
          ) : fileType === 'pdf' ? (
            <iframe
              src={attachmentUrl}
              className="w-full h-[70vh]"
              title={fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-gray-500 dark:text-gray-400 text-center">
                <p className="text-lg mb-4">Cannot preview this file type</p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {downloadText}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};