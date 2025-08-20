import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetOverlay } from '@/components/ui/sheet';
import { Send, ChevronUp, Check } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { formatDistanceToNow, format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/layout/MainLayout';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Chat() {
  const { userId } = useAuthStatus();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  React.useEffect(() => {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      console.info('UserChat: dark mode?', isDark, 'Left bubble dark class: #2f2f31');
    } catch {}
  }, []);
  const [newChatData, setNewChatData] = useState({
    subject: '',
    message: ''
  });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Helper to reliably scroll to bottom (used for mobile sheet)
  const scrollToBottom = React.useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, []);
  
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    createEmptyConversation,
    sendMessage,
    markAsRead,
    isCreatingConversation,
    isCreatingEmptyConversation,
    isSendingMessage
  } = useChat(userId);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current && activeConversationId) {
      // For mobile, we need to scroll within the ScrollArea viewport
      if (isMobile && scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          setTimeout(() => {
            viewport.scrollTop = viewport.scrollHeight;
          }, 100);
        }
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, activeConversationId, isMobile]);

  // Ensure scroll to latest when mobile sheet opens (with retries)
  React.useEffect(() => {
    if (isMobile && isChatOpen && messagesEndRef.current) {
      let rafId = 0;
      let tries = 0;
      const maxTries = 20;
      const tick = () => {
        scrollToBottom();
        if (tries++ < maxTries) rafId = requestAnimationFrame(tick);
      };
      // Start after small delay to allow sheet animation/layout
      const start = setTimeout(() => {
        tick();
      }, 100);
      return () => {
        clearTimeout(start);
        cancelAnimationFrame(rafId);
      };
    }
  }, [isMobile, isChatOpen, activeConversationId, messages.length, scrollToBottom]);

  // Handle scroll to show/hide header shadow
  const handleScroll = React.useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    setShowHeaderBorder(scrollTop > 10);
  }, []);

  // Set up scroll listener with timeout for mobile sheet rendering
  React.useEffect(() => {
    const attachScrollListener = () => {
      const root = scrollAreaRef.current;
      const scrollContainer = root?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };

    // For mobile sheet, add a small delay to ensure DOM is ready
    if (isChatOpen && isMobile) {
      const timeout = setTimeout(attachScrollListener, 100);
      return () => clearTimeout(timeout);
    } else {
      return attachScrollListener();
    }
  }, [handleScroll, activeConversationId, isChatOpen, isMobile]);

  // Reset header shadow when switching conversations or opening sheet
  React.useEffect(() => {
    setShowHeaderBorder(false);
  }, [activeConversationId, isChatOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId) return;
    sendMessage({ conversationId: activeConversationId, message: newMessage });
    setNewMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleCreateConversation = () => {
    if (!newChatData.message.trim()) return;
    createConversation(newChatData);
    setNewChatData({ subject: '', message: '' });
    setIsCreatingNew(false);
  };

  const handleStartNewChat = () => {
    createEmptyConversation('Support');
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    markAsRead(conversationId);
    setIsCreatingNew(false);
    if (isMobile) setIsChatOpen(true);
  };

  const renderNewChatForm = (inSheet = false) => (
    <Card className={`${inSheet ? '' : 'lg:col-span-2'} bg-white dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl`}>
      <CardHeader>
        <CardTitle>Start New Conversation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Subject (Optional)</label>
          <Input
            value={newChatData.subject}
            onChange={(e) => setNewChatData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="What is this about?"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Message</label>
          <Textarea
            value={newChatData.message}
            onChange={(e) => setNewChatData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Describe your issue or question..."
            className="min-h-[120px]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateConversation}
            disabled={!newChatData.message.trim() || isCreatingConversation}
          >
            {isCreatingConversation ? 'Starting...' : 'Start Conversation'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsCreatingNew(false);
              if (inSheet) setIsChatOpen(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderChatInterface = (inSheet = false) => {
    if (inSheet) {
      return (
        <div className="flex flex-col h-full">
          {activeConversationId ? (
            <>
              {/* Fixed header */}
              <div className={`flex-shrink-0 p-4 bg-[#FFFFFF] dark:bg-[#1c1c1e] transition-all duration-200 ${showHeaderBorder ? 'shadow-sm dark:shadow-[0_1px_3px_0_#dadada0d]' : ''}`}>
                <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{ fontSize: '0.95rem' }}>
                  Nytt meddelande
                </h2>
                 <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{ fontSize: '0.95rem' }}>
                   {(() => {
                     const activeConv = conversations.find(c => c.id === activeConversationId);
                     if (!activeConv?.created_at) return 'Skriv för att börja konversationen';
                     const date = new Date(activeConv.created_at);
                     const currentLang = t('nav.dashboard') === 'Översikt' ? 'sv' : 'en';
                     if (currentLang === 'sv') {
                        return `Inskickat ${format(date, 'd MMMM yyyy', { locale: sv })}`;
                     } else {
                       return `Submitted ${format(date, 'MMMM do, yyyy')}`;
                     }
                   })()}
                 </p>
              </div>
              
              {/* Scrollable messages area */}
              <div className="flex-1 overflow-hidden">
                 <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-2">
                   {messages.map((message, index) => {
                      const isCurrentUser = message.sender_id === userId;
                      const isLastMessage = index === messages.length - 1;
                      const isRead = message.read_at !== null && isCurrentUser; // Only show read status for current user's messages that have been read
                      const statusText = isRead ? t('message.read') : t('message.delivered');
                     return (
                       <div
                         key={message.id}
                         className={`flex flex-col mb-4 ${isCurrentUser ? 'items-end' : 'items-start'}`}
                       >
                         <div
                           className={`max-w-[80%] px-3 py-2 ${
                             isCurrentUser 
                               ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' 
                               : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'
                           }`}
                         >
                           <p className={`text-base break-words ${isCurrentUser ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{ fontSize: '0.95rem', fontWeight: '500' }}>{message.message}</p>
                         </div>
                         <div className="flex items-center gap-1 mt-1 px-2">
                           <p className="text-xs font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                             <span className="dark:hidden">{format(new Date(message.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                             <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{format(new Date(message.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                           </p>
                         {isLastMessage && isCurrentUser && (
                             <>
                               <span className="text-xs" style={{ color: '#787878' }}>
                                 <span className="dark:hidden">·</span>
                                 <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>·</span>
                               </span>
                                <p className="text-xs font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                                  <span className="dark:hidden">{statusText}</span>
                                  <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{statusText}</span>
                                </p>
                                <div className="relative w-3 h-3">
                                  <svg className="w-3 h-3" viewBox="0 0 16 16">
                                    <circle cx="8" cy="8" r="8" className="fill-[#59bffa] dark:fill-[#007aff]" />
                                  </svg>
                                   <Check className="absolute inset-0 w-2 h-2 m-auto" strokeWidth={3} color="#ffffff" />
                                </div>
                             </>
                           )}
                         </div>
                     </div>
                   );
                 })}
                   <div ref={messagesEndRef} />
                 </ScrollArea>
              </div>
              
              {/* Fixed bottom input area */}
              <div className="flex-shrink-0 px-2 pt-2 pb-10 border-t border-[#ecedee] dark:border-[#232325] bg-[#FFFFFF] dark:bg-[#1c1c1e]">
                <div className="flex items-end gap-2">
                   <Button
                    variant="ghost"
                    size="icon"
                    className="w-[2.2rem] h-[2.2rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
                  >
                    <span className="text-lg" style={{ fontWeight: 400, fontSize: '1.2rem', paddingBottom: '3px' }}>+</span>
                  </Button>
                  <div className="flex items-end gap-1 bg-[#f0f0f0] dark:bg-[#2f2f31] rounded-xl pl-4 pr-2 py-1.5 flex-1">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      placeholder={t('nav.dashboard') === 'Översikt' ? 'Skriv här...' : 'Type here...'}
                      className="flex-1 bg-transparent outline-none font-medium placeholder:text-[#707070] dark:placeholder:text-[#ffffffa6] resize-none overflow-hidden min-h-[20px] max-h-[120px]"
                      style={{ fontSize: '0.95rem', fontWeight: '500' }}
                      rows={1}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSendingMessage}
                      size="icon"
                      className={`w-6 h-6 rounded-full p-0 flex-shrink-0 disabled:opacity-100 ${
                        !newMessage.trim() 
                        ? 'bg-[#d0ecfb] dark:bg-[#232324]'
                          : 'dark:!bg-[#007aff]'
                      }`}
                      style={{ backgroundColor: newMessage.trim() ? '#59bffa' : undefined }}
                    >
                      <ChevronUp className="h-6 w-6" color="#ffffff" stroke="#ffffff" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#8E8E93] text-lg text-center">
                Skriv för att börja konversationen
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <Card className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl">
        {activeConversationId ? (
          <>
            {/* Fixed header */}
            <div className={`flex-shrink-0 p-4 bg-[#FFFFFF] dark:bg-[#1c1c1e] rounded-t-2xl transition-all duration-200 ${showHeaderBorder ? 'shadow-sm dark:shadow-[0_1px_3px_0_#dadada0d]' : ''}`}>
              <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{ fontSize: '0.95rem' }}>
                Nytt meddelande
              </h2>
               <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{ fontSize: '0.95rem' }}>
                 {(() => {
                   const activeConv = conversations.find(c => c.id === activeConversationId);
                   if (!activeConv?.created_at) return 'Skriv för att börja konversationen';
                   const date = new Date(activeConv.created_at);
                   const currentLang = t('nav.dashboard') === 'Översikt' ? 'sv' : 'en';
                   if (currentLang === 'sv') {
                     return `Inskickat ${format(date, 'd MMMM yyyy', { locale: sv })}`;
                   } else {
                     return `Submitted ${format(date, 'MMMM do, yyyy')}`;
                   }
                 })()}
               </p>
            </div>
            
            {/* Scrollable messages area */}
            <div className="flex-1 h-[450px] overflow-hidden">
               <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-2">
                 {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === userId;
                    const isLastMessage = index === messages.length - 1;
                    const isRead = message.read_at !== null && isCurrentUser; // Only show read status for current user's messages that have been read
                    const statusText = isRead ? t('message.read') : t('message.delivered');
                   return (
                     <div
                       key={message.id}
                       className={`flex flex-col mb-4 ${isCurrentUser ? 'items-end' : 'items-start'}`}
                     >
                       <div
                         className={`max-w-[80%] px-3 py-2 ${
                           isCurrentUser 
                             ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' 
                             : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'
                         }`}
                       >
                         <p className={`text-base break-words ${isCurrentUser ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{ fontSize: '0.95rem', fontWeight: '500' }}>{message.message}</p>
                       </div>
                       <div className="flex items-center gap-1 mt-1 px-2">
                         <p className="text-xs font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                           <span className="dark:hidden">{format(new Date(message.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                           <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{format(new Date(message.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                         </p>
                         {isLastMessage && isCurrentUser && (
                           <>
                             <span className="text-xs" style={{ color: '#787878' }}>
                               <span className="dark:hidden">·</span>
                               <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>·</span>
                             </span>
                              <p className="text-xs font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                                <span className="dark:hidden">{statusText}</span>
                                <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{statusText}</span>
                              </p>
                                <div className="relative w-3 h-3">
                                  <svg className="w-3 h-3" viewBox="0 0 16 16">
                                    <circle cx="8" cy="8" r="8" className="fill-[#59bffa] dark:fill-[#007aff]" />
                                  </svg>
                                  <Check className="absolute inset-0 w-2 h-2 m-auto" strokeWidth={3} color="#ffffff" />
                                </div>
                           </>
                         )}
                       </div>
                   </div>
                 );
               })}
                 <div ref={messagesEndRef} />
               </ScrollArea>
            </div>
            
            {/* Fixed bottom input area */}
            <div className="flex-shrink-0 px-2 pt-2 pb-4 border-t border-[#ecedee] dark:border-[#232325] bg-[#FFFFFF] dark:bg-[#1c1c1e]">
              <div className="flex items-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-[2.2rem] h-[2.2rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
                >
                  <span className="text-lg" style={{ fontWeight: 400, fontSize: '1.2rem', paddingBottom: '3px' }}>+</span>
                </Button>
                <div className="flex items-end gap-1 bg-[#f0f0f0] dark:bg-[#2f2f31] rounded-xl pl-4 pr-2 py-1.5 flex-1">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder={t('nav.dashboard') === 'Översikt' ? 'Skriv här...' : 'Type here...'}
                    className="flex-1 bg-transparent outline-none font-medium placeholder:text-[#707070] dark:placeholder:text-[#ffffffa6] resize-none overflow-hidden min-h-[20px] max-h-[120px]"
                    style={{ fontSize: '0.95rem', fontWeight: '500' }}
                    rows={1}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSendingMessage}
                    size="icon"
                    className={`w-6 h-6 rounded-full p-0 flex-shrink-0 disabled:opacity-100 ${
                      !newMessage.trim() 
                        ? 'bg-[#d0ecfb] dark:bg-[#232324]' 
                        : 'dark:!bg-[#007aff]'
                    }`}
                    style={{ backgroundColor: newMessage.trim() ? '#59bffa' : undefined }}
                  >
                    <ChevronUp className="h-6 w-6" color="#ffffff" stroke="#ffffff" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-[500px]">
            <p className="text-[#707070] dark:text-[#ffffffA6] underline decoration-dotted decoration-[#59bffa] decoration-1 underline-offset-2">
              {t('select.conversation.to.chat')}
            </p>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1>
            {t('nav.admin.support')}
          </h1>
          {!isMobile && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl h-9 bg-[#f0f0f0] hover:bg-[#e0e0e0] dark:bg-[#303032] dark:hover:bg-[#404044]"
                onClick={() => window.open('https://joinkasper.com/support/', '_blank')}
              >
                {t('general.questions')}
              </Button>
              <Button
                onClick={handleStartNewChat}
                className="rounded-xl h-9"
              >
                {t('new.message')}
              </Button>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-6 ${isMobile ? '' : 'lg:grid-cols-3 h-[600px]'}`}>
          {/* Conversations List */}
          <Card className={`${isMobile ? '' : 'lg:col-span-1'} bg-white dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl`}>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-[#121212] dark:text-[#ffffff]">{t('inbox')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className={`${isMobile ? 'h-[400px]' : 'h-[500px]'}`}>
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-gray-200 dark:border-[#2f2f31] cursor-pointer ${!isMobile ? 'hover:bg-[#f0f0f0] dark:hover:bg-[#232324]' : ''} ${
                      activeConversationId === conversation.id && !isMobile ? 'bg-[#f0f0f0] dark:bg-[#232324]' : ''
                    }`}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">
                        {(conversation.subject === 'Support Request' || conversation.subject === 'Support Chat') ? 'Support' : (conversation.subject || 'Support')}
                      </h4>
                      <p className="text-xs text-[#121212] dark:text-[#FFFFFF] font-medium">
                        {conversation.last_message_at && (() => {
                          const currentLang = t('nav.dashboard') === 'Översikt' ? 'sv' : 'en';
                          return formatDistanceToNow(new Date(conversation.last_message_at), { 
                            addSuffix: true,
                            locale: currentLang === 'sv' ? sv : undefined
                          });
                        })()}
                      </p>
                    </div>
                    <p className="text-[#707070] dark:text-[#FFFFFFA6] font-medium truncate" style={{ fontSize: '0.875rem' }}>
                      {conversation.last_message || 'No messages yet'}
                    </p>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div className="p-4 text-center text-[#707070] dark:text-[#ffffffa6] text-[0.8rem] md:text-[0.9rem]">
                    {t('no.message.history')}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Mobile Buttons */}
          {isMobile && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="rounded-xl h-9 bg-[#f0f0f0] hover:bg-[#e0e0e0] dark:bg-[#303032] dark:hover:bg-[#404044]"
                onClick={() => window.open('https://joinkasper.com/support/', '_blank')}
              >
                {t('general.questions')}
              </Button>
              <Button
                onClick={handleStartNewChat}
                className="rounded-xl h-9"
              >
                {t('new.message')}
              </Button>
            </div>
          )}

          {/* Desktop Chat Interface or Mobile Sheet */}
          {!isMobile ? (
            renderChatInterface()
          ) : (
            <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
              <SheetOverlay className="backdrop-blur-md" />
              <SheetContent
                side="bottom"
                className="h-[93vh] p-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#1c1c1e] border-none rounded-t-[1rem]"
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                  setTimeout(() => {
                    scrollToBottom();
                    setTimeout(scrollToBottom, 150);
                    setTimeout(scrollToBottom, 350);
                  }, 50);
                }}
              >
                <div className="flex flex-col h-full relative z-[10001]">
                  {renderChatInterface(true)}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </MainLayout>
  );
}