"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChipData {
  key: string;
  label: string;
}

interface ActiveFilterChipsProps {
  chips: ChipData[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({ chips, onRemove, onClearAll }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="gap-1 pr-1 cursor-pointer"
          onClick={() => onRemove(chip.key)}
        >
          {chip.label}
          <X className="h-3 w-3" />
        </Badge>
      ))}
      {chips.length > 1 && (
        <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={onClearAll}>
          Limpar tudo
        </Button>
      )}
    </div>
  );
}
