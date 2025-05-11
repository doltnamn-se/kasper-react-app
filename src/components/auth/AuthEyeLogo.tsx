
import React from "react";
import { Eye } from "lucide-react";

interface AuthEyeLogoProps {
  size?: number;
  className?: string;
}

export const AuthEyeLogo: React.FC<AuthEyeLogoProps> = ({ size = 40, className = "" }) => {
  return (
    <div className={`rounded-full bg-[#20a5fb] p-2 flex items-center justify-center ${className}`}>
      <Eye size={size} color="white" strokeWidth={2} />
    </div>
  );
};
