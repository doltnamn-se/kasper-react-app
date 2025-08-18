import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Send } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { formatDistanceToNow } from 'date-fns';
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
  const [newChatData, setNewChatData] = useState({
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
    markAsRead,
    isCreatingConversation,
    isSendingMessage
  } = useChat(userId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId) return;
    sendMessage({ conversationId: activeConversationId, message: newMessage });
    setNewMessage('');
  };

  const handleCreateConversation = () => {
    if (!newChatData.message.trim()) return;
    createConversation(newChatData);
    setNewChatData({ subject: '', priority: 'medium', message: '' });
    setIsCreatingNew(false);
  };

  const handleStartNewChat = () => {
    const defaultChatData = {
      subject: 'Support Request',
      priority: 'medium' as const,
      message: 'I need help with something.'
    };
    createConversation(defaultChatData);
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
              <ScrollArea className="flex-1 px-4 py-2">
                {messages.map((message) => {
                  const isCurrentUser = message.sender_id === userId;
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          isCurrentUser 
                            ? 'bg-[#007AFF] text-white' 
                            : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#000000] dark:text-[#FFFFFF]'
                        }`}
                      >
                        <p className="text-base">{message.message}</p>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
              <div className="px-4 pb-4">
                <div className="flex items-center gap-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-full px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full bg-transparent hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] p-0 flex-shrink-0"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Skriv här..."
                    className="flex-1 bg-transparent outline-none text-base placeholder:text-[#8E8E93]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSendingMessage}
                    size="icon"
                    className="w-8 h-8 rounded-full bg-[#007AFF] hover:bg-[#0056CC] text-white p-0 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
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
      <Card className="lg:col-span-2 bg-white dark:bg-[#1c1c1e] dark:border dark:border-[#232325] rounded-2xl">
        {activeConversationId ? (
          <>
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px] p-0">
              <ScrollArea className="flex-1 p-4">
                {messages.map((message) => {
                  const isUser = message.sender_id === userId;
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
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
                    placeholder="Type your message..."
                    className="flex-1 min-h-[40px] max-h-[100px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
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
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                      activeConversationId === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">
                        {conversation.subject || 'Support Chat'}
                      </h4>
                      <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                        {conversation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Priority: {conversation.priority}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.last_message_at && 
                        formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                      }
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
              <SheetContent side="bottom" className="h-[90vh] p-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#161617]">
                <div className="flex flex-col h-full relative z-[10001]">
                  <div className="flex items-center justify-between p-4 border-b border-[#F2F2F7] dark:border-[#2C2C2E]">
                    <h2 className="text-lg font-semibold text-[#000000] dark:text-[#FFFFFF]">
                      Nytt meddelande
                    </h2>
                  </div>
                  <div className="flex-1 relative z-[10001]">
                    {renderChatInterface(true)}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </MainLayout>
  );
}