import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isChatFullScreenOpen: boolean;
  setIsChatFullScreenOpen: (isOpen: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatFullScreenOpen, setIsChatFullScreenOpen] = useState(false);

  return (
    <ChatContext.Provider value={{ isChatFullScreenOpen, setIsChatFullScreenOpen }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};
