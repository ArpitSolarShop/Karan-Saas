import { Layers, Phone, FileText, CheckCircle, Mail, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  type: "CALL" | "EMAIL" | "NOTE" | "SYSTEM" | "STATUS_CHANGE" | "DOCUMENT";
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
}

const EVENT_ICONS = {
  CALL: <Phone className="h-4 w-4 text-primary" />,
  EMAIL: <Mail className="h-4 w-4 text-blue-500" />,
  NOTE: <FileText className="h-4 w-4 text-amber-500" />,
  SYSTEM: <AlertTriangle className="h-4 w-4 text-red-500" />,
  STATUS_CHANGE: <CheckCircle className="h-4 w-4 text-success" />,
  DOCUMENT: <Layers className="h-4 w-4 text-purple-500" />
};

export function UnifiedTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-text-muted italic border-2 border-dashed border-border rounded-lg bg-surface">
        No activities recorded yet.
      </div>
    );
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {events.map((event) => (
        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Timeline Node */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-background bg-surface-2 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 group-hover:bg-surface transition-colors">
            {EVENT_ICONS[event.type] || <CheckCircle className="h-4 w-4 text-text-muted" />}
          </div>
          
          {/* Content Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-surface shadow-sm hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-sm text-foreground">{event.title}</div>
              <time className="text-[10px] uppercase font-black tracking-widest text-text-muted">{event.timestamp}</time>
            </div>
            {event.description && (
               <div className="text-xs text-muted-foreground mt-2 border-l-2 border-primary/20 pl-3 py-1 bg-primary/[0.02]">
                 {event.description}
               </div>
            )}
            {event.user && (
              <div className="text-[10px] font-bold text-primary mt-3 uppercase tracking-widest">
                By {event.user}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
