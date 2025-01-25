import { cn } from "@/lib/utils";

interface SearchBackdropProps {
  isSearchFocused: boolean;
  onClose: () => void;
}

export const SearchBackdrop = ({ isSearchFocused, onClose }: SearchBackdropProps) => {
  return (
    <div 
      className={cn(
        "fixed inset-0 backdrop-blur-[2px] z-[39] transition-all duration-300 ease-in-out",
        isSearchFocused ? "opacity-100 visible" : "opacity-0 invisible"
      )}
      onClick={onClose}
    />
  );
};