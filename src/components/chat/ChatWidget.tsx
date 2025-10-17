import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Plus } from 'lucide-react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChat } from '@/hooks/useChat';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useSafeArea } from '@/hooks/useSafeArea';
import { ChatMessage, NewChatData } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

export const ChatWidget = () => {
  const { userId } = useAuthStatus();
  const isMobile = useIsMobile();
  const safeArea = useSafeArea();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
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

  // Visual Viewport API handling for keyboard - keeps drawer in fixed screen position
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !window.visualViewport) return;

    const updatePosition = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      
      // Calculate offset needed to keep drawer at bottom of screen (not visual viewport)
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardHeight(offset);
      setIsKeyboardVisible(offset > 0);
    };

    window.visualViewport.addEventListener('resize', updatePosition);
    window.visualViewport.addEventListener('scroll', updatePosition);

    // Initial call
    updatePosition();

    return () => {
      window.visualViewport?.removeEventListener('resize', updatePosition);
      window.visualViewport?.removeEventListener('scroll', updatePosition);
    };
  }, []);

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
            className="flex-1 p-4"
          >
            {messages.map(renderMessage)}
          </ScrollArea>

          <div 
            className="p-4 border-t"
            style={{
              backgroundColor: 'hsl(var(--background))'
            }}
          >
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {/* File upload functionality can be added later */}}
                disabled={(() => {
                  const activeConv = conversations.find(c => c.id === activeConversationId);
                  return activeConv?.status === 'closed';
                })()}
                className="h-10 w-10 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={(() => {
                  const activeConv = conversations.find(c => c.id === activeConversationId);
                  if (activeConv?.status === 'closed') {
                    return '';
                  }
                  return 'Type your message...';
                })()}
                disabled={(() => {
                  const activeConv = conversations.find(c => c.id === activeConversationId);
                  return activeConv?.status === 'closed';
                })()}
                className="flex-1 min-h-[40px] max-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={(() => {
                  const activeConv = conversations.find(c => c.id === activeConversationId);
                  return !newMessage.trim() || isSendingMessage || activeConv?.status === 'closed';
                })()}
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
        <>
          {isOpen && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 z-[10000] bg-black/50"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Custom Fixed Drawer */}
              <div
                className="fixed inset-x-0 z-[10000] flex flex-col rounded-t-[10px] border bg-background"
                style={{
                  height: '600px',
                  bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : 0,
                  paddingBottom: safeArea.bottom > 0 ? `${safeArea.bottom}px` : undefined
                }}
              >
                {/* Drag Handle */}
                <div className="mx-auto mt-1 mb-4 h-[4px] w-[80px] rounded-full bg-[#e8e8e8] dark:bg-[#232324]" />
                
                {/* Header */}
                <div className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 flex-shrink-0">
                  <h2 className="text-lg font-semibold">Support Chat</h2>
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
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <ChatContent />
                </div>
              </div>
            </>
          )}
        </>
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