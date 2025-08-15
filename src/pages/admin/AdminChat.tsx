import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { useAdminChat } from '@/hooks/useAdminChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminChat() {
  const { userId } = useAuthStatus();
  const { t } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    assignConversation,
    closeConversation,
    markAsRead,
    isSendingMessage
  } = useAdminChat();

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId || !userId) return;
    sendMessage({ conversationId: activeConversationId, message: newMessage, adminId: userId });
    setNewMessage('');
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    if (userId) markAsRead(conversationId, userId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>
          {t('nav.admin.support')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-[#121212] dark:text-[#000000]">{t('conversations')} ({conversations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
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

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
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
              <CardContent className="flex flex-col h-[500px] p-0">
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
            <CardContent className="flex items-center justify-center h-[500px]">
              <p className="text-muted-foreground underline decoration-[#24CC5C] decoration-1 underline-offset-2">
                {t('select.conversation.to.chat')}
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}