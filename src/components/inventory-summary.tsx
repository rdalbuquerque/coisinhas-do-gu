"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Clothing,
  ClothingType,
  EnxovalKind,
  SizePeriod,
} from "@/lib/types/database";

interface InventorySummaryProps {
  kind: EnxovalKind;
  items: Clothing[];
  clothingTypes: ClothingType[];
  sizePeriods: SizePeriod[];
}

export function InventorySummary({
  kind,
  items,
  clothingTypes,
  sizePeriods,
}: InventorySummaryProps) {
  const [open, setOpen] = useState(false);

  if (kind === "quarto") {
    // Simple type → count list (no size dimension)
    const countByType: Record<string, number> = {};
    for (const item of items) {
      countByType[item.clothing_type_id] = (countByType[item.clothing_type_id] || 0) + 1;
    }
    const usedTypes = clothingTypes.filter((t) => countByType[t.id]);
    if (usedTypes.length === 0) return null;

    return (
      <div className="rounded-2xl border bg-card shadow-soft">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between px-4 py-3 h-auto"
          onClick={() => setOpen(!open)}
        >
          <span className="text-sm font-medium">Resumo do inventário</span>
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {open && (
          <div className="px-4 pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="text-center py-2 pl-2 font-medium text-muted-foreground">
                    Qtd
                  </th>
                </tr>
              </thead>
              <tbody>
                {usedTypes.map((t) => (
                  <tr key={t.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-3 truncate max-w-[200px]">{t.name}</td>
                    <td className="text-center py-2 pl-2 font-semibold">
                      {countByType[t.id]}
                    </td>
                  </tr>
                ))}
                <tr className="border-t font-semibold">
                  <td className="py-2 pr-3">Total</td>
                  <td className="text-center py-2 pl-2">{items.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // roupinhas: type × size matrix
  const counts: Record<string, Record<string, number>> = {};
  for (const item of items) {
    const tid = item.clothing_type_id;
    const sid = item.size_period_id;
    if (!sid) continue;
    if (!counts[tid]) counts[tid] = {};
    counts[tid][sid] = (counts[tid][sid] || 0) + 1;
  }

  // Only show types that have items
  const usedTypes = clothingTypes.filter((t) => counts[t.id]);
  // Only show sizes that have items
  const usedSizes = sizePeriods.filter((s) =>
    usedTypes.some((t) => counts[t.id]?.[s.id])
  );

  if (usedTypes.length === 0) return null;

  // Row totals
  const rowTotal = (tid: string) =>
    usedSizes.reduce((sum, s) => sum + (counts[tid]?.[s.id] || 0), 0);

  // Column totals
  const colTotal = (sid: string) =>
    usedTypes.reduce((sum, t) => sum + (counts[t.id]?.[sid] || 0), 0);

  return (
    <div className="rounded-2xl border bg-card shadow-soft">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between px-4 py-3 h-auto"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium">Resumo do inventário</span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {open && (
        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                  Tipo
                </th>
                {usedSizes.map((s) => (
                  <th
                    key={s.id}
                    className="text-center py-2 px-2 font-medium text-muted-foreground min-w-[40px]"
                  >
                    {s.name}
                  </th>
                ))}
                <th className="text-center py-2 pl-2 font-medium text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {usedTypes.map((t) => (
                <tr key={t.id} className="border-b last:border-b-0">
                  <td className="py-2 pr-3 truncate max-w-[120px]">{t.name}</td>
                  {usedSizes.map((s) => {
                    const c = counts[t.id]?.[s.id] || 0;
                    return (
                      <td
                        key={s.id}
                        className={`text-center py-2 px-2 ${c === 0 ? "text-muted-foreground/40" : ""}`}
                      >
                        {c || "—"}
                      </td>
                    );
                  })}
                  <td className="text-center py-2 pl-2 font-semibold">
                    {rowTotal(t.id)}
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="py-2 pr-3">Total</td>
                {usedSizes.map((s) => (
                  <td key={s.id} className="text-center py-2 px-2">
                    {colTotal(s.id)}
                  </td>
                ))}
                <td className="text-center py-2 pl-2">{items.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
