"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (value === null) {
      setPreview(null);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }, [value]);

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
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl border shadow-soft">
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
        <div className="flex w-full max-w-[420px] gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex h-28 flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30"
            onClick={() => cameraInputRef.current?.click()}
            disabled={compressing}
          >
            <Camera className="h-6 w-6 text-primary/50" />
            <span className="text-xs text-primary/60 font-medium">
              {compressing ? "Comprimindo..." : "Tirar foto"}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex h-28 flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30"
            onClick={() => galleryInputRef.current?.click()}
            disabled={compressing}
          >
            <ImagePlus className="h-6 w-6 text-primary/50" />
            <span className="text-xs text-primary/60 font-medium">
              {compressing ? "Comprimindo..." : "Da galeria"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
