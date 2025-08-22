import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetOverlay } from '@/components/ui/sheet';
import { Send, ChevronUp, Search, Check, CheckCheck, UserRound, Archive } from 'lucide-react';
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
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { CustomerDetailsSheet } from '@/components/admin/customers/CustomerDetailsSheet';
import { CustomerWithProfile } from '@/types/customer';
import { FileAttachment } from '@/components/chat/FileAttachment';
import { MobileUploadMenu } from '@/components/chat/MobileUploadMenu';
export default function AdminChat() {
  const { userId } = useAuthStatus();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [isDraftConversation, setIsDraftConversation] = useState(false);
  const [draftCustomerId, setDraftCustomerId] = useState<string | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'archive'>('inbox');
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<CustomerWithProfile | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [newChatData, setNewChatData] = useState({
    customerId: ''
  });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Use separate hooks for active and archived conversations
  const inboxData = useAdminChat('active');
  const archiveData = useAdminChat('closed');
  
  // Get data based on active tab
  const {
    conversations,
    messages,
    activeConversationId,
    adminProfile,
    loadingConversations,
    loadingMessages,
    setActiveConversationId,
    createConversation,
    createConversationWithMessage,
    sendMessage,
    assignConversation,
    closeConversation,
    markAsRead,
    isCreatingConversation,
    isCreatingConversationWithMessage,
    isSendingMessage,
    typingUsers,
    startTyping,
    stopTyping
  } = activeTab === 'inbox' ? inboxData : archiveData;

  // Set up stable viewport height and keyboard detection for iOS
  React.useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    
    // iOS keyboard detection via visualViewport
    if (window.visualViewport) {
      const handleViewportChange = () => {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(heightDiff > 150 ? heightDiff : 0);
      };
      
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => {
        window.removeEventListener('resize', setVH);
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }
    
    return () => window.removeEventListener('resize', setVH);
  }, []);

  // Helper to reliably scroll to bottom (used for mobile sheet) - simplified to prevent keyboard jumps
  const scrollToBottom = React.useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);

  React.useEffect(() => {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      console.info('AdminChat: dark mode?', isDark, 'Left bubble dark class: #2f2f31');
    } catch {}
  }, []);

  // Auto-scroll to bottom when new messages arrive - simplified to prevent keyboard jumps
  React.useEffect(() => {
    if (messages.length > 0 && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        // Use requestAnimationFrame for smooth scrolling without triggering viewport changes
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  }, [messages, activeConversationId]);

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
    if (!newMessage.trim() || !userId) return;

    if (isDraftConversation && draftCustomerId) {
      createConversationWithMessage({
        customerId: draftCustomerId,
        adminId: userId,
        message: newMessage,
        subject: 'Support'
      });
      setIsDraftConversation(false);
      setDraftCustomerId(null);
    } else if (activeConversationId) {
      sendMessage({
        conversationId: activeConversationId,
        message: newMessage,
        adminId: userId
      });
    }

    // Stop typing indicator when message is sent
    stopTyping();
    
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

    // Enter draft mode: do NOT create a conversation yet
    setDraftCustomerId(newChatData.customerId);
    setIsDraftConversation(true);
    setActiveConversationId(null);

    setNewChatData({ customerId: '' });
    setIsCreatingNew(false);
    if (isMobile) {
      setIsChatOpen(true);
    }
  };
  const handleConversationSelect = (conversationId: string) => {
    setIsDraftConversation(false);
    setDraftCustomerId(null);
    setActiveConversationId(conversationId);
    if (userId) markAsRead(conversationId, userId);
    setIsCreatingNew(false);
    if (isMobile) setIsChatOpen(true);
  };

  const handleOpenCustomerProfile = async () => {
    const activeConv = conversations.find(c => c.id === activeConversationId);
    if (activeConv?.customer?.id) {
      try {
        // Fetch full customer data with profile
        const { data: customer, error } = await supabase
          .from('customers')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('id', activeConv.customer.id)
          .single();

        if (error) {
          console.error('Error fetching customer:', error);
          return;
        }

        if (customer) {
          setSelectedCustomerProfile(customer as CustomerWithProfile);
        }
      } catch (error) {
        console.error('Error fetching customer profile:', error);
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setIsUploadingFile(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (error) throw error;

      // Send message with attachment (store path, not public URL)
      const messageText = file.name;
      
      if (isDraftConversation && draftCustomerId) {
        createConversationWithMessage({
          customerId: draftCustomerId,
          adminId: userId,
          message: messageText,
          subject: 'Support',
          attachmentUrl: data.path
        });
        setIsDraftConversation(false);
        setDraftCustomerId(null);
      } else if (activeConversationId) {
        sendMessage({
          conversationId: activeConversationId,
          message: messageText,
          adminId: userId,
          attachmentUrl: data.path
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploadingFile(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Mobile upload handlers
  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handlePhotoUpload = () => {
    photoInputRef.current?.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleToggleUploadMenu = () => {
    setIsUploadMenuOpen(!isUploadMenuOpen);
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
          <Button onClick={handleCreateConversation} disabled={!newChatData.customerId} className="rounded-xl h-9">
            Start Conversation
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
      return <div className="flex flex-col h-full relative">
          {(activeConversationId || isDraftConversation) ? <>
              {/* Fixed header */}
              <div className={`absolute top-0 left-0 w-full z-10 p-4 bg-[#FFFFFF] dark:bg-[#1c1c1e] transition-all duration-200 ${showHeaderBorder ? 'shadow-sm dark:shadow-[0_1px_3px_0_#dadada0d]' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{
                      fontSize: '0.95rem'
                    }}>
                      {(() => {
                        if (isDraftConversation) {
                          const draft = customers.find(c => c.id === draftCustomerId);
                          return draft?.profile?.display_name || draft?.profile?.email || 'Customer';
                        }
                        const activeConv = conversations.find(c => c.id === activeConversationId);
                        return activeConv?.customer?.profile?.display_name || activeConv?.customer?.profile?.email || 'Customer';
                      })()}
                    </h2>
                    <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{
                      fontSize: '0.95rem'
                    }}>
                      {(() => {
                        if (isDraftConversation) return 'Chatting with customer';
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
                  
                  {!isDraftConversation && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#707070] hover:text-[#121212] dark:text-[#ffffffA6] dark:hover:text-[#ffffff] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f31]"
                        onClick={handleOpenCustomerProfile}
                        title="Open customer profile"
                      >
                        <UserRound className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#707070] hover:text-[#121212] dark:text-[#ffffffA6] dark:hover:text-[#ffffff] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f31]"
                      onClick={() => {
                        if (activeConversationId) {
                          // Archive/close conversation logic - always use inbox data for closing
                          inboxData.closeConversation(activeConversationId);
                          setActiveConversationId(null);
                        }
                      }}
                        title="Archive conversation"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
             
             {/* Scrollable messages area */}
             <div className="flex-1 overflow-hidden mt-[88px] mb-[80px]">
                <ScrollArea 
                  ref={scrollAreaRef} 
                  className="h-full px-4 py-0"
                  style={{ paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0' }}
                >
                  {isDraftConversation ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <p className="text-[#8E8E93] text-lg text-center">
                        Write the first message to start the conversation
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                const isAdmin = message.sender?.role === 'super_admin';
                const isLastMessage = index === messages.length - 1;
                const isRead = message.read_at !== null && isAdmin; // Only show read status for admin's messages that have been read
                const statusText = isRead ? t('message.seen') : t('message.delivered');
                return <div key={message.id} className={`flex flex-col mb-4 ${isAdmin ? 'items-end' : 'items-start'}`}>
                  {message.attachment_url ? (
                    <FileAttachment 
                      attachmentUrl={message.attachment_url} 
                      fileName={message.message} 
                      isCurrentUser={isAdmin}
                    />
                  ) : (
                    <div className={`max-w-[80%] px-3 py-2 ${isAdmin ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'}`}>
                      <p className={`text-base break-words ${isAdmin ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{
                        fontSize: '0.95rem',
                        fontWeight: '500'
                      }}>{message.message}</p>
                    </div>
                  )}
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
                    })
                  )}
                  <TypingIndicator users={typingUsers} />
                  
                  {/* Show closed chat message if conversation is archived */}
                  {!isDraftConversation && activeConversationId && (
                    (() => {
                      const activeConv = conversations.find(c => c.id === activeConversationId);
                      if (activeConv?.status === 'closed') {
                        return (
                          <div className="flex justify-center py-4">
                            <div className="bg-[#f0f0f0] dark:bg-[#2f2f31] px-4 py-2 rounded-full">
                              <p className="text-sm text-[#8E8E93] dark:text-[#ffffffa6] font-medium">
                                {t('chat.closed.message')}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()
                  )}
                  
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </div>
              
              {/* Fixed bottom input area */}
              <div className="absolute bottom-0 left-0 w-full px-2 pt-2 pb-10 border-t border-[#ecedee] dark:border-[#232325] bg-[#FFFFFF] dark:bg-[#1c1c1e]">
                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                  />
                  <input
                    type="file"
                    ref={photoInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                  />
                  
                  {/* Upload button - Mobile shows menu, Desktop shows regular button */}
                  {isMobile ? (
                    <MobileUploadMenu
                      isOpen={isUploadMenuOpen}
                      onToggle={handleToggleUploadMenu}
                      onCameraCapture={handleCameraCapture}
                      onPhotoUpload={handlePhotoUpload}
                      onFileUpload={handleFileUpload}
                    />
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-[2.2rem] h-[2.2rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
                    >
                      <span className="text-lg" style={{ fontWeight: 400, fontSize: '1.2rem', paddingBottom: '3px' }}>+</span>
                    </Button>
                  )}
                  <div className="flex items-end gap-1 bg-[#f0f0f0] dark:bg-[#2f2f31] rounded-xl pl-4 pr-2 py-1.5 flex-1">
                    <textarea ref={textareaRef} value={newMessage} onChange={e => {
                  setNewMessage(e.target.value);
                  // Handle typing indicator
                  if (e.target.value.trim() && adminProfile) {
                    startTyping(adminProfile.display_name, adminProfile.role);
                  } else {
                    stopTyping();
                  }
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
                    <Button variant="ghost" onClick={handleSendMessage} disabled={!newMessage.trim() || isSendingMessage || isCreatingConversationWithMessage} size="icon" className={`w-6 h-6 rounded-full p-0 flex-shrink-0 disabled:opacity-100 ${!newMessage.trim() ? 'bg-[#d0ecfb] dark:bg-[#232324]' : 'dark:!bg-[#007aff]'}`} style={{
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
        {(activeConversationId || isDraftConversation) ? <>
            {/* Fixed header */}
            <div className={`flex-shrink-0 p-4 bg-[#FFFFFF] dark:bg-[#1c1c1e] rounded-t-2xl transition-all duration-200 ${showHeaderBorder ? 'shadow-sm dark:shadow-[0_1px_3px_0_#dadada0d]' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{
                    fontSize: '0.95rem'
                  }}>
                    {(() => {
                      if (isDraftConversation) {
                        const draft = customers.find(c => c.id === draftCustomerId);
                        return draft?.profile?.display_name || draft?.profile?.email || 'Customer';
                      }
                      const activeConv = conversations.find(c => c.id === activeConversationId);
                      return activeConv?.customer?.profile?.display_name || activeConv?.customer?.profile?.email || 'Customer';
                    })()}
                  </h2>
                  <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{
                    fontSize: '0.95rem'
                  }}>
                    {(() => {
                      if (isDraftConversation) return 'Chatting with customer';
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
                
                {!isDraftConversation && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#707070] hover:text-[#121212] dark:text-[#ffffffA6] dark:hover:text-[#ffffff] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f31]"
                      onClick={handleOpenCustomerProfile}
                      title="Open customer profile"
                    >
                      <UserRound className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#707070] hover:text-[#121212] dark:text-[#ffffffA6] dark:hover:text-[#ffffff] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f31]"
                     onClick={() => {
                       if (activeConversationId) {
                         // Archive/close conversation logic - always use inbox data for closing
                         inboxData.closeConversation(activeConversationId);
                         setActiveConversationId(null);
                       }
                     }}
                      title="Archive conversation"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 h-[450px] overflow-hidden">
               <ScrollArea ref={scrollAreaRef} className="h-full px-4">
                 {isDraftConversation ? (
                   <div className="flex-1 flex items-center justify-center h-full">
                     <p className="text-[#8E8E93] text-lg text-center">
                       Write the first message to start the conversation
                     </p>
                   </div>
                 ) : (
                   messages.map((message, index) => {
                     const isAdmin = message.sender?.role === 'super_admin';
                     const isLastMessage = index === messages.length - 1;
                     const isRead = message.read_at !== null && isAdmin; // Only show read status for admin's messages that have been read
                     const statusText = isRead ? t('message.seen') : t('message.delivered');
                      return <div key={message.id} className={`flex flex-col mb-4 ${isAdmin ? 'items-end' : 'items-start'}`}>
                        {message.attachment_url ? (
                          <FileAttachment 
                            attachmentUrl={message.attachment_url} 
                            fileName={message.message} 
                            isCurrentUser={isAdmin}
                          />
                        ) : (
                          <div className={`max-w-[80%] px-3 py-2 ${isAdmin ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'}`}>
                            <p className={`text-base break-words ${isAdmin ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{
                              fontSize: '0.95rem',
                              fontWeight: '500'
                            }}>{message.message}</p>
                          </div>
                        )}
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
                   })
                  )}
                   {/* Show closed chat message if conversation is archived */}
                   {!isDraftConversation && activeConversationId && (
                     (() => {
                       const activeConv = conversations.find(c => c.id === activeConversationId);
                       if (activeConv?.status === 'closed') {
                         return (
                           <div className="flex justify-center py-4">
                             <div className="bg-[#f0f0f0] dark:bg-[#2f2f31] px-4 py-2 rounded-full">
                               <p className="text-sm text-[#8E8E93] dark:text-[#ffffffa6] font-medium">
                                 {t('chat.closed.message')}
                               </p>
                             </div>
                           </div>
                         );
                       }
                       return null;
                     })()
                   )}
                   
                   <div ref={messagesEndRef} />
               </ScrollArea>
            </div>
            
            {/* Fixed bottom input area */}
            <div className="flex-shrink-0 px-2 pt-2 pb-4 border-t border-[#ecedee] dark:border-[#232325] bg-[#FFFFFF] dark:bg-[#1c1c1e]">
              <div className="flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                />
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                />
                
                {/* Upload button - Mobile shows menu, Desktop shows regular button */}
                {isMobile ? (
                  <MobileUploadMenu
                    isOpen={isUploadMenuOpen}
                    onToggle={handleToggleUploadMenu}
                    onCameraCapture={handleCameraCapture}
                    onPhotoUpload={handlePhotoUpload}
                    onFileUpload={handleFileUpload}
                  />
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-[2.2rem] h-[2.2rem] rounded-[10px] bg-[#f0f0f0] dark:bg-[#2f2f31] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
                  >
                    <span className="text-lg" style={{ fontWeight: 400, fontSize: '1.2rem', paddingBottom: '3px' }}>+</span>
                  </Button>
                )}
                <div className="flex items-end gap-1 bg-[#f0f0f0] dark:bg-[#2f2f31] rounded-xl pl-4 pr-2 py-1.5 flex-1">
                  <textarea ref={textareaRef} value={newMessage} onChange={e => {
                setNewMessage(e.target.value);
                // Handle typing indicator
                if (e.target.value.trim() && adminProfile) {
                  startTyping(adminProfile.display_name, adminProfile.role);
                } else {
                  stopTyping();
                }
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }} placeholder={(() => {
                const activeConv = conversations.find(c => c.id === activeConversationId);
                if (activeConv?.status === 'closed') {
                  return '';
                }
                return t('nav.dashboard') === 'Översikt' ? 'Skriv här...' : 'Type here...';
              })()} disabled={(() => {
                const activeConv = conversations.find(c => c.id === activeConversationId);
                return activeConv?.status === 'closed';
              })()} className="flex-1 bg-transparent outline-none font-medium placeholder:text-[#707070] dark:placeholder:text-[#ffffffa6] resize-none overflow-hidden min-h-[20px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed" style={{
                fontSize: '0.95rem',
                fontWeight: '500'
              }} rows={1} onKeyPress={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }} />
                  <Button variant="ghost" onClick={handleSendMessage} disabled={(() => {
                const activeConv = conversations.find(c => c.id === activeConversationId);
                return !newMessage.trim() || isSendingMessage || isCreatingConversationWithMessage || activeConv?.status === 'closed';
              })()} size="icon" className={`w-6 h-6 rounded-full p-0 flex-shrink-0 disabled:opacity-100 ${!newMessage.trim() ? 'bg-[#d0ecfb] dark:bg-[#232324]' : 'dark:!bg-[#007aff]'}`} style={{
                backgroundColor: newMessage.trim() ? '#59bffa' : undefined
              }}>
                    <ChevronUp className="h-6 w-6" color="#ffffff" stroke="#ffffff" />
                  </Button>
                </div>
              </div>
            </div>
          </> : <CardContent className="flex items-center justify-center h-[500px]">
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
            <div className="flex items-center justify-between">
              {/* Tab Bar */}
              <div className="flex items-center bg-[#f0f0f0] dark:bg-[#2f2f31] rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'inbox'
                      ? 'bg-white dark:bg-[#1c1c1e] text-[#121212] dark:text-[#ffffff] shadow-sm'
                      : 'text-[#707070] dark:text-[#ffffffA6] hover:text-[#121212] dark:hover:text-[#ffffff]'
                  }`}
                >
                  {t('inbox')}
                </button>
                <button
                  onClick={() => setActiveTab('archive')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'archive'
                      ? 'bg-white dark:bg-[#1c1c1e] text-[#121212] dark:text-[#ffffff] shadow-sm'
                      : 'text-[#707070] dark:text-[#ffffffA6] hover:text-[#121212] dark:hover:text-[#ffffff]'
                  }`}
                >
                  {t('archive')}
                </button>
              </div>
              
              {/* Count Badge */}
              <div className="bg-[#121212] text-white dark:bg-white dark:text-[#121212] w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs md:text-[0.9rem] font-medium md:pb-[2px]" style={{
                paddingRight: '1px'
              }}>
                {conversations.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className={`${isMobile ? 'h-[400px]' : 'h-[500px]'}`}>
              {conversations.map(conversation => <div key={conversation.id} className={`relative p-4 border-b border-gray-200 dark:border-[#2f2f31] cursor-pointer ${!isMobile ? 'hover:bg-[#f0f0f0] dark:hover:bg-[#232324]' : ''} ${activeConversationId === conversation.id && !isMobile ? 'bg-[#f0f0f0] dark:bg-[#232324]' : ''}`} onClick={() => handleConversationSelect(conversation.id)}>
                  {(conversation.unread_count || 0) > 0 && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-[#2e77d0] flex-shrink-0" />
                  )}
                  <div className={`${(conversation.unread_count || 0) > 0 ? 'ml-4' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">
                        {conversation.customer?.profile?.display_name || 'Customer'}
                      </h4>
                      <p className="text-xs text-[#121212] dark:text-[#FFFFFF] font-medium">
                        {conversation.last_message_at && (() => {
                          const currentLang = t('nav.dashboard') === 'Översikt' ? 'sv' : 'en';
                          const formattedTime = formatDistanceToNow(new Date(conversation.last_message_at), { 
                            addSuffix: true,
                            locale: currentLang === 'sv' ? sv : undefined
                          });
                          // Remove "ungefär " from Swedish and "about " from English timestamps
                          return currentLang === 'sv' 
                            ? formattedTime.replace(/^ungefär /, '') 
                            : formattedTime.replace(/^about /, '');
                      })()}
                      </p>
                    </div>
                    <p className="text-[#707070] dark:text-[#FFFFFFA6] font-medium truncate" style={{ fontSize: '0.875rem' }}>
                      {conversation.last_message || 'No messages yet'}
                    </p>
                  </div>
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
                className="p-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#1c1c1e] border-none rounded-t-[1rem]"
                style={{ height: 'calc(var(--vh) * 90)', overscrollBehavior: 'none' }}
                hideCloseButton={true}
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

        {/* Customer Profile Details Sheet */}
        <CustomerDetailsSheet
          customer={selectedCustomerProfile}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCustomerProfile(null);
            }
          }}
        />
      </div>
    </div>;
}