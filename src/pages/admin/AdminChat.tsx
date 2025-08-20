import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetOverlay } from '@/components/ui/sheet';
import { Send, ChevronUp, Search, Check, CheckCheck } from 'lucide-react';
import { useAdminChat } from '@/hooks/useAdminChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { formatDistanceToNow, format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatChatTimestamp } from '@/utils/dateUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export default function AdminChat() {
  const {
    userId
  } = useAuthStatus();
  const {
    t
  } = useLanguage();
  const isMobile = useIsMobile();
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  React.useEffect(() => {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      console.info('AdminChat: dark mode?', isDark, 'Left bubble dark class: #2f2f31');
    } catch {}
  }, []);
  const [newChatData, setNewChatData] = useState({
    customerId: ''
  });
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
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
    sendMessage,
    assignConversation,
    closeConversation,
    markAsRead,
    isCreatingConversation,
    isSendingMessage
  } = useAdminChat();

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

  // Fetch customers for admin conversation creation
  const {
    data: customersData = []
  } = useQuery({
    queryKey: ['all-customers'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('customers').select('id, profiles(display_name, email)');
      if (error) throw error;
      return data;
    }
  });
  const customers = customersData.map(c => ({
    id: c.id,
    profile: c.profiles
  }));
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId || !userId) return;
    sendMessage({
      conversationId: activeConversationId,
      message: newMessage,
      adminId: userId
    });
    setNewMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  const handleCreateConversation = () => {
    if (!newChatData.customerId || !userId) {
      console.log('Missing data for conversation creation:', { customerId: newChatData.customerId, userId });
      return;
    }
    
    console.log('Creating admin conversation with:', {
      customerId: newChatData.customerId,
      adminId: userId,
      isMobile
    });
    
    createConversation({
      customerId: newChatData.customerId,
      adminId: userId,
      chatData: {
        subject: 'Support',
        message: 'Admin has started a conversation with you.'
      }
    });
    setNewChatData({
      customerId: ''
    });
    setIsCreatingNew(false);
    // Open chat interface on mobile after creating conversation
    if (isMobile) {
      setIsChatOpen(true);
    }
  };
  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    if (userId) markAsRead(conversationId, userId);
    setIsCreatingNew(false);
    if (isMobile) setIsChatOpen(true);
  };
  const renderNewChatForm = (inSheet = false) => <Card className={`${inSheet ? '' : 'lg:col-span-2'} bg-white dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl`}>
      <CardHeader>
        <div className={`flex-shrink-0 p-0 bg-[#FFFFFF] dark:bg-[#1c1c1e] ${inSheet ? '' : 'rounded-t-2xl'}`}>
          <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{
            fontSize: '0.95rem'
          }}>
            Start New Conversation
          </h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Customer</label>
          <Popover open={customerDropdownOpen} onOpenChange={setCustomerDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={customerDropdownOpen}
                className="w-full justify-between"
              >
                {newChatData.customerId
                  ? customers.find(customer => customer.id === newChatData.customerId)?.profile?.display_name || 
                    customers.find(customer => customer.id === newChatData.customerId)?.profile?.email ||
                    'Unknown Customer'
                  : "Select a customer..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-[10001]" style={{ width: 'var(--radix-popover-trigger-width)' }}>
              <Command>
                <CommandInput placeholder="Search customers..." />
                <CommandList>
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map(customer => (
                      <CommandItem
                        key={customer.id}
                        value={`${customer.profile?.display_name || ''} ${customer.profile?.email || ''}`}
                        onSelect={() => {
                          setNewChatData(prev => ({
                            ...prev,
                            customerId: customer.id
                          }));
                          setCustomerDropdownOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            newChatData.customerId === customer.id ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {customer.profile?.display_name || customer.profile?.email || 'Unknown Customer'}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateConversation} disabled={!newChatData.customerId || isCreatingConversation} className="rounded-xl h-9">
            {isCreatingConversation ? 'Starting...' : 'Start Conversation'}
          </Button>
          <Button variant="outline" onClick={() => {
          setIsCreatingNew(false);
          if (inSheet) setIsChatOpen(false);
        }}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>;
  const renderChatInterface = (inSheet = false) => {
    if (inSheet) {
      return <div className="flex flex-col h-full">
          {activeConversationId ? <>
              {/* Fixed header */}
              <div className={`flex-shrink-0 p-4 bg-[#FFFFFF] dark:bg-[#1c1c1e] transition-all duration-200 ${showHeaderBorder ? 'shadow-sm dark:shadow-[0_1px_3px_0_#dadada0d]' : ''}`}>
                 <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{
              fontSize: '0.95rem'
            }}>
                   {(() => {
                     const activeConv = conversations.find(c => c.id === activeConversationId);
                     return activeConv?.customer?.profile?.display_name || activeConv?.customer?.profile?.email || 'Customer';
                   })()}
                 </h2>
                 <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{
              fontSize: '0.95rem'
            }}>
                   {(() => {
                     const activeConv = conversations.find(c => c.id === activeConversationId);
                     if (!activeConv?.created_at) return 'Chatting with customer';
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
                <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-0">
                  {messages.map((message, index) => {
                const isAdmin = message.sender?.role === 'super_admin';
                const isLastMessage = index === messages.length - 1;
                const isRead = message.read_at !== null && isAdmin; // Only show read status for admin's messages that have been read
                const statusText = isRead ? t('message.seen') : t('message.delivered');
                return <div key={message.id} className={`flex flex-col mb-4 ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 ${isAdmin ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'}`}>
                          <p className={`text-base break-words ${isAdmin ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}>{message.message}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-2">
                           <p className="text-xs font-medium" style={{
                       fontWeight: '500',
                       color: '#787878'
                     }}>
                             <span className="dark:hidden">{formatChatTimestamp(new Date(message.created_at), { today: t('today'), yesterday: t('yesterday') })}</span>
                             <span className="hidden dark:inline" style={{
                         color: '#ffffffa6'
                       }}>{formatChatTimestamp(new Date(message.created_at), { today: t('today'), yesterday: t('yesterday') })}</span>
                           </p>
                        {isLastMessage && isAdmin && (
                            <>
                              <span className="text-xs" style={{ color: '#787878' }}>
                                <span className="dark:hidden">·</span>
                                <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>·</span>
                              </span>
                              <p className="text-xs font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                                <span className="dark:hidden">{statusText}</span>
                                <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{statusText}</span>
                              </p>
                               {isRead ? (
                                 <>
                                   <CheckCheck className="w-3 h-3 dark:hidden" color="#59bffa" strokeWidth={2.5} />
                                   <CheckCheck className="w-3 h-3 hidden dark:inline" color="#007aff" strokeWidth={2.5} />
                                 </>
                               ) : (
                                 <div className="relative w-3 h-3">
                                   <svg className="w-3 h-3" viewBox="0 0 16 16">
                                     <circle cx="8" cy="8" r="8" className="fill-[#59bffa] dark:fill-[#007aff]" />
                                   </svg>
                                   <Check className="absolute inset-0 w-2 h-2 m-auto" strokeWidth={3} color="#ffffff" />
                                 </div>
                               )}
                            </>
                          )}
                        </div>
                      </div>;
            })}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </div>
              
              {/* Fixed bottom input area */}
              <div className="flex-shrink-0 px-2 pt-2 pb-10 border-t border-[#ecedee] dark:border-[#232325] bg-[#FFFFFF] dark:bg-[#1c1c1e]">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon" className="w-[2.2rem] h-[2.2rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0">
                    <span className="text-lg" style={{ fontWeight: 400, fontSize: '1.2rem', paddingBottom: '3px' }}>+</span>
                  </Button>
                  <div className="flex items-end gap-1 bg-[#f0f0f0] dark:bg-[#2f2f31] rounded-xl pl-4 pr-2 py-1.5 flex-1">
                    <textarea ref={textareaRef} value={newMessage} onChange={e => {
                  setNewMessage(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }} placeholder={t('nav.dashboard') === 'Översikt' ? 'Skriv här...' : 'Type here...'} className="flex-1 bg-transparent outline-none font-medium placeholder:text-[#707070] dark:placeholder:text-[#ffffffa6] resize-none overflow-hidden min-h-[20px] max-h-[120px]" style={{
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }} rows={1} onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }} />
                    <Button variant="ghost" onClick={handleSendMessage} disabled={!newMessage.trim() || isSendingMessage} size="icon" className={`w-6 h-6 rounded-full p-0 flex-shrink-0 disabled:opacity-100 ${!newMessage.trim() ? 'bg-[#d0ecfb] dark:bg-[#232324]' : 'dark:!bg-[#007aff]'}`} style={{
                  backgroundColor: newMessage.trim() ? '#59bffa' : undefined
                }}>
                      <ChevronUp className="h-6 w-6" color="#ffffff" stroke="#ffffff" />
                    </Button>
                  </div>
                </div>
              </div>
            </> : <div className="flex-1 flex items-center justify-center">
              <p className="text-[#8E8E93] text-lg text-center">
                Skriv för att börja konversationen
              </p>
            </div>}
        </div>;
    }
    return <Card className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl">
        {activeConversationId ? <>
            {/* Fixed header */}
            <div className={`flex-shrink-0 p-4 bg-[#FFFFFF] dark:bg-[#1c1c1e] rounded-t-2xl transition-all duration-200 ${showHeaderBorder ? 'shadow-sm dark:shadow-[0_1px_3px_0_#dadada0d]' : ''}`}>
               <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{
             fontSize: '0.95rem'
           }}>
                 {(() => {
                   const activeConv = conversations.find(c => c.id === activeConversationId);
                   return activeConv?.customer?.profile?.display_name || activeConv?.customer?.profile?.email || 'Customer';
                 })()}
               </h2>
               <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{
             fontSize: '0.95rem'
           }}>
                 {(() => {
                   const activeConv = conversations.find(c => c.id === activeConversationId);
                   if (!activeConv?.created_at) return 'Chatting with customer';
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
              <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-0">
                {messages.map((message, index) => {
              const isAdmin = message.sender?.role === 'super_admin';
              const isLastMessage = index === messages.length - 1;
              const isRead = message.read_at !== null && isAdmin; // Only show read status for admin's messages that have been read
              const statusText = isRead ? t('message.seen') : t('message.delivered');
              return <div key={message.id} className={`flex flex-col mb-4 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 ${isAdmin ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'}`}>
                        <p className={`text-base break-words ${isAdmin ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>{message.message}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-2">
                           <p className="text-xs font-medium" style={{
                       fontWeight: '500',
                       color: '#787878'
                     }}>
                             <span className="dark:hidden">{formatChatTimestamp(new Date(message.created_at), { today: t('today'), yesterday: t('yesterday') })}</span>
                             <span className="hidden dark:inline" style={{
                         color: '#ffffffa6'
                       }}>{formatChatTimestamp(new Date(message.created_at), { today: t('today'), yesterday: t('yesterday') })}</span>
                           </p>
                        {isLastMessage && isAdmin && (
                          <>
                            <span className="text-xs" style={{ color: '#787878' }}>
                              <span className="dark:hidden">·</span>
                              <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>·</span>
                            </span>
                            <p className="text-xs font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                              <span className="dark:hidden">{statusText}</span>
                              <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{statusText}</span>
                            </p>
                             {isRead ? (
                               <>
                                 <CheckCheck className="w-3 h-3 dark:hidden" color="#59bffa" strokeWidth={2.5} />
                                 <CheckCheck className="w-3 h-3 hidden dark:inline" color="#007aff" strokeWidth={2.5} />
                               </>
                             ) : (
                               <div className="relative w-3 h-3">
                                 <svg className="w-3 h-3" viewBox="0 0 16 16">
                                   <circle cx="8" cy="8" r="8" className="fill-[#59bffa] dark:fill-[#007aff]" />
                                 </svg>
                                 <Check className="absolute inset-0 w-2 h-2 m-auto" strokeWidth={3} color="#ffffff" />
                               </div>
                             )}
                          </>
                        )}
                      </div>
                    </div>;
            })}
                <div ref={messagesEndRef} />
              </ScrollArea>
            </div>
            
            {/* Fixed bottom input area */}
            <div className="flex-shrink-0 px-2 pt-2 pb-4 border-t border-[#ecedee] dark:border-[#232325] bg-[#FFFFFF] dark:bg-[#1c1c1e]">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="w-[2.2rem] h-[2.2rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0">
                  <span className="text-lg" style={{ fontWeight: 400, fontSize: '1.2rem', paddingBottom: '3px' }}>+</span>
                </Button>
                <div className="flex items-end gap-1 bg-[#f0f0f0] dark:bg-[#2f2f31] rounded-xl pl-4 pr-2 py-1.5 flex-1">
                  <textarea ref={textareaRef} value={newMessage} onChange={e => {
                setNewMessage(e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }} placeholder={t('nav.dashboard') === 'Översikt' ? 'Skriv här...' : 'Type here...'} className="flex-1 bg-transparent outline-none font-medium placeholder:text-[#707070] dark:placeholder:text-[#ffffffa6] resize-none overflow-hidden min-h-[20px] max-h-[120px]" style={{
                fontSize: '0.95rem',
                fontWeight: '500'
              }} rows={1} onKeyPress={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }} />
                  <Button variant="ghost" onClick={handleSendMessage} disabled={!newMessage.trim() || isSendingMessage} size="icon" className={`w-6 h-6 rounded-full p-0 flex-shrink-0 disabled:opacity-100 ${!newMessage.trim() ? 'bg-[#d0ecfb] dark:bg-[#232324]' : 'dark:!bg-[#007aff]'}`} style={{
                backgroundColor: newMessage.trim() ? '#59bffa' : undefined
              }}>
                    <ChevronUp className="h-6 w-6" color="#ffffff" stroke="#ffffff" />
                  </Button>
                </div>
              </div>
            </div>
          </> : <CardContent className="flex items-center justify-center h-[500px]">
            <p className="text-[#707070] dark:text-[#ffffffA6] underline decoration-dotted decoration-[#24CC5C] decoration-1 underline-offset-2">
              {t('select.conversation.to.chat')}
            </p>
          </CardContent>}
      </Card>;
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <h1>
          {t('nav.admin.support')}
        </h1>
        {!isMobile && <Button onClick={() => {
        setIsCreatingNew(true);
        setActiveConversationId(null);
        if (isMobile) setIsChatOpen(true);
      }} className="rounded-xl h-9">
            {t('new.message')}
          </Button>}
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isMobile ? '' : 'lg:grid-cols-3 h-[600px]'}`}>
        {/* Conversations List */}
        <Card className={`${isMobile ? '' : 'lg:col-span-1'} bg-white dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-medium text-[#121212] dark:text-[#ffffff]">{t('inbox')}</CardTitle>
              <div className="bg-[#121212] text-white dark:bg-white dark:text-[#121212] w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs md:text-[0.9rem] font-medium md:pb-[2px]" style={{
              paddingRight: '1px'
            }}>
                {conversations.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className={`${isMobile ? 'h-[400px]' : 'h-[500px]'}`}>
              {conversations.map(conversation => <div key={conversation.id} className={`p-4 border-b border-gray-200 dark:border-[#2f2f31] cursor-pointer ${!isMobile ? 'hover:bg-[#f0f0f0] dark:hover:bg-[#232324]' : ''} ${activeConversationId === conversation.id && !isMobile ? 'bg-[#f0f0f0] dark:bg-[#232324]' : ''}`} onClick={() => handleConversationSelect(conversation.id)}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">
                      {conversation.customer?.profile?.display_name || 'Customer'}
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
                </div>)}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mobile New Message Button */}
        {isMobile && <Button onClick={() => {
        setIsCreatingNew(true);
        setActiveConversationId(null);
        if (isMobile) setIsChatOpen(true);
      }} className="w-full rounded-xl h-9">
            {t('new.message')}
          </Button>}

        {/* Desktop Chat Interface or Mobile Sheet */}
        {!isMobile ? isCreatingNew ? renderNewChatForm() : renderChatInterface() : <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
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
                  {isCreatingNew ? renderNewChatForm(true) : renderChatInterface(true)}
                </div>
              </SheetContent>
            </Sheet>}
      </div>
    </div>;
}