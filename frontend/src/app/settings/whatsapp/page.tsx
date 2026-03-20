'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCcw, Smartphone, CheckCircle2, QrCode, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Status = 'CONNECTING' | 'QR' | 'CONNECTED' | 'DISCONNECTED' | 'LOGGED_OUT' | 'NOT_INITIALIZED' | 'loading';

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [connectedAs, setConnectedAs] = useState<string | null>(null);
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${BACKEND}/communications/whatsapp/status`);
      const data = await res.json();
      setStatus(data.status);
      setConnectedAs(data.connectedAs);
      if (data.status === 'QR') {
        setQrTimestamp(Date.now());
      }
    } catch {
      setStatus('DISCONNECTED');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Smartphone className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Channel</h1>
          <p className="text-muted-foreground text-balanced">
            Integrate your business WhatsApp account to start unified communications directly from the CRM terminal.
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/20 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">Connection Terminal</CardTitle>
                <CardDescription>Real-time Baileys Engine Status</CardDescription>
              </div>
              <Badge variant="outline" className={cn(
                "capitalize py-1 px-3",
                status === 'CONNECTED' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                status === 'QR' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                status === 'DISCONNECTED' && "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                {status.toLowerCase().replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-8">
              {status === 'loading' ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <Skeleton className="h-[200px] w-[200px] rounded-lg" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              ) : status === 'CONNECTED' ? (
                <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="relative inline-block">
                    <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border-2 border-emerald-500 flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Successfully Paired</h3>
                    <p className="text-sm text-muted-foreground">
                      Linked as <span className="text-foreground font-mono font-bold">+{connectedAs ?? 'Default'}</span>
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" onClick={fetchStatus} disabled={isRefreshing}>
                      <RefreshCcw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} /> Verify
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" /> Revoke Session
                    </Button>
                  </div>
                </div>
              ) : status === 'QR' ? (
                <div className="flex flex-col md:flex-row items-center gap-12 animate-in fade-in duration-500">
                  <div className="p-4 bg-white rounded-2xl shadow-2xl">
                    <img
                      key={qrTimestamp}
                      src={`${BACKEND}/communications/whatsapp/qr-image?t=${qrTimestamp}`}
                      alt="WhatsApp QR Code"
                      className="w-48 h-48 block"
                    />
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-yellow-500 mb-1">
                            <QrCode className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Authentication Required</span>
                        </div>
                        <h3 className="text-lg font-bold">Link Account</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Scan this encrypted code with your phone to establish the secure CRM conduit.
                        </p>
                    </div>

                    <ul className="space-y-3 text-xs text-muted-foreground list-decimal list-inside marker:text-primary marker:font-bold">
                        <li>Open WhatsApp on your device</li>
                        <li>Tap <span className="text-foreground font-bold">Menu</span> or <span className="text-foreground font-bold">Settings</span></li>
                        <li>Select <span className="text-foreground font-bold">Linked Devices</span></li>
                        <li>Point your phone to this screen</li>
                    </ul>

                    <p className="text-[10px] text-muted-foreground italic">
                        ⟳ Auto-refreshing every 20s to ensure security.
                    </p>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Engine Standby</AlertTitle>
                  <AlertDescription className="text-xs">
                    The WhatsApp communication engine is currently offline or initializing. 
                    <Button variant="link" onClick={fetchStatus} className="h-auto p-0 ml-1 text-destructive font-bold underline">Retry Connection</Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          Powered by Baileys Multi-Device Protocol // Secure Alpha Sandbox 
        </p>
      </div>
    </div>
  );
}
