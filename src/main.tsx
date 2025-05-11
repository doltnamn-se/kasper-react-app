
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css'; // Updated path to the new CSS structure
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Toaster as SonnerToaster } from "sonner";
import { LanguageProvider } from './contexts/LanguageContext';
import { SidebarProvider } from './contexts/SidebarContext';

// Initialize the QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Call the element loader
defineCustomElements(window);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <SidebarProvider>
            <App />
            <SonnerToaster position="top-right" />
            <Toaster />
          </SidebarProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
