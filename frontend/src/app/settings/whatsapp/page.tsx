'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useWhatsappSocket } from '@/hooks/useWhatsappSocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Plus, RefreshCw, Trash, Smartphone } from 'lucide-react';
import api from '@/lib/api';

interface WhatsAppInstance {
  id: string;
  name: string;
  connectionStatus: string;
}

export default function WhatsAppSettingsPage() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [activeInstance, setActiveInstance] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState('demo-tenant-id'); // Hook this to your actual auth context

  // Real-time custom hook connecting to NestJS Gateway
  const { qrCode, isConnected } = useWhatsappSocket(activeInstance);

  useEffect(() => {
    // Replace with real tenant ID fetching logic
    // We are simulating fetching the stored user tenant
    const storedTenant = localStorage.getItem('tenantId') || 'demo-tenant-id';
    setTenantId(storedTenant);
    loadInstances(storedTenant);
  }, []);

  const loadInstances = async (tid: string) => {
    try {
      const { data } = await api.get(`/whatsapp/instances/${tid}`);
      setInstances(data);
    } catch (error) {
      console.error('Failed to load WhatsApp instances', error);
    }
  };

  const handleCreateInstance = async () => {
    const name = prompt('Enter a name for this WhatsApp Number (e.g., Sales Team Alpha)');
    if (!name) return;

    try {
      await api.post('/whatsapp/instances', { tenantId, name });
      loadInstances(tenantId);
    } catch (error) {
      console.error('Failed to create instance');
    }
  };

  const handleConnect = async (id: string) => {
    setActiveInstance(id);
    try {
      await api.post(`/whatsapp/instances/${id}/connect`);
      // NestJS will boot Baileys, generate QR, and emit it via Socket.io
      // Our useWhatsappSocket hook will automatically pick it up and update the `qrCode` variable
    } catch (error) {
      console.error('Failed to initialize connection');
      setActiveInstance(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this phone?')) return;
    try {
      await api.delete(`/whatsapp/instances/${id}/disconnect`);
      if (activeInstance === id) setActiveInstance(null);
      loadInstances(tenantId);
    } catch (error) {
      console.error('Failed to disconnect');
    }
  };

  // Re-fetch instances when a connection is successful
  useEffect(() => {
    if (isConnected) {
      loadInstances(tenantId);
      setActiveInstance(null);
    }
  }, [isConnected, tenantId]);

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp API Integration</h1>
          <p className="text-muted-foreground mt-2">
            Native, Self-Sufficient WhatsApp WebSocket infrastructure. Zero external dependencies.
          </p>
        </div>
        <Button onClick={handleCreateInstance}>
          <Plus className="mr-2 h-4 w-4" /> Add New Number
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance) => (
          <Card key={instance.id} className="relative overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Smartphone className="h-5 w-5 text-gray-500" />
                  <span>{instance.name}</span>
                </CardTitle>
                <Badge
                  variant={instance.connectionStatus === 'connected' ? 'default' : 'secondary'}
                  className={
                    instance.connectionStatus === 'connected'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700'
                  }
                >
                  {instance.connectionStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {/* Dynamic QR Code Modal Space */}
              {activeInstance === instance.id && (
                <div className="flex flex-col flex-1 items-center justify-center p-4 bg-gray-50 rounded-lg mb-4 text-center min-h-[250px]">
                  {qrCode ? (
                    <QRCodeSVG value={qrCode} size={200} />
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-500 font-medium">Booting Native Engine...</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-4 max-w-[200px]">
                    Open WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device
                  </p>
                </div>
              )}

              <div className="flex space-x-2 mt-4">
                {instance.connectionStatus !== 'connected' && (
                  <Button
                    variant="outline"
                    className="w-full bg-primary/5 hover:bg-primary/10"
                    onClick={() => handleConnect(instance.id)}
                    disabled={activeInstance === instance.id}
                  >
                    {activeInstance === instance.id ? 'Connecting...' : 'Scan QR Code'}
                  </Button>
                )}

                {instance.connectionStatus === 'connected' && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDisconnect(instance.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Disconnect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {instances.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-gray-900">No Instances Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Click "Add New Number" to generate a Baileys WebSocket instance natively attached to your PostgreSQL database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
