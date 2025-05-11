
import React from "react";

export const AuthEyeLogo: React.FC = () => {
  return (
    <a href="https://digitaltskydd.se/" className="inline-block mb-4">
      <img
        src="/lovable-uploads/digitaltskydd-admin-logo.svg"
        alt="Logo"
        className="h-12 w-auto mx-auto pointer-events-none"
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
      />
    </a>
  );
};
