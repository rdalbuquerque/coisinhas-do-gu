"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { createEnxoval } from "@/app/actions/enxovais";
import { ensureClothingTypes } from "@/app/actions/clothing-types";
import { SizePeriod } from "@/lib/types/database";
import {
  SUGGESTED_ENXOVAIS,
  SuggestedEnxoval,
  getQuantityForSize,
} from "@/lib/suggested-enxovais";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  ArrowLeft,
  Snowflake,
  Sun,
  CloudSun,
  Check,
} from "lucide-react";

type Step = "choose" | "sizes";

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
  const [sizePeriods, setSizePeriods] = useState<SizePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SuggestedEnxoval | null>(null);
  const [selectedSizeIds, setSelectedSizeIds] = useState<Set<string>>(new Set());
  const [typeMap, setTypeMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("size_periods")
      .select("*")
      .order("display_order")
      .then(({ data }) => setSizePeriods(data || []));
  }, []);

  async function selectTemplate(template: SuggestedEnxoval) {
    setLoading(true);
    try {
      const typeNames = template.items.map((i) => i.clothing_type_name);
      const resolvedTypes = await ensureClothingTypes(typeNames);

      const newTypeMap = new Map(
        resolvedTypes.map((t) => [t.name.toLowerCase(), t.id])
      );
      setTypeMap(newTypeMap);

      setSelectedTemplate(template);
      setSelectedSizeIds(new Set());
      setStep("sizes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aplicar sugestão.");
    }
    setLoading(false);
  }

  function toggleSize(sizeId: string) {
    setSelectedSizeIds((prev) => {
      const next = new Set(prev);
      if (next.has(sizeId)) {
        next.delete(sizeId);
      } else {
        next.add(sizeId);
      }
      return next;
    });
  }

  function getSizeName(sizeId: string): string {
    return sizePeriods.find((s) => s.id === sizeId)?.name || "";
  }

  async function handleCreateFromTemplate() {
    if (!selectedTemplate || selectedSizeIds.size === 0) {
      toast.error("Selecione pelo menos um tamanho.");
      return;
    }

    setLoading(true);
    try {
      const sortedSizeIds = sizePeriods
        .filter((s) => selectedSizeIds.has(s.id))
        .map((s) => s.id);

      for (const sId of sortedSizeIds) {
        const sizeName = getSizeName(sId);
        const enxovalItems = selectedTemplate.items
          .map((item) => {
            const qty = getQuantityForSize(item, sizeName);
            const typeId = typeMap.get(item.clothing_type_name.toLowerCase()) || "";
            return { clothing_type_id: typeId, target_quantity: qty };
          })
          .filter((i) => i.clothing_type_id && i.target_quantity > 0);

        await createEnxoval({
          name: `${selectedTemplate.name} - ${sizeName}`,
          size_period_id: sId,
          items: enxovalItems,
        });
      }

      const count = selectedSizeIds.size;
      toast.success(
        count === 1
          ? "Enxoval criado!"
          : `${count} enxovais criados!`
      );
      router.push("/enxoval");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar.");
    }
    setLoading(false);
  }

  // Step 1: Choose template
  if (step === "choose") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Novo enxoval</h1>

        <p className="text-sm text-muted-foreground">
          Escolha um enxoval sugerido baseado na estação do nascimento. As quantidades se ajustam por tamanho.
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

  // Step 2: Select sizes for template
  if (selectedTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setStep("choose")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Selecionar tamanhos</h1>
        </div>

        <div className={`rounded-lg border-2 p-3 flex items-center gap-2 ${SEASON_COLOR[selectedTemplate.season]}`}>
          <Sparkles className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            <strong>{selectedTemplate.name}</strong> — selecione os tamanhos que deseja. Um enxoval será criado para cada tamanho.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Tamanhos</Label>
          <div className="grid grid-cols-2 gap-2">
            {sizePeriods.map((size) => {
              const isSelected = selectedSizeIds.has(size.id);
              return (
                <Button
                  key={size.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="h-12 text-base"
                  onClick={() => toggleSize(size.id)}
                >
                  {isSelected && <Check className="mr-2 h-4 w-4" />}
                  {size.name}
                </Button>
              );
            })}
          </div>
        </div>

        {selectedSizeIds.size > 0 && (
          <div className="space-y-3">
            <Label>Resumo dos enxovais</Label>
            {sizePeriods
              .filter((s) => selectedSizeIds.has(s.id))
              .map((size) => (
                <Card key={size.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {selectedTemplate.name} - {size.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTemplate.items
                        .map((item) => ({
                          name: item.clothing_type_name,
                          qty: getQuantityForSize(item, size.name),
                        }))
                        .filter((i) => i.qty > 0)
                        .map((item) => (
                          <Badge key={item.name} variant="secondary" className="text-xs">
                            {item.name} ({item.qty})
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        <Button
          className="w-full"
          disabled={selectedSizeIds.size === 0 || loading}
          onClick={handleCreateFromTemplate}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : selectedSizeIds.size <= 1 ? (
            "Criar enxoval"
          ) : (
            `Criar ${selectedSizeIds.size} enxovais`
          )}
        </Button>
      </div>
    );
  }

  return null;
}
