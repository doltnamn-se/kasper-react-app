import React, { useState, useEffect } from 'react';
import { Download, Eye, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileViewer } from './FileViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface FileAttachmentProps {
  attachmentUrl: string;
  fileName: string;
  isCurrentUser?: boolean;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ 
  attachmentUrl, 
  fileName, 
  isCurrentUser = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [urlError, setUrlError] = useState(false);
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // Check if the attachmentUrl is a path (new format) or full URL (old format)
  const isStoragePath = attachmentUrl && !attachmentUrl.startsWith('http');

  // Generate signed URL for storage paths
  useEffect(() => {
    const generateSignedUrl = async () => {
      if (isStoragePath) {
        try {
          const { data, error } = await supabase.storage
            .from('chat-attachments')
            .createSignedUrl(attachmentUrl, 3600); // 1 hour expiry

          if (error) {
            console.error('Error generating signed URL:', error);
            setUrlError(true);
            return;
          }

          setSignedUrl(data.signedUrl);
        } catch (error) {
          console.error('Failed to generate signed URL:', error);
          setUrlError(true);
        }
      } else {
        // For old format (full URLs), use as-is
        setSignedUrl(attachmentUrl);
      }
    };

    generateSignedUrl();
  }, [attachmentUrl, isStoragePath]);

  // Use the signed URL or fall back to original
  const displayUrl = signedUrl || attachmentUrl;

  // Get file extension and determine file type
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileType = (filename: string) => {
    const ext = getFileExtension(filename);
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return 'image';
    }
    if (['pdf'].includes(ext)) {
      return 'pdf';
    }
    if (['doc', 'docx', 'txt'].includes(ext)) {
      return 'document';
    }
    return 'other';
  };

  const fileType = getFileType(fileName);
  const fileExt = getFileExtension(fileName);

  const handleView = () => {
    setIsViewerOpen(true);
  };

  const handleDownload = async () => {
    if (isStoragePath) {
      // Generate a fresh signed URL for download
      try {
        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .createSignedUrl(attachmentUrl, 300); // 5 minute expiry for download

        if (error) throw error;

        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
      }
    } else {
      // For old format URLs
      const link = document.createElement('a');
      link.href = attachmentUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderFileIcon = () => {
    const iconClass = `w-6 h-6 ${isCurrentUser ? 'text-[#121212] dark:text-[#ffffff]' : 'text-[#121212] dark:text-[#ffffff]'}`;
    
    switch (fileType) {
      case 'image':
        return <Image className={iconClass} />;
      case 'pdf':
        return <FileText className={iconClass} />;
      case 'document':
        return <FileText className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  const renderPreview = () => {
    if (fileType === 'image' && !imageError && !urlError && displayUrl) {
      return (
        <img
          src={displayUrl}
          alt={fileName}
          className="w-full h-full object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
      );
    }
    
    return (
      <div className={`flex flex-col items-center justify-center w-full h-full rounded-lg ${
        isCurrentUser 
          ? 'bg-[#d0ecfb] dark:bg-[#007aff]' 
          : 'bg-[#f0f0f0] dark:bg-[#2f2f31]'
      }`}>
        {renderFileIcon()}
        <span className={`text-xs font-medium mt-1 uppercase ${
          isCurrentUser 
            ? 'text-[#121212] dark:text-[#ffffff]' 
            : 'text-[#121212] dark:text-[#ffffff]'
        }`}>
          {fileExt}
        </span>
      </div>
    );
  };

  const viewText = t('nav.dashboard') === 'Översikt' ? 'Visa' : 'View';
  const downloadText = t('nav.dashboard') === 'Översikt' ? 'Ladda ner' : 'Download';

  const handleRectangleClick = () => {
    if (isMobile) {
      setIsViewerOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative w-32 h-32 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onClick={handleRectangleClick}
      >
        {/* File preview */}
        <div className="w-full h-full">
          {renderPreview()}
        </div>

        {/* Desktop hover buttons */}
        {!isMobile && isHovered && (
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
              className="bg-white/90 hover:bg-white text-gray-800 shadow-lg h-8 px-2"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {!isCurrentUser && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="bg-white/90 hover:bg-white text-gray-800 shadow-lg h-8 px-2"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* File Viewer Modal */}
        <FileViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          attachmentUrl={displayUrl}
          fileName={fileName}
          fileType={fileType}
        />
      </div>

      {/* Mobile download button - outside the rectangle */}
      {isMobile && !isCurrentUser && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Download className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};