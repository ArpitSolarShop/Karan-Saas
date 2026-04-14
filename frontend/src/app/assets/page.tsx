"use client";

import { Car, Building, Monitor, CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";
import api, { fetcher } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AssetsPage() {
  const { data: assets, error, isLoading, mutate } = useSWR("/assets", fetcher);

  const handleBookNow = async (id: string) => {
    try {
      // Mocking reservation data for demo purpose, a real app would use a date picker
      await api.post(`/assets/${id}/reserve`, {
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000), // +1 hour
        purpose: "Quick booking via Dashboard"
      });
      toast.success("Asset reserved successfully");
      mutate();
    } catch (err) {
      toast.error("Failed to reserve asset");
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'ROOM': return <Building className="h-5 w-5" />;
      case 'VEHICLE': return <Car className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            Physical Assets
          </h2>
          <p className="text-muted-foreground mt-1">
            Reserve meeting rooms, vehicles, and shared equipment.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
          <Plus className="mr-2 h-4 w-4" /> New Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
           <div className="col-span-full text-center text-red-500 py-12">
             Failed to load assets.
           </div>
        ) : assets?.length === 0 ? (
           <div className="col-span-full text-center text-muted-foreground py-12">
             No assets found.
           </div>
        ) : (
          assets?.map((asset: any) => (
            <Card key={asset.id} className="bg-surface border-border hover:border-primary/50 transition-colors shadow-sm group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                  {asset.name}
                </CardTitle>
                <div className="text-muted-foreground bg-surface-2 p-2 rounded-full group-hover:text-primary transition-colors">
                  {getIcon(asset.type)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline" className="text-[10px] tracking-widest uppercase bg-surface-2">{asset.type}</Badge>
                  <Badge variant={asset.status === 'AVAILABLE' ? 'default' : 'destructive'} className={asset.status === 'AVAILABLE' ? 'bg-success hover:bg-success text-success-foreground' : ''}>
                    {asset.status}
                  </Badge>
                </div>
                <div className="mt-6">
                  <Button 
                    onClick={() => handleBookNow(asset.id)}
                    disabled={asset.status !== 'AVAILABLE'}
                    variant="outline" 
                    className="w-full flex items-center justify-center border-border hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
