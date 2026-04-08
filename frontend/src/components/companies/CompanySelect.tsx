"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import CompanyModal from "./CompanyModal";

interface CompanySelectProps {
  value?: string;
  onSelect: (companyId: string) => void;
  className?: string;
}

export default function CompanySelect({ value, onSelect, className }: CompanySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: companies, isLoading, mutate } = useSWR(
    search.length >= 2 ? `/companies/search?q=${search}` : "/companies",
    fetcher
  );

  const selectedCompany = companies?.find((c: any) => c.id === value);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-surface-2 border-border text-[10px] font-mono h-9"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 size={12} className="text-primary shrink-0" />
              {selectedCompany ? (
                <span className="truncate font-bold uppercase tracking-tight">{selectedCompany.name}</span>
              ) : (
                <span className="text-muted-foreground uppercase opacity-50">Select Corporate Account...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-popover border-border shadow-2xl z-[300]">
          <Command className="bg-transparent" shouldFilter={false}>
            <CommandInput 
              placeholder="Search companies..." 
              value={search}
              onValueChange={setSearch}
              className="text-[10px] uppercase font-mono h-9"
            />
            <CommandEmpty className="p-4 flex flex-col items-center gap-2">
               <p className="text-[10px] text-muted-foreground uppercase font-black">Account Not Found</p>
               <Button 
                variant="outline" 
                size="sm" 
                className="text-[9px] font-black uppercase tracking-widest h-7"
                onClick={() => {
                  setOpen(false);
                  setIsModalOpen(true);
                }}
               >
                 <Plus size={10} className="mr-1" /> New Entry
               </Button>
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
              {companies?.map((company: any) => (
                <CommandItem
                  key={company.id}
                  value={company.id}
                  onSelect={(id) => {
                    onSelect(id);
                    setOpen(false);
                  }}
                  className="text-[10px] uppercase font-bold py-2 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3 text-primary",
                      value === company.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{company.name}</span>
                    {company.industry && (
                      <span className="text-[8px] text-muted-foreground font-medium">{company.industry}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="p-2 border-t border-border bg-surface-2">
               <Button 
                variant="ghost" 
                className="w-full justify-start text-[9px] font-black uppercase tracking-widest h-8 text-primary hover:bg-primary/5"
                onClick={() => {
                  setOpen(false);
                  setIsModalOpen(true);
                }}
               >
                 <Plus size={12} className="mr-2" /> Quick Register Account
               </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          mutate();
        }}
      />
    </div>
  );
}
