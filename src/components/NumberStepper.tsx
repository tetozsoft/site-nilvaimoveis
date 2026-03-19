"use client";

import { Minus, Plus } from "lucide-react";

interface NumberStepperProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  onChange: (n: number) => void;
}

export function NumberStepper({ value, min = 1, max = 10, label, onChange }: NumberStepperProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="h-8 w-8 rounded-md border border-input bg-background inline-flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-10 text-center text-sm font-medium">
          {value}+
        </span>
        <button
          type="button"
          className="h-8 w-8 rounded-md border border-input bg-background inline-flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
