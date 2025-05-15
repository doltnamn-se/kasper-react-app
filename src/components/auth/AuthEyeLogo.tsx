
import React from "react";

export const AuthEyeLogo: React.FC = () => {
  return (
    <a href="https://digitaltskydd.se/" className="inline-block mb-6">
      <img
        src="/lovable-uploads/ds-app-logo-auth-admin.png"
        alt="Logo"
        className="h-10 w-auto mx-auto pointer-events-none"
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
      />
    </a>
  );
};
