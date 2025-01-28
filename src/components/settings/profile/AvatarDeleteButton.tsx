import { X } from "lucide-react";

interface AvatarDeleteButtonProps {
  onDelete: () => void;
  show: boolean;
}

export const AvatarDeleteButton = ({ onDelete, show }: AvatarDeleteButtonProps) => {
  if (!show) return null;

  return (
    <button
      onClick={onDelete}
      className="absolute -top-1 -right-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    >
      <X className="h-4 w-4" />
    </button>
  );
};