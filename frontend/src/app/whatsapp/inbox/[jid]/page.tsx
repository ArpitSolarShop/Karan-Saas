'use client';

import { useWhatsappSocket } from '@/hooks/useWhatsappSocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function WhatsAppChatInbox({ params }: { params: { jid: string } }) {
  const [inputText, setInputText] = useState('');
  const [instanceId, setInstanceId] = useState<string | null>(null);

  // Auto-Receive messages natively emitted via Baileys Engine
  const { messages, isConnected } = useWhatsappSocket(instanceId);

  useEffect(() => {
    // Determine the active instance ID here (fetch from DB or global store)
    // Hardcoded for demo purposes:
    setInstanceId('active-instance-id');
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !instanceId) return;

    try {
      await api.post('/whatsapp/send/text', {
        instanceId,
        jid: params.jid,
        text: inputText,
      });

      // Optimistically add it to our native socket array
      messages.push({
        id: Date.now().toString(),
        direction: 'OUTBOUND',
        messageData: { conversation: inputText },
        timestamp: new Date().toISOString(),
      });

      setInputText('');
    } catch (error) {
      console.error('Failed to send WhatsApp message', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[85vh] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="bg-primary/5 border-b pb-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp Chat: {params.jid}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center space-x-2">
                <span className={isConnected ? 'text-green-500' : 'text-gray-400'}>
                  ● {isConnected ? 'Engine Online' : 'Connecting to Socket...'}
                </span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.direction === 'OUTBOUND'
                    ? 'bg-green-100 text-green-900 rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p>{msg.messageData?.conversation || msg.messageData?.extendedTextMessage?.text || 'Media Message'}</p>
                <span className="text-[10px] text-gray-500 mt-1 block text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
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
