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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { createEnxoval } from "@/app/actions/enxovais";
import { ensureClothingTypes } from "@/app/actions/clothing-types";
import { ClothingType, SizePeriod } from "@/lib/types/database";
import { SUGGESTED_ENXOVAIS, SuggestedEnxoval } from "@/lib/suggested-enxovais";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Sparkles, ArrowLeft, Snowflake, Sun, CloudSun } from "lucide-react";

interface ItemRow {
  clothing_type_id: string;
  target_quantity: number;
}

type Step = "choose" | "form";

const SEASON_ICON: Record<string, React.ReactNode> = {
  inverno: <Snowflake className="h-5 w-5" />,
  verao: <Sun className="h-5 w-5" />,
  "meia-estacao": <CloudSun className="h-5 w-5" />,
};

const SEASON_COLOR: Record<string, string> = {
  inverno: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  verao: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
  "meia-estacao": "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800",
};

export default function NovoEnxovalPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [name, setName] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([]);
  const [sizePeriods, setSizePeriods] = useState<SizePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SuggestedEnxoval | null>(null);

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

  function startFromScratch() {
    setSelectedTemplate(null);
    setName("");
    setItems([]);
    setStep("form");
  }

  async function applyTemplate(template: SuggestedEnxoval) {
    setLoading(true);
    try {
      const typeNames = template.items.map((i) => i.clothing_type_name);
      const resolvedTypes = await ensureClothingTypes(typeNames);

      const typeMap = new Map(
        resolvedTypes.map((t) => [t.name.toLowerCase(), t.id])
      );

      // Refresh clothing types list after possible creation
      const supabase = createClient();
      const { data: freshTypes } = await supabase
        .from("clothing_types")
        .select("*")
        .order("name");
      if (freshTypes) setClothingTypes(freshTypes);

      const newItems: ItemRow[] = template.items
        .map((i) => ({
          clothing_type_id: typeMap.get(i.clothing_type_name.toLowerCase()) || "",
          target_quantity: i.target_quantity,
        }))
        .filter((i) => i.clothing_type_id);

      setSelectedTemplate(template);
      setName(template.name);
      setItems(newItems);
      setStep("form");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aplicar sugestão.");
    }
    setLoading(false);
  }

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

  if (step === "choose") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Novo enxoval</h1>

        <div className="space-y-3">
          <Label className="text-base">Começar com uma sugestão</Label>
          <p className="text-sm text-muted-foreground">
            Escolha um enxoval sugerido baseado na estação do nascimento. Você pode personalizar tudo depois.
          </p>

          <div className="space-y-3">
            {SUGGESTED_ENXOVAIS.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer border-2 transition-all hover:shadow-md ${SEASON_COLOR[template.season]}`}
                onClick={() => applyTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {SEASON_ICON[template.season]}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {template.items.map((item) => (
                      <Badge key={item.clothing_type_name} variant="secondary" className="text-xs">
                        {item.clothing_type_name} ({item.target_quantity})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={startFromScratch}>
          <Plus className="mr-2 h-4 w-4" />
          Criar do zero
        </Button>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Preparando sugestão...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setStep("choose")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {selectedTemplate ? "Personalizar enxoval" : "Novo enxoval"}
        </h1>
      </div>

      {selectedTemplate && (
        <div className={`rounded-lg border-2 p-3 flex items-center gap-2 ${SEASON_COLOR[selectedTemplate.season]}`}>
          <Sparkles className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            Baseado na sugestão <strong>{selectedTemplate.name}</strong>. Ajuste como quiser antes de criar.
          </p>
        </div>
      )}

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
