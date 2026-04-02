"use client";

import { Car, Building, Monitor, CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AssetsPage() {
  const assets = [
    { id: '1', name: 'Conference Room A', type: 'ROOM', icon: <Building className="h-5 w-5" />, status: 'AVAILABLE' },
    { id: '2', name: 'Company Vehicle (VW Golf)', type: 'VEHICLE', icon: <Car className="h-5 w-5" />, status: 'RESERVED' },
    { id: '3', name: 'Event PA System', type: 'EQUIPMENT', icon: <Monitor className="h-5 w-5" />, status: 'AVAILABLE' },
  ];

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
        {assets.map((asset) => (
          <Card key={asset.id} className="bg-surface border-border hover:border-primary/50 transition-colors shadow-sm group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">
                {asset.name}
              </CardTitle>
              <div className="text-muted-foreground bg-surface-2 p-2 rounded-full group-hover:text-primary transition-colors">
                {asset.icon}
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
                <Button variant="outline" className="w-full flex items-center justify-center border-border hover:bg-primary/10 hover:text-primary">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
