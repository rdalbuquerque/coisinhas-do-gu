"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClothingType, SizePeriod } from "@/lib/types/database";
import { SEASONS } from "@/lib/constants";

interface FilterBarProps {
  clothingTypes: ClothingType[];
  sizePeriods: SizePeriod[];
}

export function FilterBar({ clothingTypes, sizePeriods }: FilterBarProps) {
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
    </div>
  );
}
