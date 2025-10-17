import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetOverlay } from '@/components/ui/sheet';
import { Send, ChevronUp, Check, CheckCheck } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useUnreadChatMessages } from '@/hooks/useUnreadChatMessages';
import { formatDistanceToNow, format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatChatTimestamp } from '@/utils/dateUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/layout/MainLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { supabase } from '@/integrations/supabase/client';
import { FileAttachment } from '@/components/chat/FileAttachment';
import { MobileUploadMenu } from '@/components/chat/MobileUploadMenu';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';

export default function Chat() {
  const { userId } = useAuthStatus();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [drawerWasOpen, setDrawerWasOpen] = useState(false);
  
  // Prevent page scrolling on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile]);
  
  // Handle image viewer opening/closing for mobile drawer
  const handleImageViewerOpen = React.useCallback(() => {
    if (isMobile && isChatOpen) {
      setDrawerWasOpen(true);
      setIsChatOpen(false);
    }
  }, [isMobile, isChatOpen]);
  
  const handleImageViewerClose = React.useCallback(() => {
    if (isMobile && drawerWasOpen) {
      setIsChatOpen(true);
      setDrawerWasOpen(false);
    }
  }, [isMobile, drawerWasOpen]);
  
  // Keyboard handling - visualViewport approach for web, native for apps
  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Native keyboard handling for iOS/Android
      let keyboardShowListener: any;
      let keyboardHideListener: any;

      const setupListeners = async () => {
        keyboardShowListener = await Keyboard.addListener('keyboardWillShow', info => {
          setKeyboardHeight(info.keyboardHeight);
          document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
        });

        keyboardHideListener = await Keyboard.addListener('keyboardWillHide', () => {
          setKeyboardHeight(0);
          document.documentElement.style.setProperty('--keyboard-height', '0px');
        });
      };

      setupListeners();

      return () => {
        keyboardShowListener?.remove();
        keyboardHideListener?.remove();
      };
    } else {
      // Web keyboard detection using visualViewport API
      const vv = window.visualViewport;
      if (!vv) return;

      const updateKeyboardHeight = () => {
        // Calculate how much the keyboard overlaps the layout viewport
        const overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        const keyboardHeight = overlap > 50 ? overlap : 0; // Ignore small viewport changes
        
        setKeyboardHeight(keyboardHeight);
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      };

      vv.addEventListener('resize', updateKeyboardHeight);
      vv.addEventListener('scroll', updateKeyboardHeight);
      window.addEventListener('resize', updateKeyboardHeight);
      
      updateKeyboardHeight();

      return () => {
        vv.removeEventListener('resize', updateKeyboardHeight);
        vv.removeEventListener('scroll', updateKeyboardHeight);
        window.removeEventListener('resize', updateKeyboardHeight);
      };
    }
  }, []);

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Helper to reliably scroll to bottom (used for mobile sheet) - simplified to prevent keyboard jumps
  const scrollToBottom = React.useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);
  
  const {
    conversations: baseConversations,
    messages,
    activeConversationId,
    userProfile,
    setActiveConversationId,
    createConversation,
    createConversationWithMessage,
    sendMessage,
    markAsRead,
    isCreatingConversation,
    isCreatingConversationWithMessage,
    isSendingMessage,
    typingUsers,
    startTyping,
    stopTyping
  } = useChat(userId);

  // Get unread message counts
  const { conversations: conversationsWithUnread } = useUnreadChatMessages(userId);

  // Merge conversations with unread counts
  const conversations = baseConversations.map(conv => {
    const unreadConv = conversationsWithUnread.find(c => c.id === conv.id);
    return {
      ...conv,
      unread_count: unreadConv?.unread_count || 0
    };
  });

  // Draft conversation state - when user is composing a new conversation
  const [isDraftConversation, setIsDraftConversation] = useState(false);

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
    if (!newMessage.trim()) return;
    
    if (isDraftConversation) {
      // This is the first message in a new conversation - create conversation with message
      createConversationWithMessage({ message: newMessage, subject: 'Support' });
      setIsDraftConversation(false);
    } else if (activeConversationId) {
      // This is a message in an existing conversation
      sendMessage({ conversationId: activeConversationId, message: newMessage });
    }
    
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
    setActiveConversationId(null);
    setIsDraftConversation(true);
    setIsCreatingNew(false);
    if (isMobile) setIsChatOpen(true);
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
      
      if (isDraftConversation) {
        createConversationWithMessage({ 
          message: messageText, 
          subject: 'Support',
          attachmentUrl: data.path
        });
        setIsDraftConversation(false);
      } else if (activeConversationId) {
        sendMessage({ 
          conversationId: activeConversationId, 
          message: messageText,
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
  const handleCameraCapture = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera
        });
        
        if (image.webPath) {
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          await handleFileUpload([file]);
        }
      } catch (error) {
        console.error('Camera capture failed:', error);
      }
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handlePhotoUpload = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos
        });
        
        if (image.webPath) {
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          await handleFileUpload([file]);
        }
      } catch (error) {
        console.error('Photo upload failed:', error);
      }
    } else {
      photoInputRef.current?.click();
    }
  };

  const handleFileUpload = async (files?: File[]) => {
    if (!files && Capacitor.isNativePlatform()) {
      try {
        const result = await FilePicker.pickFiles({
          types: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
        });
        
        if (result.files && result.files.length > 0) {
          const pickedFile = result.files[0];
          let response;
          if (pickedFile.path) {
            response = await fetch(pickedFile.path);
          } else if (pickedFile.blob) {
            const blobUrl = URL.createObjectURL(pickedFile.blob);
            response = await fetch(blobUrl);
            URL.revokeObjectURL(blobUrl);
          } else {
            throw new Error('No file data available');
          }
          const blob = await response.blob();
          const file = new File([blob], pickedFile.name, { type: pickedFile.mimeType });
          await uploadFileToStorage(file);
        }
      } catch (error) {
        console.error('File picker failed:', error);
      }
    } else if (!files) {
      fileInputRef.current?.click();
    } else {
      // Process the files
      for (const file of files) {
        await uploadFileToStorage(file);
      }
    }
  };

  const uploadFileToStorage = async (file: File) => {
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
      
      if (isDraftConversation) {
        createConversationWithMessage({ 
          message: messageText, 
          subject: 'Support',
          attachmentUrl: data.path
        });
        setIsDraftConversation(false);
      } else if (activeConversationId) {
        sendMessage({ 
          conversationId: activeConversationId, 
          message: messageText,
          attachmentUrl: data.path
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleToggleUploadMenu = () => {
    setIsUploadMenuOpen(!isUploadMenuOpen);
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    markAsRead(conversationId);
    setIsCreatingNew(false);
    setIsDraftConversation(false);
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
        <div className="flex flex-col h-full relative">
          {activeConversationId || isDraftConversation ? (
            <>
              {/* Fixed header */}
              <div className={`absolute top-0 left-0 w-full z-10 p-4 bg-[#FFFFFF] dark:bg-[#1c1c1e] transition-all duration-200 ${showHeaderBorder ? 'shadow-sm dark:shadow-[0_1px_3px_0_#dadada0d]' : ''}`}>
                {(() => {
                  const activeConv = conversations.find(c => c.id === activeConversationId);
                  const isArchived = activeConv?.status === 'closed';
                  
                  if (isArchived) {
                    // Archived conversation: show title in subtitle position, centered
                    return (
                      <h2 className="font-medium text-[#121212] dark:text-[#ffffff] text-center" style={{ fontSize: '0.95rem' }}>
                        {t('conversation.history')}
                      </h2>
                    );
                  } else {
                    // Active conversation: show title + subtitle
                    return (
                      <>
                        <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{ fontSize: '0.95rem' }}>
                          {isDraftConversation ? (t('nav.dashboard') === 'Översikt' ? 'Nytt meddelande' : 'New message') : t('nav.admin.support')}
                        </h2>
                        <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{ fontSize: '0.95rem' }}>
                          {(() => {
                            if (isDraftConversation) return 'Skriv för att börja konversationen';
                            
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
                      </>
                    );
                  }
                })()}
              </div>
              
              {/* Scrollable messages area */}
               <div className="flex-1 overflow-hidden mt-[88px] mb-[80px]">
                  <ScrollArea 
                   ref={scrollAreaRef} 
                   className="h-full px-4"
                  >
                    {isDraftConversation ? (
                      <div className="flex-1 flex items-center justify-center h-full">
                        <p className="text-[#8E8E93] text-lg text-center">
                          Skriv för att börja konversationen
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-4">
                        {messages.map((message, index) => {
                      const isCurrentUser = message.sender_id === userId;
                      const isLastMessage = index === messages.length - 1;
                      const isRead = message.read_at !== null && isCurrentUser; // Only show read status for current user's messages that have been read
                       const statusText = isRead ? t('message.seen') : t('message.delivered');
                     return (
                         <div
                           key={message.id}
                           className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                         >
                          {message.attachment_url ? (
                            <FileAttachment 
                              attachmentUrl={message.attachment_url} 
                              fileName={message.message} 
                              isCurrentUser={isCurrentUser}
                              isFromDrawer={isMobile}
                              onImageViewerOpen={handleImageViewerOpen}
                              onImageViewerClose={handleImageViewerClose}
                            />
                          ) : (
                            <div
                              className={`max-w-[80%] px-3 py-2 ${
                                isCurrentUser 
                                  ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' 
                                  : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'
                              }`}
                            >
                              <p className={`text-base break-words ${isCurrentUser ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{ fontSize: '0.95rem', fontWeight: '500' }}>{message.message}</p>
                            </div>
                          )}
                         <div className="flex items-center gap-1 mt-1 px-2">
                            <p className="text-xs font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                              <span className="dark:hidden">{formatChatTimestamp(new Date(message.created_at), { today: t('today'), yesterday: t('yesterday') })}</span>
                              <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{formatChatTimestamp(new Date(message.created_at), { today: t('today'), yesterday: t('yesterday') })}</span>
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
                     </div>
                   );
                       })}
                      </div>
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
              <div 
                className="absolute bottom-0 left-0 w-full px-2 pt-2 pb-10 border-t border-[#ecedee] dark:border-[#232325] bg-[#FFFFFF] dark:bg-[#1c1c1e]"
                style={{
                  // Only apply transform on web - native platforms handle viewport resize automatically
                  transform: !Capacitor.isNativePlatform() ? `translateY(-${keyboardHeight}px)` : 'none',
                  transition: 'transform 0.25s ease-out'
                }}
              >
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
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Handle typing indicator
                        if (e.target.value.trim() && userProfile) {
                          startTyping(userProfile.display_name, userProfile.role);
                        } else {
                          stopTyping();
                        }
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      placeholder={(() => {
                        const activeConv = conversations.find(c => c.id === activeConversationId);
                        if (activeConv?.status === 'closed') {
                          return '';
                        }
                        return t('nav.dashboard') === 'Översikt' ? 'Skriv här...' : 'Type here...';
                      })()}
                      disabled={(() => {
                        const activeConv = conversations.find(c => c.id === activeConversationId);
                        return activeConv?.status === 'closed';
                      })()}
                      className="flex-1 bg-transparent outline-none font-medium placeholder:text-[#707070] dark:placeholder:text-[#ffffffa6] resize-none overflow-hidden min-h-[20px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={(() => {
                        const activeConv = conversations.find(c => c.id === activeConversationId);
                        return !newMessage.trim() || isSendingMessage || isCreatingConversationWithMessage || activeConv?.status === 'closed';
                      })()}
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
        {activeConversationId || isDraftConversation ? (
          <>
            {/* Fixed header */}
            <div className={`flex-shrink-0 p-4 bg-[#FFFFFF] dark:bg-[#1c1c1e] rounded-t-2xl transition-all duration-200 ${showHeaderBorder ? 'shadow-sm dark:shadow-[0_1px_3px_0_#dadada0d]' : ''}`}>
              {(() => {
                const activeConv = conversations.find(c => c.id === activeConversationId);
                const isArchived = activeConv?.status === 'closed';
                
                if (isArchived) {
                  // Archived conversation: show title in subtitle position
                  return (
                    <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{ fontSize: '0.95rem' }}>
                      {t('conversation.history')}
                    </h2>
                  );
                } else {
                  // Active conversation: show title + subtitle
                  return (
                    <>
                      <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{ fontSize: '0.95rem' }}>
                        {isDraftConversation ? (t('nav.dashboard') === 'Översikt' ? 'Nytt meddelande' : 'New message') : t('nav.admin.support')}
                      </h2>
                      <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{ fontSize: '0.95rem' }}>
                        {(() => {
                          if (isDraftConversation) return 'Skriv för att börja konversationen';
                          
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
                    </>
                  );
                }
              })()}
            </div>
            
            {/* Scrollable messages area */}
            <div className="flex-1 h-[450px] overflow-hidden">
               <ScrollArea ref={scrollAreaRef} className="h-full px-4">
                 {isDraftConversation ? (
                   <div className="flex-1 flex items-center justify-center h-full">
                     <p className="text-[#8E8E93] text-lg text-center">
                       Skriv för att börja konversationen
                     </p>
                   </div>
                 ) : (
                   messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === userId;
                    const isLastMessage = index === messages.length - 1;
                    const isRead = message.read_at !== null && isCurrentUser; // Only show read status for current user's messages that have been read
                    const statusText = isRead ? t('message.seen') : t('message.delivered');
                   return (
                     <div
                       key={message.id}
                       className={`flex flex-col mb-4 ${isCurrentUser ? 'items-end' : 'items-start'}`}
                      >
                        {message.attachment_url ? (
                          <FileAttachment 
                            attachmentUrl={message.attachment_url} 
                            fileName={message.message} 
                            isCurrentUser={isCurrentUser}
                            isFromDrawer={isMobile}
                            onImageViewerOpen={handleImageViewerOpen}
                            onImageViewerClose={handleImageViewerClose}
                          />
                        ) : (
                          <div
                            className={`max-w-[80%] px-3 py-2 ${
                              isCurrentUser 
                                ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' 
                                : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'
                            }`}
                          >
                            <p className={`text-base break-words ${isCurrentUser ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{ fontSize: '0.95rem', fontWeight: '500' }}>{message.message}</p>
                          </div>
                        )}
                       <div className="flex items-center gap-1 mt-1 px-2">
                            <p className="text-xs font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                              <span className="dark:hidden">{formatChatTimestamp(new Date(message.created_at), { today: t('today'), yesterday: t('yesterday') })}</span>
                              <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{formatChatTimestamp(new Date(message.created_at), { today: t('today'), yesterday: t('yesterday') })}</span>
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
                   </div>
                 );
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
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      // Handle typing indicator
                      if (e.target.value.trim() && userProfile) {
                        startTyping(userProfile.display_name, userProfile.role);
                      } else {
                        stopTyping();
                      }
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder={(() => {
                      const activeConv = conversations.find(c => c.id === activeConversationId);
                      if (activeConv?.status === 'closed') {
                        return t('nav.dashboard') === 'Översikt' ? 'Konversationen är arkiverad' : 'Conversation is archived';
                      }
                      return t('nav.dashboard') === 'Översikt' ? 'Skriv här...' : 'Type here...';
                    })()}
                    disabled={(() => {
                      const activeConv = conversations.find(c => c.id === activeConversationId);
                      return activeConv?.status === 'closed';
                    })()}
                    className="flex-1 bg-transparent outline-none font-medium placeholder:text-[#707070] dark:placeholder:text-[#ffffffa6] resize-none overflow-hidden min-h-[20px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={(() => {
                      const activeConv = conversations.find(c => c.id === activeConversationId);
                      return !newMessage.trim() || isSendingMessage || isCreatingConversationWithMessage || activeConv?.status === 'closed';
                    })()}
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
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className={isMobile ? 'h-screen overflow-hidden flex flex-col' : ''}>
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
              <ScrollArea className={`${isMobile ? (Capacitor.getPlatform() === 'ios' ? 'h-[360px]' : 'h-[280px]') : 'h-[500px]'}`}>
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`relative p-4 border-b border-gray-200 dark:border-[#2f2f31] cursor-pointer ${!isMobile ? 'hover:bg-[#f0f0f0] dark:hover:bg-[#232324]' : ''} ${
                      activeConversationId === conversation.id && !isMobile ? 'bg-[#f0f0f0] dark:bg-[#232324]' : ''
                    }`}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    {(conversation.unread_count || 0) > 0 && (
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-[#2e77d0] flex-shrink-0" />
                    )}
                    <div className={`${(conversation.unread_count || 0) > 0 ? 'ml-4' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm">
                          {conversation.status === 'closed'
                            ? t('conversation.history')
                            : ((conversation.subject === 'Support Request' || conversation.subject === 'Support Chat') ? 'Support' : (conversation.subject || 'Support'))}
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
              <SheetContent
                side="bottom"
                className="p-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#1c1c1e] border-none rounded-t-[1rem]"
                style={{ height: 'calc(var(--vh) * 90)', overscrollBehavior: 'none' }}
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