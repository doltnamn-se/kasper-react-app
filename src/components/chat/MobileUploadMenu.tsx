import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image, FileText } from 'lucide-react';

interface MobileUploadMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onCameraCapture: () => void;
  onPhotoUpload: () => void;
  onFileUpload: () => void;
}

export const MobileUploadMenu: React.FC<MobileUploadMenuProps> = ({
  isOpen,
  onToggle,
  onCameraCapture,
  onPhotoUpload,
  onFileUpload
}) => {
  const handleOptionSelect = (action: () => void) => {
    onToggle(); // Close the menu
    action();
  };

  return (
    <div className="relative">
      {/* Upload options - absolutely positioned to not affect layout */}
      <div className={`absolute bottom-[3rem] -left-6 flex flex-col gap-2 transition-all duration-300 ease-out ${
        isOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {/* Take Photo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleOptionSelect(onCameraCapture)}
          className="w-[3rem] h-[3rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
        >
          <Camera className="w-5 h-5 text-[#121212] dark:text-[#ffffff]" />
        </Button>

        {/* Upload Photo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleOptionSelect(onPhotoUpload)}
          className="w-[3rem] h-[3rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
        >
          <Image className="w-5 h-5 text-[#121212] dark:text-[#ffffff]" />
        </Button>

        {/* Upload File */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleOptionSelect(onFileUpload)}
          className="w-[3rem] h-[3rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
        >
          <FileText className="w-5 h-5 text-[#121212] dark:text-[#ffffff]" />
        </Button>
      </div>

      {/* Upload trigger button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="w-[2.2rem] h-[2.2rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
      >
        <span 
          className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
          style={{ fontWeight: 400, fontSize: '1.2rem', paddingBottom: '3px' }}
        >
          +
        </span>
      </Button>
    </div>
  );
};