'use client';

import { useWhatsappSocket } from '@/hooks/useWhatsappSocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, User, Cloud, Wifi, LayoutTemplate } from 'lucide-react';
import { useState, useEffect, useRef, use } from 'react';
import api from '@/lib/api';

interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  messageType: string;
  messageData: any;
  timestamp: string;
  status?: string;
}

interface Instance {
  id: string;
  name: string;
  connectionType: 'CLOUD_API' | 'BAILEYS_NATIVE';
  connectionStatus: string;
}

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
}

export default function WhatsAppChatInbox({ params }: { params: Promise<{ jid: string }> }) {
  const { jid } = use(params);
  const [inputText, setInputText] = useState('');
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [instance, setInstance] = useState<Instance | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-Receive messages natively emitted via Baileys or Cloud API webhook
  const { messages: socketMessages, isConnected } = useWhatsappSocket(instanceId);

  useEffect(() => {
    // Load the active instance (you should get this from route state or global store)
    const loadActiveInstance = async () => {
      const storedTenant = localStorage.getItem('tenantId') || 'demo-tenant-id';
      try {
        const { data } = await api.get(`/whatsapp/instances/${storedTenant}`);
        if (data.length > 0) {
          // Pick the first connected instance
          const connected = data.find((i: Instance) => i.connectionStatus === 'connected') || data[0];
          setInstanceId(connected.id);
          setInstance(connected);

          // Load message history from DB
          const { data: msgs } = await api.get(`/whatsapp/messages/${connected.id}?jid=${jid}&limit=200`);
          setChatMessages(msgs);
        }
      } catch (error) {
        console.error('Failed to load instance', error);
      }
    };
    loadActiveInstance();
  }, [jid]);

  // Merge socket messages as they come in real-time
  useEffect(() => {
    if (socketMessages.length > 0) {
      const lastMsg = socketMessages[socketMessages.length - 1];
      const already = chatMessages.find((m) => m.id === lastMsg.id);
      if (!already) {
        setChatMessages((prev) => [...prev, lastMsg]);
      }
    }
  }, [socketMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Load templates for Cloud API instance
  const loadTemplates = async () => {
    if (!instanceId || instance?.connectionType !== 'CLOUD_API') return;
    try {
      const { data } = await api.get(`/whatsapp/templates/${instanceId}`);
      setTemplates(data.filter((t: Template) => t.status === 'APPROVED'));
      setShowTemplates(!showTemplates);
    } catch (error) {
      console.error('Failed to load templates', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !instanceId) return;

    try {
      await api.post('/whatsapp/send/text', {
        instanceId,
        jid: jid,
        text: inputText,
      });

      // Optimistically add to our local array
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          direction: 'OUTBOUND',
          messageType: 'text',
          messageData: { body: inputText },
          timestamp: new Date().toISOString(),
          status: 'SENT',
        },
      ]);

      setInputText('');
    } catch (error) {
      console.error('Failed to send WhatsApp message', error);
    }
  };

  const handleSendTemplate = async (template: Template) => {
    if (!instanceId) return;
    try {
      await api.post('/whatsapp/send/template', {
        instanceId,
        to: jid,
        templateName: template.name,
        languageCode: template.language,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          direction: 'OUTBOUND',
          messageType: 'template',
          messageData: { templateName: template.name, languageCode: template.language },
          timestamp: new Date().toISOString(),
          status: 'SENT',
        },
      ]);

      setShowTemplates(false);
    } catch (error) {
      console.error('Failed to send template', error);
    }
  };

  const getMessageContent = (msg: Message) => {
    switch (msg.messageType) {
      case 'text':
        return msg.messageData?.body || msg.messageData?.conversation || '';
      case 'template':
        return `📋 Template: ${msg.messageData?.templateName || 'Unknown'}`;
      case 'image':
        return `🖼️ Image${msg.messageData?.caption ? `: ${msg.messageData.caption}` : ''}`;
      case 'document':
        return `📄 Document: ${msg.messageData?.filename || 'file'}`;
      case 'video':
        return `🎬 Video${msg.messageData?.caption ? `: ${msg.messageData.caption}` : ''}`;
      case 'audio':
        return '🎵 Audio message';
      case 'location':
        return `📍 Location: ${msg.messageData?.name || msg.messageData?.address || 'Shared location'}`;
      case 'reaction':
        return msg.messageData?.emoji || '👍';
      case 'sticker':
        return '🏷️ Sticker';
      case 'interactive':
        return `📱 Interactive: ${msg.messageData?.button_reply?.title || msg.messageData?.list_reply?.title || 'response'}`;
      default:
        return msg.messageData?.conversation || msg.messageData?.extendedTextMessage?.text || 'Media Message';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[85vh] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="bg-primary/5 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">WhatsApp Chat: {jid}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center space-x-2">
                  {instance?.connectionType === 'CLOUD_API' ? (
                    <Cloud className="h-3 w-3 text-blue-500 mr-1" />
                  ) : (
                    <Wifi className="h-3 w-3 text-green-500 mr-1" />
                  )}
                  <span className={isConnected || instance?.connectionType === 'CLOUD_API' ? 'text-green-500' : 'text-gray-400'}>
                    ● {instance?.connectionType === 'CLOUD_API' ? 'Cloud API' : isConnected ? 'Engine Online' : 'Connecting...'}
                  </span>
                  {instance && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {instance.name}
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            {/* Template button for Cloud API */}
            {instance?.connectionType === 'CLOUD_API' && (
              <Button variant="outline" size="sm" onClick={loadTemplates}>
                <LayoutTemplate className="mr-1 h-4 w-4" /> Templates
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Template Picker */}
        {showTemplates && templates.length > 0 && (
          <div className="px-4 py-2 bg-blue-50 border-b max-h-40 overflow-y-auto">
            <p className="text-xs font-medium text-blue-700 mb-2">Select a template to send:</p>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <Button
                  key={t.id}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSendTemplate(t)}
                >
                  {t.name} ({t.language})
                </Button>
              ))}
            </div>
          </div>
        )}

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.direction === 'OUTBOUND'
                    ? 'bg-green-100 text-green-900 rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p>{getMessageContent(msg)}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  {msg.direction === 'OUTBOUND' && msg.status && (
                    <span className="text-[10px] text-gray-400">
                      {msg.status === 'READ' ? '✓✓' : msg.status === 'DELIVERED' ? '✓✓' : msg.status === 'SENT' ? '✓' : msg.status === 'FAILED' ? '✗' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 bg-gray-50 border-t flex space-x-3 items-end">
          <textarea
            className="flex-1 resize-none rounded-md border p-3 min-h-[50px] max-h-[120px] shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Type a WhatsApp message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} className="bg-green-600 hover:bg-green-700 h-[50px] w-[50px] rounded-full p-0 flex items-center justify-center">
            <Send className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
