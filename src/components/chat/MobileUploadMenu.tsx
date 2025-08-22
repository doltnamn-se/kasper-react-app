import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobileUploadMenuProps {
  onCameraCapture: () => void;
  onPhotoUpload: () => void;
  onFileUpload: () => void;
}

export const MobileUploadMenu: React.FC<MobileUploadMenuProps> = ({
  onCameraCapture,
  onPhotoUpload,
  onFileUpload
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionSelect = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      {/* Upload trigger button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="w-[2.2rem] h-[2.2rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
      >
        <span className="text-lg" style={{ fontWeight: 400, fontSize: '1.2rem', paddingBottom: '3px' }}>+</span>
      </Button>

      {/* Upload options sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-auto p-0 bg-[#ffffff] dark:bg-[#1c1c1e] border-none rounded-t-2xl">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="text-center text-[#121212] dark:text-[#ffffff]">
              Choose Option
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-4 space-y-3">
            {/* Take Photo */}
            <Button
              variant="ghost"
              onClick={() => handleOptionSelect(onCameraCapture)}
              className="w-full h-14 justify-start gap-4 bg-[#f8f9fa] dark:bg-[#2f2f31] hover:bg-[#e9ecef] dark:hover:bg-[#3a3a3c] rounded-xl"
            >
              <div className="w-8 h-8 rounded-full bg-[#007aff] flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#121212] dark:text-[#ffffff] font-medium">Take Photo</span>
            </Button>

            {/* Upload Photo */}
            <Button
              variant="ghost"
              onClick={() => handleOptionSelect(onPhotoUpload)}
              className="w-full h-14 justify-start gap-4 bg-[#f8f9fa] dark:bg-[#2f2f31] hover:bg-[#e9ecef] dark:hover:bg-[#3a3a3c] rounded-xl"
            >
              <div className="w-8 h-8 rounded-full bg-[#34c759] flex items-center justify-center">
                <Image className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#121212] dark:text-[#ffffff] font-medium">Upload Photo</span>
            </Button>

            {/* Upload File */}
            <Button
              variant="ghost"
              onClick={() => handleOptionSelect(onFileUpload)}
              className="w-full h-14 justify-start gap-4 bg-[#f8f9fa] dark:bg-[#2f2f31] hover:bg-[#e9ecef] dark:hover:bg-[#3a3a3c] rounded-xl"
            >
              <div className="w-8 h-8 rounded-full bg-[#ff9500] flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#121212] dark:text-[#ffffff] font-medium">Upload File</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};