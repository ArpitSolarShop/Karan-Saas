"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { KanbanSquare, Plus, Search, Layers, Clock, Users, Loader2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: projects, error, isLoading } = useSWR("/projects", fetcher);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <KanbanSquare className="h-8 w-8 text-primary" />
            Project Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Track milestones, operational tasks, and client delivery schedules.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-md relative z-10 mt-6 shadow-sm">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2 w-full max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface border-border focus-visible:ring-primary h-9"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Project Cards */}
            {[
              { title: "CRM Migration - GlobalCorp", status: "ACTIVE", progress: 65, tasks: 12, due: "Next week" },
              { title: "Q3 Marketing Campaign", status: "PLANNING", progress: 10, tasks: 4, due: "In 2 months" },
              { title: "API Integration (Acme)", status: "ACTIVE", progress: 85, tasks: 24, due: "Tomorrow" },
            ].map((p, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-5 hover:border-primary/40 transition-all group flex flex-col cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-widest ${p.status === 'ACTIVE' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-2 text-text-muted border-border'}`}>
                    {p.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="text-xs text-muted-foreground mb-6 flex items-center gap-3">
                  <span className="flex items-center"><Layers className="h-3 w-3 mr-1" /> {p.tasks} Tasks</span>
                  <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {p.due}</span>
                </p>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Progress</span>
                    <span className="text-primary">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${p.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* New Project Outline Card */}
            <div className="rounded-xl border border-dashed border-border bg-transparent p-5 hover:bg-surface/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] text-muted-foreground hover:text-primary">
              <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <p className="font-bold">Start New Project</p>
              <p className="text-xs text-center mt-1 w-3/4">Initialize a blank canvas or use a template</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
