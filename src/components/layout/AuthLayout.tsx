
import React, { ReactNode } from 'react';
import { AuthLogo } from '../auth/AuthLogo';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#161618] flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 p-4">
        <AuthLogo className="h-8 w-auto mx-auto" />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} DigitaltSkydd
      </footer>
    </div>
  );
};
