"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Video, Phone, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Basic date math to simulate calendar month fetch
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  const { data: events, error, isLoading } = useSWR("/calendar", fetcher);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] opacity-70 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Agenda & Calendar
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your scheduled meetings, follow-up calls, and internal events.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="mr-2 h-4 w-4" /> New Event
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-md relative z-10 mt-6 shadow-sm">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-foreground w-48">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-surface-2 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 text-xs font-semibold hover:bg-surface-2 transition-colors">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-surface-2 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex bg-surface p-1 rounded-md border border-border mt-3 sm:mt-0">
            <Button variant="ghost" size="sm" className="h-7 text-xs bg-surface-2 shadow-sm font-semibold">Month</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">Week</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">Day</Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border bg-surface/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-bold text-muted-foreground tracking-wider uppercase">
                {day}
              </div>
            ))}
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7 auto-rows-fr min-h-[600px] border-l border-border">
              {/* Empty leading cells */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[120px] p-2 border-r border-b border-border/50 bg-surface/30" />
              ))}
              
              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const daynum = i + 1;
                const isToday = 
                  currentDate.getMonth() === new Date().getMonth() && 
                  currentDate.getFullYear() === new Date().getFullYear() && 
                  daynum === new Date().getDate();

                // Mock finding events for this day
                const dayEvents = events?.filter((e: any) => {
                  const evDate = new Date(e.startDatetime);
                  return evDate.getDate() === daynum && evDate.getMonth() === currentDate.getMonth();
                }) || [];

                return (
                  <div key={`day-${daynum}`} className={`min-h-[120px] p-2 border-r border-b border-border/50 hover:bg-surface-2/20 transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}>
                        {daynum}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5">
                      {dayEvents.map((evt: any) => (
                        <div key={evt.id} className="text-xs px-2 py-1 rounded bg-secondary/30 text-secondary-foreground border border-secondary border-l-2 shadow-sm font-medium flex items-center gap-1.5 truncate">
                          {evt.eventType === 'MEETING' ? <Video className="h-3 w-3 opacity-70" /> : <Phone className="h-3 w-3 opacity-70" />}
                          <span className="truncate">{evt.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Empty trailing cells to complete the grid */}
              {Array.from({ length: (42 - (startDay + daysInMonth)) % 7 }).map((_, i) => (
                <div key={`empty-end-${i}`} className="min-h-[120px] p-2 border-r border-b border-border/50 bg-surface/30" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
