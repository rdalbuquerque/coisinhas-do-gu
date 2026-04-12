"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/image-utils";
import { PhotoLightbox } from "@/components/photo-lightbox";
import Image from "next/image";

interface PhotoCaptureProps {
  value: Blob | string | null;
  onChange: (file: Blob | null) => void;
  onCompressingChange?: (compressing: boolean) => void;
}

export function PhotoCapture({ value, onChange, onCompressingChange }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [compressing, setCompressing] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    onCompressingChange?.(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch {
      onChange(file);
      setPreview(URL.createObjectURL(file));
    }
    setCompressing(false);
    onCompressingChange?.(false);
  }

  function handleRemove() {
    onChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border">
          {preview.startsWith("blob:") ? (
            <Image
              src={preview}
              alt="Prévia"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <PhotoLightbox src={preview} alt="Foto">
              <button
                type="button"
                className="absolute inset-0 cursor-zoom-in"
                aria-label="Ver foto em tamanho maior"
              >
                <Image
                  src={preview}
                  alt="Prévia"
                  fill
                  className="object-cover"
                />
              </button>
            </PhotoLightbox>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-1 top-1 z-10 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="flex h-32 w-full max-w-[200px] flex-col items-center justify-center gap-2 border-dashed"
          onClick={() => inputRef.current?.click()}
          disabled={compressing}
        >
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {compressing ? "Comprimindo..." : "Adicionar foto"}
          </span>
        </Button>
      )}
    </div>
  );
}
