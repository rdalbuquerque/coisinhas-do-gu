"use client";

import Image from "next/image";
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
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] border-0 bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative h-[85vh] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="95vw"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
