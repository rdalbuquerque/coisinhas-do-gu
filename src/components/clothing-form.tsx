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
import { ClothingType, SizePeriod, Season, Clothing } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { createClothing, updateClothing } from "@/app/actions/clothes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ClothingFormProps {
  clothingTypes: ClothingType[];
  sizePeriods: SizePeriod[];
  editing?: Clothing;
}

export function ClothingForm({
  clothingTypes,
  sizePeriods,
  editing,
}: ClothingFormProps) {
  const router = useRouter();
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
    if (!typeId || !sizeId) {
      toast.error("Selecione o tipo e o tamanho.");
      return;
    }

    setLoading(true);
    try {
      let photoUrl = typeof photo === "string" ? photo : null;

      // Upload new photo if it's a File or Blob (Web Worker compression
      // may return a Blob that fails instanceof File checks)
      if (photo instanceof Blob) {
        const supabase = createClient();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const contentType = photo.type || "image/jpeg";
        const { error: uploadError } = await supabase.storage
          .from("clothes-photos")
          .upload(fileName, photo, { contentType });

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("clothes-photos").getPublicUrl(fileName);
        photoUrl = publicUrl;
      }

      const formData = {
        clothing_type_id: typeId,
        size_period_id: sizeId,
        season,
        photo_url: photoUrl,
        notes: notes.trim() || null,
      };

      if (editing) {
        await updateClothing(editing.id, formData);
        toast.success("Peça atualizada!");
        router.push("/inventario");
      } else {
        await createClothing(formData);
        toast.success("Peça registrada!");
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
        <Label>Tipo de roupa</Label>
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
        ) : (
          "Registrar peça"
        )}
      </Button>
    </form>
  );
}
