
import React from "react";
import { useTheme } from "next-themes";

export const AuthEyeLogo: React.FC = () => {
  const { resolvedTheme } = useTheme();
  
  return (
    <a href="https://digitaltskydd.se/" className="inline-block mb-6">
      <img
        src="/lovable-uploads/ds-app-logo-auth-admin.png"
        alt="Digitaltskydd Logo"
        className="h-10 w-auto mx-auto pointer-events-none"
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
      />
    </a>
  );
};
