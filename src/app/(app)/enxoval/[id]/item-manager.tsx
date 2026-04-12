"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  addEnxovalItem,
  removeEnxovalItem,
  updateEnxovalItem,
} from "@/app/actions/enxovais";
import { ClothingType, EnxovalKind, SizePeriod } from "@/lib/types/database";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ExistingItem {
  id: string;
  clothing_type_id: string;
  size_period_id: string | null;
  size_name: string;
  target_quantity: number;
}

interface EnxovalItemManagerProps {
  kind: EnxovalKind;
  enxovalId: string;
  existingItems: ExistingItem[];
  clothingTypes: ClothingType[];
  sizePeriods: SizePeriod[];
}

function keyFor(type_id: string, size_id: string | null): string {
  return `${type_id}-${size_id ?? "none"}`;
}

export function EnxovalItemManager({
  kind,
  enxovalId,
  existingItems,
  clothingTypes,
  sizePeriods,
}: EnxovalItemManagerProps) {
  const router = useRouter();
  const isQuarto = kind === "quarto";
  const [newTypeId, setNewTypeId] = useState("");
  const [newSizeId, setNewSizeId] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  const usedKeys = new Set(
    existingItems.map((i) => keyFor(i.clothing_type_id, i.size_period_id))
  );

  // Extract unique sizes and types from existing items
  const presentSizeIds = new Set(
    existingItems.map((i) => i.size_period_id).filter((x): x is string => !!x)
  );
  const presentTypeIds = new Set(existingItems.map((i) => i.clothing_type_id));
  const presentSizes = sizePeriods.filter((s) => presentSizeIds.has(s.id));
  const presentTypes = clothingTypes.filter((t) => presentTypeIds.has(t.id));

  const filtered = existingItems.filter((item) => {
    if (!isQuarto && selectedSizes.size > 0) {
      if (!item.size_period_id || !selectedSizes.has(item.size_period_id)) return false;
    }
    if (selectedTypes.size > 0 && !selectedTypes.has(item.clothing_type_id)) return false;
    return true;
  });

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

  async function handleAdd() {
    if (!newTypeId) return;
    if (!isQuarto && !newSizeId) return;
    const sizeForKey = isQuarto ? null : newSizeId;
    const key = keyFor(newTypeId, sizeForKey);
    if (usedKeys.has(key)) {
      toast.error(
        isQuarto
          ? "Esse tipo já existe neste enxoval."
          : "Esse tipo + tamanho já existe neste enxoval."
      );
      return;
    }
    setLoading("add");
    try {
      await addEnxovalItem({
        enxoval_id: enxovalId,
        clothing_type_id: newTypeId,
        size_period_id: sizeForKey,
        target_quantity: newQty,
      });
      toast.success("Item adicionado!");
      setNewTypeId("");
      setNewSizeId("");
      setNewQty(1);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar.");
    }
    setLoading(null);
  }

  async function handleUpdateQty(id: string, qty: number) {
    if (qty < 1) return;
    setLoading(id);
    try {
      await updateEnxovalItem(id, qty);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
    }
    setLoading(null);
  }

  async function handleRemove(id: string) {
    setLoading(id);
    try {
      await removeEnxovalItem(id);
      toast.success("Item removido!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover.");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {!isQuarto && (
          <div className="flex flex-wrap gap-1.5">
            {presentSizes.map((s) => (
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
        )}
        <div className="flex flex-wrap gap-1.5">
          {presentTypes.map((t) => (
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
        filtered.map((item) => {
          const type = clothingTypes.find((t) => t.id === item.clothing_type_id);
          return (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-2 p-3">
                <span className="flex-1 text-sm">{type?.name}</span>
                {!isQuarto && item.size_name && (
                  <Badge variant="outline" className="shrink-0">
                    {item.size_name}
                  </Badge>
                )}
                <Input
                  type="number"
                  min={1}
                  defaultValue={item.target_quantity}
                  className="w-20"
                  onBlur={(e) =>
                    handleUpdateQty(item.id, Number(e.target.value))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(item.id)}
                  disabled={loading === item.id}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          );
        })
      )}

      <Card>
        <CardContent className="flex items-center gap-2 p-3">
          <Select value={newTypeId} onValueChange={setNewTypeId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tipo..." />
            </SelectTrigger>
            <SelectContent>
              {clothingTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isQuarto && (
            <Select value={newSizeId} onValueChange={setNewSizeId}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Tam." />
              </SelectTrigger>
              <SelectContent>
                {sizePeriods.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            type="number"
            min={1}
            value={newQty}
            onChange={(e) => setNewQty(Number(e.target.value))}
            className="w-20"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleAdd}
            disabled={!newTypeId || (!isQuarto && !newSizeId) || loading === "add"}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
