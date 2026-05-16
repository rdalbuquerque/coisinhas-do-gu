"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClothingType, EnxovalKind, SizePeriod } from "@/lib/types/database";
import { CLOTHING_COLORS, SEASONS } from "@/lib/constants";
import { ColorSwatch } from "@/components/color-chip";

interface FilterBarProps {
  kind: EnxovalKind;
  clothingTypes: ClothingType[];
  sizePeriods: SizePeriod[];
}

export function FilterBar({ kind, clothingTypes, sizePeriods }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/inventario?${params.toString()}`);
  }

  const isQuarto = kind === "quarto";

  return (
    <div className="flex gap-2 flex-wrap">
      <Select
        value={searchParams.get("tipo") || "all"}
        onValueChange={(v) => setFilter("tipo", v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {clothingTypes.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!isQuarto && (
        <>
          <Select
            value={searchParams.get("tamanho") || "all"}
            onValueChange={(v) => setFilter("tamanho", v)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tamanho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {sizePeriods.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("estacao") || "all"}
            onValueChange={(v) => setFilter("estacao", v)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Estação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {SEASONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("cor") || "all"}
            onValueChange={(v) => setFilter("cor", v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Cor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cores</SelectItem>
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
        </>
      )}
    </div>
  );
}
