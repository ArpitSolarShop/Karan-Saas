"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Users, PhoneCall, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function LiveMetricsHub() {
  const [metrics, setMetrics] = useState({
    callsToday: 0,
    activeCalls: 0,
    conversionRate: '0%',
    agentsOnline: 0
  });

  useEffect(() => {
    // 1. Fetch initial snapshot
    const fetchSnapshot = async () => {
       const token = localStorage.getItem('crm_token');
       try {
         const res = await fetch(`${API_URL}/reports/live-wallboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await res.json();
         setMetrics(data);
       } catch (err) {
         console.warn("Could not fetch wallboard snapshot", err);
       }
    };
    fetchSnapshot();

    // 2. Listen for Socket.io updates
    const socket: Socket = io(API_URL, {
      transports: ['websocket'],
      withCredentials: true
    });

    socket.on('bi:live_metrics', (data) => {
      setMetrics(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const items = [
    { label: 'Today\'s Calls', value: metrics.callsToday, icon: PhoneCall, color: 'text-primary' },
    { label: 'Active Calls', value: metrics.activeCalls, icon: Activity, color: 'text-success', pulse: metrics.activeCalls > 0 },
    { label: 'Live Conv. Rate', value: metrics.conversionRate, icon: TrendingUp, color: 'text-warning' },
    { label: 'Agents Online', value: metrics.agentsOnline, icon: Users, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {items.map((item, i) => (
        <Card key={i} className="bg-surface border-border hover:border-primary/30 transition-all group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{item.label}</p>
                  <h3 className={cn("text-3xl font-black tracking-tighter", item.pulse && "animate-pulse")}>
                    {item.value}
                  </h3>
               </div>
               <div className={cn("p-2 rounded-lg bg-surface-2", item.color.replace('text-', 'bg-') + '/10')}>
                 <item.icon size={20} className={item.color} />
               </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
               <span className={cn("h-1.5 w-1.5 rounded-full", item.pulse ? "bg-success animate-ping" : "bg-border")} />
               <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Live Feed Active</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
