"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EnxovalProgress } from "@/components/enxoval-progress";
import { cn } from "@/lib/utils";

interface ItemData {
  id: string;
  clothing_type_id: string;
  size_period_id: string;
  target_quantity: number;
  type_name: string;
  size_name: string;
  current: number;
}

interface EnxovalItemsListProps {
  items: ItemData[];
  sizes: { id: string; name: string }[];
  types: { id: string; name: string }[];
}

export function EnxovalItemsList({ items, sizes, types }: EnxovalItemsListProps) {
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  function toggleSize(id: string) {
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleType(id: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = items.filter((item) => {
    if (selectedSizes.size > 0 && !selectedSizes.has(item.size_period_id)) return false;
    if (selectedTypes.size > 0 && !selectedTypes.has(item.clothing_type_id)) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <Badge
              key={s.id}
              variant={selectedSizes.has(s.id) ? "default" : "outline"}
              className={cn("cursor-pointer transition-colors")}
              onClick={() => toggleSize(s.id)}
            >
              {s.name}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <Badge
              key={t.id}
              variant={selectedTypes.has(t.id) ? "default" : "outline"}
              className={cn("cursor-pointer transition-colors text-xs")}
              onClick={() => toggleType(t.id)}
            >
              {t.name}
            </Badge>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum item encontrado.</p>
      ) : (
        filtered.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="flex-1">
              <EnxovalProgress
                label={item.type_name}
                current={item.current}
                target={item.target_quantity}
              />
            </div>
            <Badge variant="outline" className="shrink-0">
              {item.size_name}
            </Badge>
          </div>
        ))
      )}
    </div>
  );
}
