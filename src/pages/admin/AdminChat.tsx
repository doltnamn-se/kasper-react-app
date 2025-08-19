import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetOverlay } from '@/components/ui/sheet';
import { Send, ChevronUp } from 'lucide-react';
import { useAdminChat } from '@/hooks/useAdminChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { formatDistanceToNow, format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminChat() {
  const { userId } = useAuthStatus();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newChatData, setNewChatData] = useState({
    customerId: ''
  });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
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
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversationId]);

  // Fetch customers for admin conversation creation
  const { data: customersData = [] } = useQuery({
    queryKey: ['all-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, profiles(display_name, email)');
      
      if (error) throw error;
      return data;
    },
  });

  const customers = customersData.map(c => ({
    id: c.id,
    profile: c.profiles
  }));

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId || !userId) return;
    sendMessage({ conversationId: activeConversationId, message: newMessage, adminId: userId });
    setNewMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleCreateConversation = () => {
    if (!newChatData.customerId || !userId) return;
    createConversation({ 
      customerId: newChatData.customerId, 
      adminId: userId, 
      chatData: {
        subject: 'Support',
        priority: 'medium',
        message: 'Admin has started a conversation with you.'
      }
    });
    setNewChatData({ customerId: '' });
    setIsCreatingNew(false);
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    if (userId) markAsRead(conversationId, userId);
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
          <label className="text-sm font-medium mb-2 block">Customer</label>
          <Select
            value={newChatData.customerId}
            onValueChange={(value) => setNewChatData(prev => ({ ...prev, customerId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.profile?.display_name || customer.profile?.email || 'Unknown Customer'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateConversation}
            disabled={!newChatData.customerId || isCreatingConversation}
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
              <div className="flex-shrink-0 px-4 pt-4 pb-0 border-b border-[#ecedee] dark:border-[#3d3d3d] bg-[#FFFFFF] dark:bg-[#232324]">
                <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{ fontSize: '0.95rem' }}>
                  {isCreatingNew ? 'Start New Conversation' : 'Admin Chat'}
                </h2>
                <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{ fontSize: '0.95rem' }}>
                  Chatting with customer
                </p>
              </div>
              
              {/* Scrollable messages area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4 py-2">
                  {messages.map((message) => {
                    const isAdmin = message.sender?.role === 'super_admin';
                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col mb-4 ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 ${
                            isAdmin 
                              ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' 
                              : 'bg-[#f0f0f0] dark:bg-[#3b3b3d] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'
                          }`}
                        >
                          <p className={`text-base break-words ${isAdmin ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{ fontSize: '0.95rem', fontWeight: '500' }}>{message.message}</p>
                        </div>
                        <p className="text-xs mt-1 px-2 font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                          <span className="dark:hidden">{format(new Date(message.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                          <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{format(new Date(message.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                        </p>
                    </div>
                  );
                })}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </div>
              
              {/* Fixed bottom input area */}
              <div className="flex-shrink-0 px-2 pt-2 pb-10 border-t border-[#ecedee] dark:border-[#3d3d3d] bg-[#FFFFFF] dark:bg-[#232324]">
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-[10px] bg-[#f0f0f0] dark:bg-[#3b3b3d] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                  <div className="flex items-end gap-1 bg-[#f0f0f0] dark:bg-[#3b3b3d] rounded-xl pl-4 pr-2 py-1.5 flex-1">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      placeholder="Skriv här..."
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
      <Card className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#232324] dark:border dark:border-[#232325] rounded-2xl">
        {activeConversationId ? (
          <>
            {/* Fixed header */}
            <div className="flex-shrink-0 px-4 pt-4 pb-0 border-b border-[#ecedee] dark:border-[#3d3d3d] bg-[#FFFFFF] dark:bg-[#232324]">
              <h2 className="font-medium text-[#121212] dark:text-[#ffffff]" style={{ fontSize: '0.95rem' }}>
                Admin Chat
              </h2>
              <p className="font-medium text-[#707070] dark:text-[#ffffffA6] -mt-1" style={{ fontSize: '0.95rem' }}>
                Chatting with customer
              </p>
            </div>
            
            {/* Scrollable messages area */}
            <div className="flex-1 h-[450px] overflow-hidden">
              <ScrollArea className="h-full px-4 py-2">
                {messages.map((message) => {
                  const isAdmin = message.sender?.role === 'super_admin';
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col mb-4 ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 ${
                          isAdmin 
                            ? 'bg-[#d0ecfb] dark:bg-[#007aff] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[0px]' 
                            : 'bg-[#f0f0f0] dark:bg-[#3b3b3d] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[0px]'
                        }`}
                      >
                        <p className={`text-base break-words ${isAdmin ? 'text-[#121212] dark:text-[#FFFFFF]' : 'text-[#121212] dark:text-[#ffffff]'}`} style={{ fontSize: '0.95rem', fontWeight: '500' }}>{message.message}</p>
                      </div>
                      <p className="text-xs mt-1 px-2 font-medium" style={{ fontWeight: '500', color: '#787878' }}>
                        <span className="dark:hidden">{format(new Date(message.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                        <span className="hidden dark:inline" style={{ color: '#ffffffa6' }}>{format(new Date(message.created_at), 'MMM dd, yyyy - HH:mm')}</span>
                      </p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </ScrollArea>
            </div>
            
            {/* Fixed bottom input area */}
            <div className="flex-shrink-0 px-2 pt-2 pb-4 border-t border-[#ecedee] dark:border-[#3d3d3d] bg-[#FFFFFF] dark:bg-[#232324]">
              <div className="flex items-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-[10px] bg-[#f0f0f0] dark:bg-[#3b3b3d] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
                >
                  <span className="text-lg">+</span>
                </Button>
                <div className="flex items-end gap-1 bg-[#f0f0f0] dark:bg-[#3b3b3d] rounded-xl pl-4 pr-2 py-1.5 flex-1">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="Skriv här..."
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
            <p className="text-[#707070] dark:text-[#ffffffA6] underline decoration-dotted decoration-[#24CC5C] decoration-1 underline-offset-2">
              {t('select.conversation.to.chat')}
            </p>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>
          {t('nav.admin.support')}
        </h1>
        {!isMobile && (
          <Button
            onClick={() => {
              setIsCreatingNew(true);
              setActiveConversationId(null);
              if (isMobile) setIsChatOpen(true);
            }}
            className="rounded-xl h-9"
          >
            {t('new.message')}
          </Button>
        )}
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isMobile ? '' : 'lg:grid-cols-3 h-[600px]'}`}>
        {/* Conversations List */}
        <Card className={`${isMobile ? '' : 'lg:col-span-1'} bg-white dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-medium text-[#121212] dark:text-[#ffffff]">{t('inbox')}</CardTitle>
              <div className="bg-[#121212] text-white dark:bg-white dark:text-[#121212] w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs md:text-[0.9rem] font-medium md:pb-[2px]" style={{ paddingRight: '1px' }}>
                {conversations.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className={`${isMobile ? 'h-[400px]' : 'h-[500px]'}`}>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                    activeConversationId === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">
                      {conversation.customer?.profile?.display_name || 'Customer'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {conversation.last_message_at && 
                        format(new Date(conversation.last_message_at), 'dd MMM yyyy')
                      }
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {conversation.last_message || 'No messages yet'}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mobile New Message Button */}
        {isMobile && (
          <Button
            onClick={() => {
              setIsCreatingNew(true);
              setActiveConversationId(null);
              if (isMobile) setIsChatOpen(true);
            }}
            className="w-full rounded-xl h-9"
          >
            {t('new.message')}
          </Button>
        )}

        {/* Desktop Chat Interface or Mobile Sheet */}
        {!isMobile ? (
          isCreatingNew ? renderNewChatForm() : renderChatInterface()
        ) : (
            <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
              <SheetOverlay className="backdrop-blur-md" />
              <SheetContent side="bottom" className="h-[93vh] p-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#232324] border-none rounded-t-[1rem]">
                <div className="flex flex-col h-full relative z-[10001]">
                  {isCreatingNew ? renderNewChatForm(true) : renderChatInterface(true)}
                </div>
              </SheetContent>
            </Sheet>
        )}
      </div>
    </div>
  );
}