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
import {
  SUGGESTED_ENXOVAIS,
  SuggestedEnxoval,
  getQuantityForSize,
} from "@/lib/suggested-enxovais";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  ArrowLeft,
  Snowflake,
  Sun,
  CloudSun,
} from "lucide-react";

interface ReviewItem {
  clothing_type_id: string;
  clothing_type_name: string;
  size_period_id: string;
  size_name: string;
  target_quantity: number;
}

type Step = "choose" | "review";

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
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([]);
  const [sizePeriods, setSizePeriods] = useState<SizePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SuggestedEnxoval | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

  // New item form
  const [newTypeId, setNewTypeId] = useState("");
  const [newSizeId, setNewSizeId] = useState("");
  const [newQty, setNewQty] = useState(1);

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

  async function selectTemplate(template: SuggestedEnxoval) {
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

      const { data: sizes } = await supabase
        .from("size_periods")
        .select("*")
        .order("display_order");
      const allSizes = sizes || sizePeriods;
      if (sizes) setSizePeriods(sizes);

      // Expand template: every item × every size
      const items: ReviewItem[] = [];
      for (const templateItem of template.items) {
        const typeId = typeMap.get(templateItem.clothing_type_name.toLowerCase());
        if (!typeId) continue;

        for (const size of allSizes) {
          const qty = getQuantityForSize(templateItem, size.name);
          if (qty > 0) {
            items.push({
              clothing_type_id: typeId,
              clothing_type_name: templateItem.clothing_type_name,
              size_period_id: size.id,
              size_name: size.name,
              target_quantity: qty,
            });
          }
        }
      }

      setSelectedTemplate(template);
      setName(template.name);
      setReviewItems(items);
      setStep("review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aplicar sugestão.");
    }
    setLoading(false);
  }

  function updateReviewItem(index: number, qty: number) {
    if (qty < 1) return;
    setReviewItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], target_quantity: qty };
      return updated;
    });
  }

  function removeReviewItem(index: number) {
    setReviewItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addReviewItem() {
    if (!newTypeId || !newSizeId) return;

    const exists = reviewItems.some(
      (i) => i.clothing_type_id === newTypeId && i.size_period_id === newSizeId
    );
    if (exists) {
      toast.error("Esse tipo + tamanho já existe na lista.");
      return;
    }

    const type = clothingTypes.find((t) => t.id === newTypeId);
    const size = sizePeriods.find((s) => s.id === newSizeId);
    if (!type || !size) return;

    setReviewItems((prev) => [
      ...prev,
      {
        clothing_type_id: newTypeId,
        clothing_type_name: type.name,
        size_period_id: newSizeId,
        size_name: size.name,
        target_quantity: newQty,
      },
    ]);
    setNewTypeId("");
    setNewSizeId("");
    setNewQty(1);
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Preencha o nome do enxoval.");
      return;
    }
    if (reviewItems.length === 0) {
      toast.error("Adicione pelo menos um item.");
      return;
    }

    setLoading(true);
    try {
      await createEnxoval({
        name: name.trim(),
        items: reviewItems.map((i) => ({
          clothing_type_id: i.clothing_type_id,
          size_period_id: i.size_period_id,
          target_quantity: i.target_quantity,
        })),
      });
      toast.success("Enxoval criado!");
      router.push("/enxoval");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar.");
    }
    setLoading(false);
  }

  // Group review items by size for display
  const groupedBySize = sizePeriods
    .map((size) => ({
      size,
      items: reviewItems
        .map((item, index) => ({ ...item, index }))
        .filter((item) => item.size_period_id === size.id),
    }))
    .filter((group) => group.items.length > 0);

  // Step 1: Choose template
  if (step === "choose") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Novo enxoval</h1>

        <p className="text-sm text-muted-foreground">
          Escolha um enxoval sugerido baseado na estação do nascimento. Você pode personalizar tudo antes de criar.
        </p>

        <div className="space-y-3">
          {SUGGESTED_ENXOVAIS.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer border-2 transition-all hover:shadow-md ${SEASON_COLOR[template.season]}`}
              onClick={() => selectTemplate(template)}
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
                      {item.clothing_type_name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Preparando sugestão...</span>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Review and edit items
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setStep("choose")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Personalizar enxoval</h1>
      </div>

      {selectedTemplate && (
        <div className={`rounded-lg border-2 p-3 flex items-center gap-2 ${SEASON_COLOR[selectedTemplate.season]}`}>
          <Sparkles className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            Baseado na sugestão <strong>{selectedTemplate.name}</strong>. Ajuste como quiser antes de criar.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Nome do enxoval</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Enxoval de Inverno"
        />
      </div>

      <div className="space-y-4">
        {groupedBySize.map(({ size, items }) => (
          <div key={size.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {size.name}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </span>
            </div>
            {items.map((item) => (
              <Card key={item.index}>
                <CardContent className="flex items-center gap-2 p-3">
                  <span className="flex-1 text-sm">{item.clothing_type_name}</span>
                  <Input
                    type="number"
                    min={1}
                    value={item.target_quantity}
                    onChange={(e) =>
                      updateReviewItem(item.index, Number(e.target.value))
                    }
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeReviewItem(item.index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>

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
            type="button"
            variant="outline"
            size="icon"
            onClick={addReviewItem}
            disabled={!newTypeId || !newSizeId}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        disabled={reviewItems.length === 0 || loading}
        onClick={handleCreate}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando...
          </>
        ) : (
          `Criar enxoval (${reviewItems.length} itens)`
        )}
      </Button>
    </div>
  );
}
