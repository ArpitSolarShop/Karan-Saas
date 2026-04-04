'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  User, 
  Send,
  MoreVertical,
  CheckCheck,
  Filter,
  Check,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  inbox: { name: string; channelType: string };
  contact?: { id: string; name: string; firstName: string; phone: string; email: string; status: string };
  status: string;
  lastMessageAt: string;
  messages: Message[];
  metadata: any;
}

interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  contentType: string;
  timestamp: string;
  status: string;
  sender?: { firstName: string; lastName: string };
}

export default function OmnichannelInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  useEffect(() => {
    loadConversations();
    setupSocket();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/communications/conversations');
      setConversations(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const { data } = await api.get(`/communications/conversations/${id}/messages`);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  const setupSocket = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    const socket = io(`${baseUrl}/communications`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on(`omni-message:${selectedId}`, (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on(`conversation-update:${localStorage.getItem('tenantId')}`, (updated: Conversation) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === updated.id);
        if (index === -1) return [updated, ...prev];
        const newArr = [...prev];
        newArr[index] = updated;
        return newArr.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
    });
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedConversation) return;

    try {
      const type = selectedConversation.inbox.channelType.startsWith('WHATSAPP') ? 'WHATSAPP' : 'EMAIL';
      await api.post('/communications/send', {
        id: selectedConversation.contact?.id || selectedConversation.id,
        type,
        message: inputText,
      });
      setInputText('');
      // The message will be added via socket or we could optimistically add it here
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const getChannelIcon = (type: string) => {
    if (type.includes('WHATSAPP')) return <MessageSquare className="h-4 w-4 text-green-500" />;
    if (type.includes('EMAIL')) return <Mail className="h-4 w-4 text-blue-500" />;
    return <Smartphone className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      {/* 1. Conversations Sidebar */}
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Inbox</h2>
            <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${selectedId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  {getChannelIcon(conv.inbox.channelType)}
                  <span className="font-semibold truncate max-w-[120px]">
                    {conv.contact?.name || conv.contact?.firstName || conv.metadata.remoteJid || 'Unknown'}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(conv.lastMessageAt), 'HH:mm')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conv.messages[0]?.content || 'No messages yet'}
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* 2. Main Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{selectedConversation.contact?.name || 'Customer'}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    {selectedConversation.inbox.name} • {selectedConversation.status}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
            </div>

            <ScrollArea className="flex-1 p-6 bg-slate-50/30">
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] space-y-1`}>
                      <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        msg.direction === 'OUTBOUND' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-white border rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] text-muted-foreground ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                        {msg.direction === 'OUTBOUND' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Type your message..."
                    className="w-full rounded-2xl border bg-muted/30 p-4 pr-12 focus:outline-none focus:ring-1 focus:ring-primary min-h-[50px] max-h-32 resize-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-10 w-10" />
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* 3. Lead Context Pane */}
      <div className="w-80 border-l bg-muted/5 p-6 hidden xl:block overflow-y-auto">
        <h3 className="font-bold mb-6">Contact Details</h3>
        {selectedConversation?.contact ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Phone</label>
              <p className="text-sm border-b pb-2">{selectedConversation.contact.phone}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Email</label>
              <p className="text-sm border-b pb-2">{selectedConversation.contact.email || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Status</label>
              <div className="flex pt-1 italic"><Badge variant="outline">{selectedConversation.contact.status}</Badge></div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-xs font-bold flex items-center gap-2"><Clock className="h-3 w-3" /> Quick Actions</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="justify-start">Add Task</Button>
                <Button variant="outline" size="sm" className="justify-start">Create Ticket</Button>
                <Button variant="outline" size="sm" className="justify-start">Schedule Call</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 opacity-50">
             <User className="h-10 w-10 mx-auto mb-2" />
             <p className="text-xs italic">No linked lead found for this conversation.</p>
             <Button variant="link" size="sm" className="mt-2">Link manually</Button>
          </div>
        )}
      </div>
    </div>
  );
}
