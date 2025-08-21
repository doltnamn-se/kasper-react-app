import React, { useState } from 'react';
import { Download, Eye, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    window.open(attachmentUrl, '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <Image className="w-6 h-6 text-gray-500" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'document':
        return <FileText className="w-6 h-6 text-blue-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const renderPreview = () => {
    if (fileType === 'image' && !imageError) {
      return (
        <img
          src={attachmentUrl}
          alt={fileName}
          className="w-full h-full object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg">
        {renderFileIcon()}
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1 uppercase">
          {fileExt}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`relative w-64 h-32 rounded-lg border-2 border-dashed transition-all duration-200 ${
        isCurrentUser 
          ? 'border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
      } hover:shadow-md cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* File preview */}
      <div className="w-full h-full p-2">
        {renderPreview()}
      </div>

      {/* File name overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t ${
        isCurrentUser 
          ? 'from-blue-900/80 to-transparent' 
          : 'from-gray-900/80 to-transparent'
      } rounded-b-lg`}>
        <p className="text-xs font-medium text-white truncate" title={fileName}>
          {fileName}
        </p>
      </div>

      {/* Hover buttons */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleView}
            className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
};