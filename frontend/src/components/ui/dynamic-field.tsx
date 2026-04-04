import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CustomField {
  id: string;
  name: string;
  label: string;
  fieldType: "TEXT" | "TEXTAREA" | "NUMBER" | "BOOLEAN" | "SELECT" | "DATE";
  options?: any;
  isRequired?: boolean;
}

interface DynamicFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicFieldRenderer({ field, value, onChange }: DynamicFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  switch (field.fieldType) {
    case "TEXT":
    case "NUMBER":
    case "DATE":
      return (
        <div className="space-y-1.5 flex flex-col">
          <label className="text-sm font-medium text-foreground">
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <Input
            type={field.fieldType === "NUMBER" ? "number" : field.fieldType === "DATE" ? "date" : "text"}
            value={value || ""}
            onChange={handleChange}
            required={field.isRequired}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        </div>
      );
    case "TEXTAREA":
      return (
        <div className="space-y-1.5 flex flex-col">
          <label className="text-sm font-medium text-foreground">
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <Textarea
            value={value || ""}
            onChange={handleChange}
            required={field.isRequired}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        </div>
      );
    case "BOOLEAN":
      return (
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 border-border">
          <label className="text-sm font-medium text-foreground">
            {field.label}
          </label>
          <Switch
            checked={Boolean(value)}
            onCheckedChange={onChange}
          />
        </div>
      );
    case "SELECT":
      const optionsArray = Array.isArray(field.options) ? field.options : [];
      return (
        <div className="space-y-1.5 flex flex-col">
          <label className="text-sm font-medium text-foreground">
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <Select value={value?.toString() || ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {optionsArray.map((opt: any, idx: number) => (
                <SelectItem key={idx} value={opt?.value || opt}>
                  {opt?.label || opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    default:
      return null;
  }
}
