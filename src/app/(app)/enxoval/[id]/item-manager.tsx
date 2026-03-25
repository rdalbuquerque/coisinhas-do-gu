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
import { ClothingType, SizePeriod } from "@/lib/types/database";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExistingItem {
  id: string;
  clothing_type_id: string;
  size_period_id: string;
  size_name: string;
  target_quantity: number;
}

interface EnxovalItemManagerProps {
  enxovalId: string;
  existingItems: ExistingItem[];
  clothingTypes: ClothingType[];
  sizePeriods: SizePeriod[];
}

export function EnxovalItemManager({
  enxovalId,
  existingItems,
  clothingTypes,
  sizePeriods,
}: EnxovalItemManagerProps) {
  const router = useRouter();
  const [newTypeId, setNewTypeId] = useState("");
  const [newSizeId, setNewSizeId] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [loading, setLoading] = useState<string | null>(null);

  const usedKeys = new Set(
    existingItems.map((i) => `${i.clothing_type_id}-${i.size_period_id}`)
  );

  async function handleAdd() {
    if (!newTypeId || !newSizeId) return;
    const key = `${newTypeId}-${newSizeId}`;
    if (usedKeys.has(key)) {
      toast.error("Esse tipo + tamanho já existe neste enxoval.");
      return;
    }
    setLoading("add");
    try {
      await addEnxovalItem({
        enxoval_id: enxovalId,
        clothing_type_id: newTypeId,
        size_period_id: newSizeId,
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
      <h2 className="text-lg font-semibold">Gerenciar itens</h2>

      {existingItems.map((item) => {
        const type = clothingTypes.find((t) => t.id === item.clothing_type_id);
        return (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-2 p-3">
              <span className="flex-1 text-sm">{type?.name}</span>
              <Badge variant="outline" className="shrink-0">
                {item.size_name}
              </Badge>
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
      })}

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
            disabled={!newTypeId || !newSizeId || loading === "add"}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
