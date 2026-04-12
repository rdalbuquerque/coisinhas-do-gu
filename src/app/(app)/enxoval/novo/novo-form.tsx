"use client";

import { useState } from "react";
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
import { createEnxoval } from "@/app/actions/enxovais";
import { ensureClothingTypes } from "@/app/actions/clothing-types";
import { ClothingType, EnxovalKind, SizePeriod } from "@/lib/types/database";
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
  BedDouble,
} from "lucide-react";

interface ReviewItem {
  clothing_type_id: string;
  clothing_type_name: string;
  size_period_id: string | null;
  size_name: string;
  target_quantity: number;
}

type Step = "choose" | "review";

const TEMPLATE_ICON: Record<string, React.ReactNode> = {
  inverno: <Snowflake className="h-5 w-5" />,
  verao: <Sun className="h-5 w-5" />,
  "meia-estacao": <CloudSun className="h-5 w-5" />,
  quarto: <BedDouble className="h-5 w-5" />,
};

const TEMPLATE_COLOR: Record<string, string> = {
  inverno: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  verao: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
  "meia-estacao": "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800",
  quarto: "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800",
};

function templateKey(t: SuggestedEnxoval): string {
  return t.kind === "quarto" ? "quarto" : t.season;
}

interface Props {
  initialClothingTypes: ClothingType[];
  initialSizePeriods: SizePeriod[];
}

export function NovoEnxovalForm({ initialClothingTypes, initialSizePeriods }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [name, setName] = useState("");
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>(initialClothingTypes);
  const sizePeriods = initialSizePeriods;
  const [loading, setLoading] = useState(false);
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SuggestedEnxoval | null>(null);
  const [currentKind, setCurrentKind] = useState<EnxovalKind>("roupinhas");
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

  const [newTypeId, setNewTypeId] = useState("");
  const [newSizeId, setNewSizeId] = useState("");
  const [newQty, setNewQty] = useState(1);

  const isQuarto = currentKind === "quarto";

  async function selectTemplate(template: SuggestedEnxoval) {
    setLoading(true);
    setLoadingTemplateId(template.id);
    try {
      const typeNames = template.items.map((i) => i.clothing_type_name);
      const resolvedTypes = await ensureClothingTypes(typeNames, template.kind);

      const typeMap = new Map(resolvedTypes.map((t) => [t.name.toLowerCase(), t.id]));

      // Merge any newly-created types into local state
      setClothingTypes((prev) => {
        const byId = new Map(prev.map((t) => [t.id, t]));
        for (const t of resolvedTypes) {
          if (!byId.has(t.id)) {
            byId.set(t.id, {
              id: t.id,
              name: t.name,
              kind: template.kind,
              created_at: new Date().toISOString(),
            });
          }
        }
        return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
      });

      const items: ReviewItem[] = [];
      if (template.kind === "roupinhas") {
        for (const templateItem of template.items) {
          const typeId = typeMap.get(templateItem.clothing_type_name.toLowerCase());
          if (!typeId) continue;

          for (const size of sizePeriods) {
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
      } else {
        for (const templateItem of template.items) {
          const typeId = typeMap.get(templateItem.clothing_type_name.toLowerCase());
          if (!typeId) continue;
          items.push({
            clothing_type_id: typeId,
            clothing_type_name: templateItem.clothing_type_name,
            size_period_id: null,
            size_name: "",
            target_quantity: templateItem.target_quantity,
          });
        }
      }

      setSelectedTemplate(template);
      setCurrentKind(template.kind);
      setName(template.name);
      setReviewItems(items);
      setStep("review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aplicar sugestão.");
    }
    setLoading(false);
    setLoadingTemplateId(null);
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
    if (!newTypeId) return;
    if (!isQuarto && !newSizeId) return;

    const exists = reviewItems.some(
      (i) =>
        i.clothing_type_id === newTypeId &&
        (isQuarto ? i.size_period_id === null : i.size_period_id === newSizeId)
    );
    if (exists) {
      toast.error(isQuarto ? "Esse tipo já existe na lista." : "Esse tipo + tamanho já existe na lista.");
      return;
    }

    const type = clothingTypes.find((t) => t.id === newTypeId);
    if (!type) return;
    const size = isQuarto ? null : sizePeriods.find((s) => s.id === newSizeId);
    if (!isQuarto && !size) return;

    setReviewItems((prev) => [
      ...prev,
      {
        clothing_type_id: newTypeId,
        clothing_type_name: type.name,
        size_period_id: isQuarto ? null : size!.id,
        size_name: isQuarto ? "" : size!.name,
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
        kind: currentKind,
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

  const groupedBySize = sizePeriods
    .map((size) => ({
      size,
      items: reviewItems
        .map((item, index) => ({ ...item, index }))
        .filter((item) => item.size_period_id === size.id),
    }))
    .filter((group) => group.items.length > 0);

  const flatItems = reviewItems.map((item, index) => ({ ...item, index }));

  // Types available for adding in the review step must match the current kind
  const availableTypes = clothingTypes.filter((t) => t.kind === currentKind);

  if (step === "choose") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Novo enxoval</h1>

        <p className="text-sm text-muted-foreground">
          Escolha um enxoval sugerido. Você pode personalizar tudo antes de criar.
        </p>

        <div className="space-y-3">
          {SUGGESTED_ENXOVAIS.map((template) => {
            const key = templateKey(template);
            const isLoading = loadingTemplateId === template.id;
            return (
              <Card
                key={template.id}
                className={`cursor-pointer border-2 transition-all hover:shadow-md ${TEMPLATE_COLOR[key]} ${loading ? "pointer-events-none opacity-60" : ""} ${isLoading ? "!opacity-100 ring-2 ring-primary" : ""}`}
                onClick={() => !loading && selectTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      TEMPLATE_ICON[key]
                    )}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {isLoading ? "Preparando sugestão..." : template.description}
                  </CardDescription>
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
            );
          })}
        </div>
      </div>
    );
  }

  const templateColorKey = selectedTemplate ? templateKey(selectedTemplate) : "quarto";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setStep("choose")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Personalizar enxoval</h1>
      </div>

      {selectedTemplate && (
        <div className={`rounded-lg border-2 p-3 flex items-center gap-2 ${TEMPLATE_COLOR[templateColorKey]}`}>
          <Sparkles className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            Baseado na sugestão <strong>{selectedTemplate.name}</strong>. Ajuste como quiser antes de criar.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Nome do enxoval</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Enxoval de Inverno" />
      </div>

      {isQuarto ? (
        <div className="space-y-2">
          {flatItems.map((item) => (
            <Card key={item.index}>
              <CardContent className="flex items-center gap-2 p-3">
                <span className="flex-1 text-sm">{item.clothing_type_name}</span>
                <Input
                  type="number"
                  min={1}
                  value={item.target_quantity}
                  onChange={(e) => updateReviewItem(item.index, Number(e.target.value))}
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
      ) : (
        <div className="space-y-4">
          {groupedBySize.map(({ size, items }) => (
            <div key={size.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {size.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {items.reduce((sum, i) => sum + i.target_quantity, 0)} peças
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
                      onChange={(e) => updateReviewItem(item.index, Number(e.target.value))}
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
      )}

      <Card>
        <CardContent className="flex items-center gap-2 p-3">
          <Select value={newTypeId} onValueChange={setNewTypeId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tipo..." />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((t) => (
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
            type="button"
            variant="outline"
            size="icon"
            onClick={addReviewItem}
            disabled={!newTypeId || (!isQuarto && !newSizeId)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Button className="w-full" disabled={reviewItems.length === 0 || loading} onClick={handleCreate}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando...
          </>
        ) : (
          `Criar enxoval (${reviewItems.reduce((sum, i) => sum + i.target_quantity, 0)} ${isQuarto ? "itens" : "peças"})`
        )}
      </Button>
    </div>
  );
}
