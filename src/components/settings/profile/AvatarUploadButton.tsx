import { Upload } from "lucide-react";

interface AvatarUploadButtonProps {
  isUploading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AvatarUploadButton = ({ isUploading, onUpload }: AvatarUploadButtonProps) => {
  const handleUploadClick = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="absolute -bottom-1 -right-1">
      <div className="relative w-8 h-8">
        <input
          type="file"
          onChange={onUpload}
          accept="image/*"
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Upload avatar"
        />
        <button 
          className="absolute inset-0 w-full h-full bg-[#e0e0e0] hover:bg-[#d0d0d0] dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b] rounded-full flex items-center justify-center transition-colors cursor-pointer"
          type="button"
          onClick={handleUploadClick}
        >
          <Upload className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};