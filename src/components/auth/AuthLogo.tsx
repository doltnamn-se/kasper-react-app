import React from "react";

interface AuthLogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AuthLogo: React.FC<AuthLogoProps> = ({ className, ...props }) => {
  return (
    <div className={className} {...props}>
      <img
        src="/lovable-uploads/868b20a1-c3f1-404c-b8da-9d33fe738d9d.png"
        alt="Logo"
        className="w-auto h-full"
      />
    </div>
  );
};