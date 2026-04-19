"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function handleClick() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Voltar"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
