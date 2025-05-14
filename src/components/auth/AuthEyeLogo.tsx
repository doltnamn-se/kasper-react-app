
import React from "react";

export const AuthEyeLogo: React.FC = () => {
  return (
    <div className="inline-block mb-6">
      <img
        src="/lovable-uploads/icon-192.png"
        alt="Logo"
        className="h-10 w-auto mx-auto pointer-events-none"
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};
