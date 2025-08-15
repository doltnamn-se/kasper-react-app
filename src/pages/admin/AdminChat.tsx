import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Send } from 'lucide-react';
import { useAdminChat } from '@/hooks/useAdminChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { formatDistanceToNow } from 'date-fns';
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
    customerId: '',
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    message: ''
  });
  
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
  };

  const handleCreateConversation = () => {
    if (!newChatData.message.trim() || !newChatData.customerId || !userId) return;
    createConversation({ 
      customerId: newChatData.customerId, 
      adminId: userId, 
      chatData: {
        subject: newChatData.subject,
        priority: newChatData.priority,
        message: newChatData.message
      }
    });
    setNewChatData({ customerId: '', subject: '', priority: 'medium', message: '' });
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
        <div>
          <label className="text-sm font-medium mb-2 block">Subject (Optional)</label>
          <Input
            value={newChatData.subject}
            onChange={(e) => setNewChatData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="What is this about?"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Priority</label>
          <Select
            value={newChatData.priority}
            onValueChange={(value: 'low' | 'medium' | 'high') => 
              setNewChatData(prev => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Message</label>
          <Textarea
            value={newChatData.message}
            onChange={(e) => setNewChatData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Type your message..."
            className="min-h-[120px]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateConversation}
            disabled={!newChatData.message.trim() || !newChatData.customerId || isCreatingConversation}
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

  const renderChatInterface = (inSheet = false) => (
    <Card className={`${inSheet ? '' : 'lg:col-span-2'} bg-white dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl`}>
      {activeConversationId ? (
        <>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chat</CardTitle>
            <div className="flex gap-2">
              {userId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => assignConversation({ conversationId: activeConversationId, adminId: userId })}
                >
                  Assign to me
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => closeConversation(activeConversationId)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className={`flex flex-col ${inSheet ? 'h-[70vh]' : 'h-[500px]'} p-0`}>
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => {
                const isAdmin = message.sender?.role === 'super_admin';
                return (
                  <div
                    key={message.id}
                    className={`flex mb-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 min-h-[40px] max-h-[100px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSendingMessage}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent className={`flex items-center justify-center ${inSheet ? 'h-[70vh]' : 'h-[500px]'} opacity-30 grayscale`}>
          {/* Empty state - no conversation selected */}
        </CardContent>
      )}
    </Card>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>
          {t('nav.admin.support')}
        </h1>
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
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isMobile ? '' : 'lg:grid-cols-3 h-[600px]'}`}>
        {/* Conversations List */}
        <Card className={`${isMobile ? '' : 'lg:col-span-1'} bg-white dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-medium text-[#121212] dark:text-[#ffffff]">{t('conversations')}</CardTitle>
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
                    <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                      {conversation.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {conversation.subject || 'Support Chat'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {conversation.last_message_at && 
                      formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                    }
                  </p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Desktop Chat Interface or Mobile Sheet */}
        {!isMobile ? (
          isCreatingNew ? renderNewChatForm() : renderChatInterface()
        ) : (
          <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
            <SheetContent side="bottom" className="h-[90vh] p-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#161617]">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle>
                    {isCreatingNew ? 'Start New Conversation' : 'Chat'}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  {isCreatingNew ? renderNewChatForm(true) : renderChatInterface(true)}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}