"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Baby, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnxovalKind } from "@/lib/types/database";

interface KindToggleProps {
  kind: EnxovalKind;
  basePath: string;
}

const OPTIONS: { value: EnxovalKind; label: string; icon: React.ReactNode }[] = [
  { value: "roupinhas", label: "Roupinhas", icon: <Baby className="h-4 w-4" /> },
  { value: "quarto", label: "Quarto", icon: <BedDouble className="h-4 w-4" /> },
];

export function KindToggle({ kind, basePath }: KindToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(next: EnxovalKind) {
    const params = new URLSearchParams(searchParams.toString());
    // Drop filters that don't apply when swapping kind
    params.delete("tipo");
    params.delete("tamanho");
    params.delete("estacao");
    if (next === "roupinhas") {
      params.delete("kind");
    } else {
      params.set("kind", next);
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="inline-flex rounded-2xl border border-border/60 bg-muted/60 p-1">
      {OPTIONS.map((opt) => {
        const active = opt.value === kind;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => select(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all",
              active
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
