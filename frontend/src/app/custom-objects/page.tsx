"use client";

import { Database, Plus, Settings2, Code2, Copy, Trash2, Edit3, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CustomObjectsPage() {
  const schemas = [
    { id: '1', name: 'Real Estate Properties', recordCount: 142, fields: 5, status: 'ACTIVE' },
    { id: '2', name: 'Support SLA Thresholds', recordCount: 12, fields: 3, status: 'ACTIVE' },
    { id: '3', name: 'Vehicle Logs', recordCount: 0, fields: 8, status: 'DRAFT' },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Custom Data Builder
          </h2>
          <p className="text-muted-foreground mt-1">
            Build Low-Code Postgres JSONB-backed data objects without modifying SQL schemas.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
          <Plus className="mr-2 h-4 w-4" /> Create Schema
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {schemas.map((schema) => (
          <Card key={schema.id} className="bg-surface border-border hover:border-primary/30 transition-all shadow-sm group relative overflow-hidden flex flex-col h-full">
            <div className={`absolute top-0 left-0 w-1 h-full ${schema.status === 'ACTIVE' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            <CardHeader className="pl-6 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">
                  {schema.name}
                </CardTitle>
                <Badge variant={schema.status === 'ACTIVE' ? 'default' : 'secondary'} className={schema.status === 'ACTIVE' ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                  {schema.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-4 pt-2">
                <span className="flex items-center gap-1 font-mono text-xs">
                  <LayoutTemplate className="h-3 w-3" /> {schema.fields} fields
                </span>
                <span className="flex items-center gap-1 font-mono text-xs">
                  <Database className="h-3 w-3" /> {schema.recordCount} rows
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-6 flex-1 flex flex-col justify-end">
              <div className="flex items-center justify-end gap-2 mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-8 hover:bg-primary/10 hover:text-primary">
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                  <Code2 className="h-3.5 w-3.5 mr-1.5" /> API
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Empty Slot for "Add New" visually aligned in grid */}
        <Card className="bg-transparent border-dashed border-2 border-border hover:border-primary/50 transition-colors shadow-none flex items-center justify-center cursor-pointer opacity-50 hover:opacity-100 min-h-[160px]">
           <div className="text-center flex flex-col items-center">
             <div className="h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center mb-2 text-muted-foreground">
                <Plus className="h-5 w-5" />
             </div>
             <span className="text-sm font-semibold text-muted-foreground">Blank Template</span>
           </div>
        </Card>
      </div>
    </div>
  );
}
