"use client";

import { useState, useCallback } from "react";
import { MapPin, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeAccents } from "@/lib/normalize";
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

interface CityComboboxProps {
  cities: string[];
  value: string;
  onSelect: (city: string) => void;
  disabled?: boolean;
}

export function CityCombobox({ cities, value, onSelect, disabled }: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = useCallback(
    (city: string) => {
      onSelect(city);
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
      // Try startsWith first, then includes
      const match =
        cities.find((c) => normalizeAccents(c).startsWith(norm)) ||
        cities.find((c) => normalizeAccents(c).includes(norm));

      if (match) {
        handleSelect(match);
      }
    },
    [search, cities, handleSelect],
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
          disabled={disabled}
          className="w-full justify-between text-left font-normal h-11"
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            {value || "Onde você quer morar?"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command filter={filter}>
          <CommandInput
            placeholder="Buscar cidade..."
            value={search}
            onValueChange={setSearch}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>Não temos imóvel nessa localidade</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem key={city} value={city} onSelect={() => handleSelect(city)}>
                  <Check className={cn("mr-2 h-4 w-4", value === city ? "opacity-100" : "opacity-0")} />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
