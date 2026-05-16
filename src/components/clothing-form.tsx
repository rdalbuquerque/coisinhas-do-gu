"use client";

import { useRef, useState } from "react";
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
import { ColorChip, type ColorStatus } from "@/components/color-chip";
import { SEASONS } from "@/lib/constants";
import {
  ClothingType,
  SizePeriod,
  Season,
  Clothing,
  ClothingColor,
  EnxovalKind,
} from "@/lib/types/database";
import { createClothing, updateClothing } from "@/app/actions/clothes";
import {
  detectClothingColor,
  uploadClothingPhoto,
} from "@/app/actions/photos";
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
  const [color, setColor] = useState<ClothingColor | null>(
    editing?.color ?? null
  );
  const [colorStatus, setColorStatus] = useState<ColorStatus>(
    editing?.color ? "ready" : "idle"
  );
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const detectionTokenRef = useRef(0);

  function handlePhotoChange(next: Blob | null) {
    setPhoto(next);
    if (isQuarto) return;

    // New photo picked → kick off detection in parallel with the form.
    // Null (photo removed) → cancel any in-flight detection and reset.
    if (next instanceof Blob) {
      const token = ++detectionTokenRef.current;
      setColorStatus("detecting");

      const fd = new FormData();
      fd.append("file", next, "photo.jpg");

      detectClothingColor(fd)
        .then((detected) => {
          if (token !== detectionTokenRef.current) return;
          setColor(detected);
          setColorStatus("ready");
        })
        .catch(() => {
          if (token !== detectionTokenRef.current) return;
          setColorStatus("error");
        });
    } else if (next === null) {
      detectionTokenRef.current++;
      setColor(null);
      setColorStatus("idle");
    }
  }

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
        color: isQuarto ? null : color,
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
        setColor(null);
        setColorStatus("idle");
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
        <PhotoCapture value={photo} onChange={handlePhotoChange} onCompressingChange={setCompressing} />
      </div>

      {!isQuarto && (
        <div className="space-y-2">
          <Label>Cor</Label>
          <ColorChip value={color} status={colorStatus} onChange={setColor} />
        </div>
      )}

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
