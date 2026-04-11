"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, TrendingUp, TrendingDown, Info, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function AIForecast() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForecast() {
      try {
        const token = localStorage.getItem('crm_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/reports/ai-forecast`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("AI Forecast error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, []);

  if (loading) return <Skeleton className="h-[200px] w-full rounded-xl bg-surface-2" />;

  const isPositive = data?.outlook === 'HIGH';
  const OutlookIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-surface border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
         <BrainCircuit size={80} />
      </div>
      
      <CardHeader className="pb-2 border-b border-border/50 bg-primary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary animate-pulse" /> AI Business Pulse
          </CardTitle>
          <Badge variant={isPositive ? "success" : "warning"} className="uppercase font-bold tracking-tighter">
            {data?.outlook || 'NEUTRAL'} Outlook
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 relative z-10">
        <div className="flex gap-4 items-start mb-4">
           <div className={`p-3 rounded-full ${isPositive ? 'bg-success/10' : 'bg-warning/10'}`}>
              <OutlookIcon className={isPositive ? 'text-success' : 'text-warning'} size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Predictive Insight (Gemma-2)</p>
              <p className="text-sm font-medium leading-relaxed italic text-foreground">
                "{data?.analysis || 'Analyzing current sales trajectory and agent performance metrics...'}"
              </p>
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
           <div className="bg-surface-2/50 p-2 rounded border border-border/20">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Historical Yield</p>
              <p className="text-lg font-black">{data?.conversionRate ? (Number(data.conversionRate) * 100).toFixed(1) : '0'}%</p>
           </div>
           <div className="bg-surface-2/50 p-2 rounded border border-border/20">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Volume Trend</p>
              <p className="text-lg font-black">{data?.totalCalls || 0} Calls</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
