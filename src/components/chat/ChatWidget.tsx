import React, { useState } from 'react';
import { MessageCircle, X, Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { ChatMessage, NewChatData } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

export const ChatWidget = () => {
  const { userId } = useAuthStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newChatData, setNewChatData] = useState<NewChatData>({
    subject: '',
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

  const handleCreateConversation = () => {
    if (!newChatData.message.trim()) return;
    createConversation(newChatData);
    setNewChatData({ subject: '', message: '' });
    setShowNewChat(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId) return;
    sendMessage({ conversationId: activeConversationId, message: newMessage });
    setNewMessage('');
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    markAsRead(conversationId);
  };

  const renderMessage = (message: ChatMessage) => {
    const isOwn = message.sender_id === userId;
    const isSystem = message.message_type === 'system';
    
    return (
      <div
        key={message.id}
        className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-3 py-2 ${
            isSystem
              ? 'bg-muted text-muted-foreground text-center text-sm'
              : isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-[#f0f0f0] dark:bg-[#3b3b3d] text-[#121212] dark:text-[#ffffff]'
          }`}
        >
          <p className="text-sm">{message.message}</p>
          <p className="text-xs opacity-70 mt-1">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  };

  if (!userId) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Support Chat</CardTitle>
            <div className="flex gap-2">
              {!activeConversationId && !showNewChat && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewChat(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {showNewChat ? (
              /* New Chat Form */
              <div className="p-4 space-y-4">
                <div>
                  <Label htmlFor="subject">Subject (optional)</Label>
                  <Input
                    id="subject"
                    value={newChatData.subject}
                    onChange={(e) => setNewChatData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="What can we help you with?"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newChatData.message}
                    onChange={(e) => setNewChatData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue or question..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateConversation}
                    disabled={!newChatData.message.trim() || isCreatingConversation}
                    className="flex-1"
                  >
                    Start Chat
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewChat(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : activeConversationId ? (
              /* Active Conversation */
              <>
                <div className="p-3 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveConversationId(null)}
                  >
                    ← Back to conversations
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {messages.map(renderMessage)}
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
              </>
            ) : (
              /* Conversation List */
              <ScrollArea className="flex-1 p-4">
                {conversations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Click the + button to start a new chat</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <Card
                        key={conversation.id}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleConversationSelect(conversation.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">
                            {(conversation.subject === 'Support Request' || conversation.subject === 'Support Chat') ? 'Support' : (conversation.subject || 'Support')}
                          </h4>
                          <Badge
                            variant={conversation.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {conversation.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {conversation.last_message_at && 
                            formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                          }
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};