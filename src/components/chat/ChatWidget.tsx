import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChat } from '@/hooks/useChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { ChatMessage, NewChatData } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

export const ChatWidget = () => {
  const { userId } = useAuthStatus();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [newChatData, setNewChatData] = useState<NewChatData>({
    subject: '',
    message: ''
  });

  // Track viewport height changes for keyboard detection
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

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
              : 'bg-[#f0f0f0] dark:!bg-[#2f2f31] text-[#121212] dark:text-[#ffffff]'
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

  // Calculate dynamic height for mobile chat area
  const getMobileChatHeight = () => {
    if (!isMobile) return 'flex-1';
    
    // Base drawer height is 85vh
    const drawerHeight = viewportHeight * 0.85;
    
    // Fixed heights: header (~80px), footer/input (~100px), padding (~40px)
    const fixedHeight = 220;
    
    // Available height for the scrollable content
    const availableHeight = drawerHeight - fixedHeight;
    
    return `${Math.max(200, availableHeight)}px`;
  };

  const ChatContent = () => (
    <>
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
          
          <ScrollArea 
            className="p-4" 
            style={{ 
              height: isMobile ? getMobileChatHeight() : 'auto',
              flex: isMobile ? 'none' : '1'
            }}
          >
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
        <ScrollArea 
          className="p-4" 
          style={{ 
            height: isMobile ? getMobileChatHeight() : 'auto',
            flex: isMobile ? 'none' : '1'
          }}
        >
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
    </>
  );

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="h-[85vh]">
            <DrawerHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <DrawerTitle className="text-lg">Support Chat</DrawerTitle>
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
              </div>
            </DrawerHeader>
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatContent />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop Dialog */
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-md h-[500px] p-0 flex flex-col">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3">
              <DialogTitle className="text-lg">Support Chat</DialogTitle>
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
              </div>
            </DialogHeader>
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatContent />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};