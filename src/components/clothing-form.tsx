"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PhotoCapture } from "@/components/photo-capture";
import { SEASONS } from "@/lib/constants";
import {
  ClothingType,
  SizePeriod,
  Season,
  Clothing,
  EnxovalKind,
} from "@/lib/types/database";
import { createClothing, updateClothing } from "@/app/actions/clothes";
import { uploadClothingPhoto } from "@/app/actions/photos";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ClothingFormProps {
  kind: EnxovalKind;
  clothingTypes: ClothingType[];
  sizePeriods: SizePeriod[];
  editing?: Clothing;
}

export function ClothingForm({
  kind,
  clothingTypes,
  sizePeriods,
  editing,
}: ClothingFormProps) {
  const router = useRouter();
  const isQuarto = kind === "quarto";

  const [photo, setPhoto] = useState<Blob | string | null>(
    editing?.photo_url || null
  );
  const [typeId, setTypeId] = useState(editing?.clothing_type_id || "");
  const [sizeId, setSizeId] = useState(editing?.size_period_id || "");
  const [season, setSeason] = useState<Season>(editing?.season || "neutro");
  const [notes, setNotes] = useState(editing?.notes || "");
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!typeId) {
      toast.error(isQuarto ? "Selecione o tipo do item." : "Selecione o tipo e o tamanho.");
      return;
    }
    if (!isQuarto && !sizeId) {
      toast.error("Selecione o tipo e o tamanho.");
      return;
    }

    setLoading(true);
    try {
      let photoUrl = typeof photo === "string" ? photo : null;

      // Upload new photo if it's a File or Blob (Web Worker compression
      // may return a Blob that fails instanceof File checks)
      if (photo instanceof Blob) {
        const fd = new FormData();
        fd.append("file", photo, "photo.jpg");
        photoUrl = await uploadClothingPhoto(fd);
      }

      const formData = {
        clothing_type_id: typeId,
        size_period_id: isQuarto ? null : sizeId,
        season: isQuarto ? ("neutro" as const) : season,
        photo_url: photoUrl,
        notes: notes.trim() || null,
      };

      if (editing) {
        await updateClothing(editing.id, formData);
        toast.success("Item atualizado!");
        router.push(isQuarto ? "/inventario?kind=quarto" : "/inventario");
      } else {
        await createClothing(formData);
        toast.success(isQuarto ? "Item registrado!" : "Peça registrada!");
        // Reset form
        setPhoto(null);
        setTypeId("");
        setSizeId("");
        setSeason("neutro");
        setNotes("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Foto</Label>
        <PhotoCapture value={photo} onChange={setPhoto} onCompressingChange={setCompressing} />
      </div>

      <div className="space-y-2">
        <Label>{isQuarto ? "Tipo de item" : "Tipo de roupa"}</Label>
        <Select value={typeId} onValueChange={setTypeId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {clothingTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isQuarto && (
        <>
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
            <Label>Estação</Label>
            <Select
              value={season}
              onValueChange={(v) => setSeason(v as Season)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Observações</Label>
        <Input
          placeholder="Cor, marca, presente de..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || compressing}>
        {compressing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Comprimindo foto...
          </>
        ) : loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : editing ? (
          "Salvar alterações"
        ) : isQuarto ? (
          "Registrar item"
        ) : (
          "Registrar peça"
        )}
      </Button>
    </form>
  );
}
