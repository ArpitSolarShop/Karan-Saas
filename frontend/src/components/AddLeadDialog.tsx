"use client";

import { useState } from "react";
import api from "@/lib/api";

interface AddLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  columns: any[];
  sheetId: string;
}

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function AddLeadDialog({ isOpen, onClose, onSuccess, columns, sheetId }: AddLeadDialogProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [extraFields, setExtraFields] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/sheets/${sheetId}/rows`, formData);
      setFormData({});
      setExtraFields([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExtraField = () => {
    if (!newFieldName.trim()) return;
    const key = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!extraFields.includes(key) && !columns.some(c => c.key === key)) {
      setExtraFields([...extraFields, key]);
      setFormData({ ...formData, [key]: "" });
    }
    setNewFieldName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-surface border-border text-foreground p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 bg-surface-2 border-b border-border">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">Register New Lead</DialogTitle>
          <DialogDescription className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
            Dynamic Schema Enabled // Sheet: {sheetId}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {columns.filter(col => col.dataType !== 'FORMULA').map((col) => (
                <div key={col.id} className="space-y-2">
                  <Label htmlFor={col.key} className="text-[10px] font-black uppercase tracking-widest text-text-muted">{col.name}</Label>
                  <Input
                    id={col.key}
                    type={col.dataType === 'NUMBER' ? 'number' : 'text'}
                    required
                    placeholder={`Enter ${col.name.toLowerCase()}...`}
                    value={formData[col.key] || ""}
                    onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                    className="bg-surface-2 border-border focus:ring-primary text-foreground"
                  />
                </div>
              ))}
              
              {extraFields.map((field) => (
                <div key={field} className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-success">{field.replace(/_/g, ' ')} (NEW FIELD)</Label>
                  <Input
                    placeholder={`Enter value for ${field}...`}
                    value={formData[field] || ""}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="bg-surface-2 border-success/20 border-success/40 focus:ring-success text-foreground"
                  />
                </div>
              ))}
            </div>

            <Separator className="bg-border" />

            <div className="p-4 border border-dashed border-border bg-surface-2 rounded-lg">
               <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Add Dynamic Field on the Fly</p>
               <div className="flex gap-2">
                  <Input 
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Field label..."
                    className="flex-1 bg-surface border-border text-[10px]"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleAddExtraField}
                    className="border-primary text-primary hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest h-9"
                  >
                    Add Field
                  </Button>
               </div>
            </div>
            
            <div className="bg-surface-2 p-4 border border-border rounded-lg">
               <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-1">Quantum Schema Notice</p>
               <p className="text-[11px] font-medium leading-relaxed italic text-text-muted">
                 New fields added here will automatically expand the database schema. Hybrid JSONB ensures 100% data integrity.
               </p>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="p-6 bg-surface-2 border-t border-border flex justify-end space-x-4">
          <Button 
            variant="ghost"
            onClick={onClose}
            className="text-text-muted hover:text-foreground hover:bg-surface-2"
          >
            Abort
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-dark text-white px-8"
          >
            {isSubmitting ? "Processing..." : "Commit Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
