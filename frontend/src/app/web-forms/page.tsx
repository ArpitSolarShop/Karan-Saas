"use client";

import { Code, FormInput, Copy, MousePointerClick, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function WebFormsPage() {
  const forms = [
    { id: '1', name: 'Homepage Newsletter Signup', fields: 2, views: 1042, conversions: 89 },
    { id: '2', name: 'Pricing Page Demo Request', fields: 5, views: 300, conversions: 12 },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FormInput className="h-8 w-8 text-primary" />
            Web Forms Builder
          </h2>
          <p className="text-muted-foreground mt-1">
            Build lead capture forms and embed them on any external CMS (WordPress, Shopify).
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
          <MousePointerClick className="mr-2 h-4 w-4" /> Create Form
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-4">
          {forms.map(form => (
            <Card key={form.id} className="bg-surface border-border flex items-center p-4 group cursor-pointer hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded bg-surface-2 flex items-center justify-center mr-4 group-hover:text-primary transition-colors">
                <Layout className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{form.name}</h3>
                <div className="text-sm text-muted-foreground">{form.fields} mapped fields</div>
              </div>
              <div className="text-right mr-6">
                <div className="font-bold">{form.conversions}</div>
                <div className="text-xs text-muted-foreground">Leads Generated</div>
              </div>
              <Button variant="outline"><Code className="h-4 w-4 mr-2" /> Embed</Button>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-surface-2 border-primary/20 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Code className="h-24 w-24" />
             </div>
             <CardHeader>
               <CardTitle className="text-primary flex items-center gap-2"><Code className="h-5 w-5" /> Embed Script</CardTitle>
               <CardDescription>Copy this into your external website's HTML body to render the dynamic form and push leads directly into CRM.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4 relative z-10">
                <div className="p-3 bg-black/80 rounded-md whitespace-pre-wrap font-mono text-xs text-emerald-400 border border-border">
{`<script src="https://crm.karansaas.com/api/forms/embed.js"></script>
<div class="karan-crm-form" data-form-id="uuid-of-form"></div>`}
                </div>
                <Button className="w-full" variant="outline"><Copy className="h-4 w-4 mr-2" /> Copy to Clipboard</Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
