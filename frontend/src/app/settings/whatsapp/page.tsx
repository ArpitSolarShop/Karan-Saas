'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useWhatsappSocket } from '@/hooks/useWhatsappSocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, RefreshCw, Trash, Smartphone, Cloud, Wifi, 
  Check, X, LayoutTemplate, MessageSquare, ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';

interface WhatsAppInstance {
  id: string;
  name: string;
  connectionStatus: string;
  connectionType: 'BAILEYS_NATIVE' | 'CLOUD_API';
  phoneNumber?: string;
  businessName?: string;
  _count?: {
    messages: number;
    contacts: number;
    templates: number;
  };
}

export default function WhatsAppSettingsPage() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [activeInstance, setActiveInstance] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState('demo-tenant-id');
  const [createMode, setCreateMode] = useState<'baileys' | 'cloud_api' | null>(null);
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);
  
  const [cloudForm, setCloudForm] = useState({
    name: '',
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    phoneNumber: '',
    businessName: ''
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateInstance, setSelectedTemplateInstance] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Real-time custom hook connecting to NestJS Gateway
  const { qrCode, isConnected } = useWhatsappSocket(activeInstance);

  useEffect(() => {
    // 1. Fetch Tenant
    const storedTenant = localStorage.getItem('tenantId') || 'demo-tenant-id';
    setTenantId(storedTenant);
    loadInstances(storedTenant);

    // 2. Load Facebook SDK for Embedded Signup
    if (!(window as any).FB) {
      const script = document.createElement('script');
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        (window as any).FB.init({
          appId: process.env.NEXT_PUBLIC_FB_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v21.0'
        });
        setFbSdkLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setFbSdkLoaded(true);
    }
  }, []);

  const loadInstances = async (tid: string) => {
    try {
      const { data } = await api.get(`/whatsapp/instances/${tid}`);
      setInstances(data);
      
      // Auto-reconnect Baileys if disconnected
      const disconnectedBaileys = data.find((i: WhatsAppInstance) => 
        i.connectionType === 'BAILEYS_NATIVE' && 
        i.connectionStatus !== 'connected' &&
        activeInstance !== i.id
      );

      if (disconnectedBaileys && !activeInstance) {
        handleConnect(disconnectedBaileys.id);
      }
    } catch (error) {
      console.error('Failed to load WhatsApp instances', error);
    }
  };

  // ── BAILEYS INSTANCE CREATION ──
  const handleCreatePrompt = async () => {
    const name = prompt('Enter a name for this WhatsApp Number (e.g., Sales Team Alpha)');
    if (!name) return;
    try {
      const { data } = await api.post('/whatsapp/instances', {
        tenantId,
        name,
        connectionType: 'BAILEYS_NATIVE'
      });
      loadInstances(tenantId);
      setCreateMode(null);
      // Instantly start connection flow
      handleConnect(data.id);
    } catch (error) {
      console.error('Failed to create Baileys instance');
    }
  };

  // ── CLOUD API INSTANCE CREATION ──
  const handleCreateCloudApi = async () => {
    if (!cloudForm.name || !cloudForm.phoneNumberId || !cloudForm.wabaId || !cloudForm.accessToken) {
      alert('Missing required Cloud API fields.');
      return;
    }
    try {
      await api.post('/whatsapp/instances', {
        tenantId,
        ...cloudForm,
        connectionType: 'CLOUD_API'
      });
      loadInstances(tenantId);
      setCreateMode(null);
      setCloudForm({ name: '', phoneNumberId: '', wabaId: '', accessToken: '', phoneNumber: '', businessName: '' });
    } catch (error) {
      console.error('Failed to create Cloud API instance');
    }
  };

  // ── EMBEDDED SIGNUP (FRICTIONLESS) ──
  const handleEmbeddedSignup = () => {
    if (!(window as any).FB) {
      alert('Facebook SDK not loaded.');
      return;
    }

    (window as any).FB.login(
      async (response: any) => {
        if (response.authResponse) {
          try {
            await api.post('/whatsapp/embedded-signup', {
              tenantId,
              userAccessToken: response.authResponse.accessToken,
            });
            loadInstances(tenantId);
            setCreateMode(null);
          } catch (error) {
            console.error('Backend provisioning failed:', error);
            alert('Failed to provision via Facebook Login.');
          }
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_FB_CONFIG_ID || '',
        response_type: 'code',
        override_default_response_type: true,
        extras: { feature: 'whatsapp_embedded_signup' },
        scope: 'whatsapp_business_management,whatsapp_business_messaging',
      }
    );
  };

  const handleConnect = async (id: string) => {
    setActiveInstance(id);
    try {
      await api.post(`/whatsapp/instances/${id}/connect`);
    } catch (error) {
      console.error('Failed to initialize connection');
      setActiveInstance(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this WhatsApp account?')) return;
    try {
      await api.delete(`/whatsapp/instances/${id}/disconnect`);
      if (activeInstance === id) setActiveInstance(null);
      loadInstances(tenantId);
    } catch (error) {
      console.error('Failed to disconnect');
    }
  };

  const handleSyncTemplates = async (instanceId: string) => {
    setSyncing(true);
    try {
      await api.post(`/whatsapp/templates/${instanceId}/sync`);
      const { data } = await api.get(`/whatsapp/templates/${instanceId}`);
      setTemplates(data);
    } catch (error) {
      console.error('Sync failed', error);
    }
    setSyncing(false);
  };

  const handleViewTemplates = async (instanceId: string) => {
    setSelectedTemplateInstance(instanceId);
    try {
      const { data } = await api.get(`/whatsapp/templates/${instanceId}`);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates', error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadInstances(tenantId);
      setActiveInstance(null);
    }
  }, [isConnected, tenantId]);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">WhatsApp Connectivity</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Dual-Engine System: Official Cloud API + Native Baileys Engine. 
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={() => setCreateMode('baileys')} className="border-green-200 hover:bg-green-50">
            <Wifi className="mr-2 h-5 w-5 text-green-600" /> Add Baileys (QR)
          </Button>
          <Button size="lg" onClick={() => setCreateMode('cloud_api')} className="bg-blue-600 hover:bg-blue-700">
            <Cloud className="mr-2 h-5 w-5" /> Add Cloud API
          </Button>
        </div>
      </div>

      {createMode === 'cloud_api' && (
        <Card className="border-2 border-blue-500 bg-blue-50/20 shadow-xl animate-in fade-in slide-in-from-top-4">
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-2xl">
               <ShieldCheck className="h-6 w-6 text-blue-600" />
               Setup Official WhatsApp Cloud API
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-8">
             <div className="bg-white p-8 rounded-xl border-2 border-dashed border-blue-200 text-center">
                <h3 className="text-xl font-bold mb-2">Embedded Signup (Frictionless)</h3>
                <p className="text-gray-600 mb-6">Connect your Facebook Business account in 3 clicks. No manual tokens required.</p>
                <Button 
                  onClick={handleEmbeddedSignup} 
                  disabled={!fbSdkLoaded}
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90 h-14 px-10 text-xl font-bold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Log in with Facebook
                </Button>
             </div>

             <div className="relative flex items-center py-4">
               <div className="flex-grow border-t border-gray-200"></div>
               <span className="flex-shrink mx-4 text-gray-400 text-sm uppercase tracking-widest font-bold">Or Manual Setup</span>
               <div className="flex-grow border-t border-gray-200"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Instance Name</label>
                  <Input value={cloudForm.name} onChange={e => setCloudForm({...cloudForm, name: e.target.value})} placeholder="e.g. Sales Team Official" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Phone Number ID</label>
                  <Input value={cloudForm.phoneNumberId} onChange={e => setCloudForm({...cloudForm, phoneNumberId: e.target.value})} placeholder="meta-phone-id" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-tighter">WABA ID</label>
                  <Input value={cloudForm.wabaId} onChange={e => setCloudForm({...cloudForm, wabaId: e.target.value})} placeholder="meta-waba-id" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Access Token</label>
                  <Input type="password" value={cloudForm.accessToken} onChange={e => setCloudForm({...cloudForm, accessToken: e.target.value})} placeholder="EAAA..." />
                </div>
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t">
               <Button variant="ghost" onClick={() => setCreateMode(null)}>Cancel</Button>
               <Button onClick={handleCreateCloudApi} className="bg-blue-600 px-8">Connect Cloud API</Button>
             </div>
           </CardContent>
        </Card>
      )}

      {createMode === 'baileys' && (
        <Card className="border-2 border-green-500 bg-green-50/20 shadow-xl animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle>Register Native Baileys Device</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 font-medium">This will initialize a native WhatsApp WebSocket on your server. Scan a QR code in the next step to link your personal or business phone.</p>
            <div className="flex gap-2">
              <Button onClick={handleCreatePrompt} className="bg-green-600 hover:bg-green-700 px-8">Start Registration</Button>
              <Button variant="ghost" onClick={() => setCreateMode(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {instances.map((instance) => (
          <Card key={instance.id} className={`relative transition-all hover:shadow-2xl border-2 ${activeInstance === instance.id ? 'border-primary' : 'hover:border-primary/20'}`}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${instance.connectionType === 'CLOUD_API' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {instance.connectionType === 'CLOUD_API' ? <Cloud className="h-6 w-6 text-blue-600" /> : <Smartphone className="h-6 w-6 text-green-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{instance.name}</h3>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 font-bold">{instance.connectionType.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <Badge 
                  variant={instance.connectionStatus === 'connected' ? 'default' : 'secondary'} 
                  className={instance.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-gray-100 text-gray-500 text-xs font-bold uppercase'}
                >
                  {instance.connectionStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {activeInstance === instance.id && (
                <div className="mb-6 bg-white border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] shadow-inner bg-dots-pattern">
                   {qrCode ? (
                     <>
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                           <QRCodeSVG value={qrCode} size={220} includeMargin />
                        </div>
                        <p className="mt-6 text-sm font-extrabold text-primary animate-pulse flex items-center gap-2">
                           <Wifi className="h-4 w-4" /> Scan with WhatsApp App
                        </p>
                     </>
                   ) : (
                     <div className="flex flex-col items-center">
                        <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-bold text-gray-400">Booting Engine...</p>
                        <p className="text-xs text-gray-400 mt-2">Waiting for server handshake</p>
                     </div>
                   )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {instance.connectionStatus !== 'connected' ? (
                  <Button 
                    variant={activeInstance === instance.id ? 'secondary' : 'default'} 
                    className={`w-full text-lg h-14 font-extrabold shadow-sm ${instance.connectionType === 'BAILEYS_NATIVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`} 
                    onClick={() => handleConnect(instance.id)} 
                    disabled={activeInstance === instance.id}
                  >
                    {activeInstance === instance.id ? (
                      <span className="flex items-center gap-2 italic uppercase">
                        <RefreshCw className="h-5 w-5 animate-spin" /> Handshaking...
                      </span>
                    ) : (
                      'Connect Device'
                    )}
                  </Button>
                ) : (
                  <Button variant="destructive" className="w-full h-14 font-extrabold shadow-lg" onClick={() => handleDisconnect(instance.id)}>
                    <Trash className="mr-3 h-5 w-5" /> TERMINATE SESSION
                  </Button>
                )}
                
                {instance.connectionType === 'CLOUD_API' && (
                  <Button variant="outline" className="w-full h-12 font-medium" onClick={() => handleViewTemplates(instance.id)}>
                    <LayoutTemplate className="mr-3 h-5 w-5 text-muted-foreground" /> Message Templates
                  </Button>
                )}
              </div>

              {instance._count && (
                 <div className="mt-4 pt-4 border-t flex justify-around text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <div>
                       <div className="text-gray-900 text-lg">{instance._count.messages}</div>
                       Messages
                    </div>
                    <div>
                       <div className="text-gray-900 text-lg">{instance._count.contacts}</div>
                       Contacts
                    </div>
                 </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {instances.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-4 border-dashed rounded-3xl bg-gray-50/50">
            <Smartphone className="h-20 w-20 text-gray-200 mb-6 drop-shadow-sm" />
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Zero Active Integrations</h3>
            <p className="text-gray-500 max-w-md mt-4 text-lg">
              Unlock multi-channel communication by connecting your official Meta account or scanning a personal QR code.
            </p>
            <div className="mt-10 flex gap-4">
               <Button size="lg" onClick={() => setCreateMode('baileys')} className="bg-white text-gray-900 border-2 border-gray-100 hover:bg-gray-50">Add Baileys</Button>
               <Button size="lg" onClick={() => setCreateMode('cloud_api')} className="bg-blue-600">Add Cloud API</Button>
            </div>
          </div>
        )}
      </div>

      {selectedTemplateInstance && (
        <Card className="shadow-2xl border-2 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-6 w-6 text-primary" />
              WhatsApp Message Templates
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncTemplates(selectedTemplateInstance)}
                disabled={syncing}
                className="font-bold uppercase text-xs"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Fetch from Meta'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplateInstance(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {templates.length === 0 ? (
              <div className="text-center py-20">
                <LayoutTemplate className="h-16 w-16 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">No verified templates found for this account.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b text-xs font-black uppercase text-gray-500 tracking-widest text-left">
                      <th className="py-4 px-6">Template Name</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Language</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {templates.map((tmpl) => (
                      <tr key={tmpl.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 px-6 font-bold text-gray-900">{tmpl.name}</td>
                        <td className="py-5 px-6">
                          <Badge variant="outline" className="rounded-md uppercase text-[10px] font-black">
                            {tmpl.category}
                          </Badge>
                        </td>
                        <td className="py-5 px-6 text-gray-500 font-medium">{tmpl.language}</td>
                        <td className="py-5 px-6 text-right">
                          <Badge
                            className={`rounded-full px-4 h-7 text-xs font-bold ${
                              tmpl.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : tmpl.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                            }`}
                          >
                            {tmpl.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

