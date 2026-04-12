"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PhotoLightboxProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

export function PhotoLightbox({ src, alt, children }: PhotoLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        onClick={() => setOpen(false)}
        className="max-w-[95vw] sm:max-w-[90vw] border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative h-[85vh] w-full cursor-zoom-out">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="95vw"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
