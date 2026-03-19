"use client";

import { useState, useCallback, useMemo } from "react";
import { MapPin, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeAccents } from "@/lib/normalize";
import { useAllProperties } from "@/hooks/use-all-properties";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface BairroComboboxProps {
  city: string;
  value: string;
  onSelect: (bairro: string) => void;
  disabled?: boolean;
}

export function BairroCombobox({ city, value, onSelect, disabled }: BairroComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { properties } = useAllProperties();

  const bairros = useMemo(() => {
    const set = new Set<string>();
    for (const p of properties) {
      if (p.endereco.bairro && (!city || p.endereco.cidade === city)) {
        set.add(p.endereco.bairro);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [properties, city]);

  const handleSelect = useCallback(
    (bairro: string) => {
      onSelect(bairro);
      setSearch("");
      setOpen(false);
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!search.trim()) return;

      const norm = normalizeAccents(search);
      const match =
        bairros.find((b) => normalizeAccents(b).startsWith(norm)) ||
        bairros.find((b) => normalizeAccents(b).includes(norm));

      if (match) {
        handleSelect(match);
      }
    },
    [search, bairros, handleSelect],
  );

  const filter = useCallback((value: string, search: string) => {
    const normValue = normalizeAccents(value);
    const normSearch = normalizeAccents(search);
    if (normValue.includes(normSearch)) return 1;
    return 0;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || bairros.length === 0}
          className="w-full justify-between text-left font-normal h-10"
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            {value || "Todos os bairros"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command filter={filter}>
          <CommandInput
            placeholder="Buscar bairro..."
            value={search}
            onValueChange={setSearch}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>Nenhum bairro encontrado</CommandEmpty>
            <CommandGroup>
              {bairros.map((bairro) => (
                <CommandItem key={bairro} value={bairro} onSelect={() => handleSelect(bairro)}>
                  <Check className={cn("mr-2 h-4 w-4", value === bairro ? "opacity-100" : "opacity-0")} />
                  {bairro}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
