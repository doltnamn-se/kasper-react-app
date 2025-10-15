import React, { useState } from 'react';
import { Download, FileText, Image, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileViewer } from './FileViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { isStoragePath } from '@/utils/chatFileUtils';

interface FileAttachmentProps {
  attachmentUrl: string;
  fileName: string;
  isCurrentUser?: boolean;
  onImageViewerOpen?: () => void;
  onImageViewerClose?: () => void;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ 
  attachmentUrl, 
  fileName, 
  isCurrentUser = false,
  onImageViewerOpen,
  onImageViewerClose
}) => {
  const [imageError, setImageError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // Use the pre-generated URL directly (already processed in hook)
  const displayUrl = attachmentUrl;
  const needsSignedUrl = isStoragePath(attachmentUrl);

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

  const handleView = async () => {
    console.log('FileAttachment - handleView called, fileType:', fileType);
    
    // For PDFs, open in new tab to avoid Chrome blocking issues
    if (fileType === 'pdf') {
      if (needsSignedUrl && !displayUrl.startsWith('http')) {
        try {
          const { data, error } = await supabase.storage
            .from('chat-attachments')
            .createSignedUrl(attachmentUrl, 3600); // 1 hour expiry

          if (error) throw error;
          window.open(data.signedUrl, '_blank');
        } catch (error) {
          console.error('Failed to open PDF:', error);
        }
      } else {
        window.open(displayUrl, '_blank');
      }
    } else {
      // For images and other files, use the modal viewer
      console.log('FileAttachment - Opening image viewer, calling onImageViewerOpen');
      onImageViewerOpen?.();
      console.log('FileAttachment - Setting isViewerOpen to true');
      setIsViewerOpen(true);
    }
  };

  const handleDownload = async () => {
    try {
      // Use the pre-generated URL or generate a fresh one if needed
      const downloadUrl = displayUrl.startsWith('http') ? displayUrl : await (async () => {
        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .createSignedUrl(attachmentUrl, 300); // 5 minute expiry for download
        
        if (error) throw error;
        return data.signedUrl;
      })();

      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      
      // Create a temporary blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
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
    if (fileType === 'image' && !imageError && displayUrl) {
      return (
        <div className="relative w-full h-full">
          {!imageLoaded && (
            <div className={`absolute inset-0 flex items-center justify-center rounded-lg ${
              isCurrentUser 
                ? 'bg-[#d0ecfb] dark:bg-[#007aff]' 
                : 'bg-[#f0f0f0] dark:bg-[#2f2f31]'
            }`}>
              <Loader2 className={`w-6 h-6 animate-spin ${
                isCurrentUser 
                  ? 'text-[#121212] dark:text-[#ffffff]' 
                  : 'text-[#121212] dark:text-[#ffffff]'
              }`} />
            </div>
          )}
          <img
            src={displayUrl}
            alt={fileName}
            className={`w-full h-full object-cover rounded-lg transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </div>
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
    handleView();
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative w-32 h-32 rounded-lg transition-all duration-200 cursor-pointer"
        onClick={handleRectangleClick}
      >
        {/* File preview */}
        <div className="w-full h-full">
          {renderPreview()}
        </div>

        {/* File Viewer Modal */}
        <FileViewer
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            onImageViewerClose?.();
          }}
          attachmentUrl={displayUrl}
          fileName={fileName}
          fileType={fileType}
        />
      </div>

      {/* Download button - always visible on the right, for all platforms */}
      {!isCurrentUser && (
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