import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language } = useLanguage();
  
  const getButtonText = (type: 'camera' | 'photo' | 'file') => {
    if (language === 'sv') {
      switch (type) {
        case 'camera': return 'Ta en bild';
        case 'photo': return 'Ladda upp bild';
        case 'file': return 'Ladda upp fil';
      }
    } else {
      switch (type) {
        case 'camera': return 'Take a photo';
        case 'photo': return 'Upload photo';
        case 'file': return 'Upload file';
      }
    }
  };
  
  const handleOptionSelect = (action: () => void) => {
    onToggle(); // Close the menu
    action();
  };

  return (
    <div className="relative">
      {/* Upload options - absolutely positioned to not affect layout */}
      <div className={`absolute bottom-[3rem] left-0 flex flex-col gap-2 transition-all duration-300 ease-out ${
        isOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {/* Take Photo */}
        <Button
          variant="ghost"
          onClick={() => handleOptionSelect(onCameraCapture)}
          className="w-auto h-[3rem] px-4 rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] flex items-center gap-3 flex-shrink-0"
        >
          <Camera className="w-5 h-5 text-[#121212] dark:text-[#ffffff]" />
          <span className="text-sm font-medium text-[#121212] dark:text-[#ffffff] whitespace-nowrap">
            {getButtonText('camera')}
          </span>
        </Button>

        {/* Upload Photo */}
        <Button
          variant="ghost"
          onClick={() => handleOptionSelect(onPhotoUpload)}
          className="w-auto h-[3rem] px-4 rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] flex items-center gap-3 flex-shrink-0"
        >
          <Image className="w-5 h-5 text-[#121212] dark:text-[#ffffff]" />
          <span className="text-sm font-medium text-[#121212] dark:text-[#ffffff] whitespace-nowrap">
            {getButtonText('photo')}
          </span>
        </Button>

        {/* Upload File */}
        <Button
          variant="ghost"
          onClick={() => handleOptionSelect(onFileUpload)}
          className="w-auto h-[3rem] px-4 rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] flex items-center gap-3 flex-shrink-0"
        >
          <FileText className="w-5 h-5 text-[#121212] dark:text-[#ffffff]" />
          <span className="text-sm font-medium text-[#121212] dark:text-[#ffffff] whitespace-nowrap">
            {getButtonText('file')}
          </span>
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