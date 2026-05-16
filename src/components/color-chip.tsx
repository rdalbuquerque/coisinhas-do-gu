"use client";

import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CLOTHING_COLORS,
  CLOTHING_COLOR_LABELS,
  CLOTHING_COLOR_SWATCHES,
} from "@/lib/constants";
import type { ClothingColor } from "@/lib/types/database";

export type ColorStatus = "idle" | "detecting" | "ready" | "error";

interface ColorChipProps {
  value: ClothingColor | null;
  status: ColorStatus;
  onChange: (value: ClothingColor | null) => void;
}

export function ColorSwatch({
  color,
  size = 14,
}: {
  color: ClothingColor;
  size?: number;
}) {
  const swatch = CLOTHING_COLOR_SWATCHES[color];
  const isEstampado = swatch === "estampado";
  const isBranco = color === "branco";
  return (
    <span
      aria-hidden="true"
      className="inline-block rounded-full border"
      style={{
        width: size,
        height: size,
        background: isEstampado
          ? "conic-gradient(#f472b6, #fbbf24, #22c55e, #3b82f6, #a855f7, #f472b6)"
          : swatch,
        borderColor: isBranco ? "#d1d5db" : "rgba(0,0,0,0.1)",
      }}
    />
  );
}

export function ColorChip({ value, status, onChange }: ColorChipProps) {
  if (status === "detecting") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Detectando cor...
      </div>
    );
  }

  return (
    <Select
      value={value ?? ""}
      onValueChange={(v) => onChange((v || null) as ClothingColor | null)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione a cor">
          {value ? (
            <span className="inline-flex items-center gap-2">
              <ColorSwatch color={value} />
              {CLOTHING_COLOR_LABELS[value]}
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CLOTHING_COLORS.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            <span className="inline-flex items-center gap-2">
              <ColorSwatch color={c.value} />
              {c.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
