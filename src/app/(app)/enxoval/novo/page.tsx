"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { createEnxoval } from "@/app/actions/enxovais";
import { ClothingType, SizePeriod } from "@/lib/types/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface ItemRow {
  clothing_type_id: string;
  target_quantity: number;
}

export default function NovoEnxovalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([]);
  const [sizePeriods, setSizePeriods] = useState<SizePeriod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("clothing_types").select("*").order("name"),
      supabase.from("size_periods").select("*").order("display_order"),
    ]).then(([types, sizes]) => {
      setClothingTypes(types.data || []);
      setSizePeriods(sizes.data || []);
    });
  }, []);

  function addItem() {
    setItems([...items, { clothing_type_id: "", target_quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ItemRow, value: string | number) {
    const updated = [...items];
    if (field === "target_quantity") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value as string;
    }
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !sizeId) {
      toast.error("Preencha o nome e o tamanho.");
      return;
    }

    const validItems = items.filter(
      (i) => i.clothing_type_id && i.target_quantity > 0
    );

    setLoading(true);
    try {
      await createEnxoval({
        name: name.trim(),
        size_period_id: sizeId,
        items: validItems,
      });
      toast.success("Enxoval criado!");
      router.push("/enxoval");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Novo enxoval</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input
            placeholder="Ex: Enxoval verão RN"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Tamanho</Label>
          <Select value={sizeId} onValueChange={setSizeId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tamanho" />
            </SelectTrigger>
            <SelectContent>
              {sizePeriods.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Itens do enxoval</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum item adicionado. Clique em &quot;Adicionar&quot; para começar.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center gap-2 p-3">
                    <Select
                      value={item.clothing_type_id}
                      onValueChange={(v) =>
                        updateItem(index, "clothing_type_id", v)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {clothingTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={item.target_quantity}
                      onChange={(e) =>
                        updateItem(index, "target_quantity", e.target.value)
                      }
                      className="w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar enxoval"
          )}
        </Button>
      </form>
    </div>
  );
}
