"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, BedDouble, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnxovalKind } from "@/lib/types/database";

interface PresenteSection {
  name: string;
  kind: EnxovalKind;
  items: { name: string; sizeName: string; missing: number }[];
}

const KIND_OPTIONS: { value: EnxovalKind; label: string; icon: React.ReactNode }[] = [
  { value: "roupinhas", label: "Roupinhas", icon: <Baby className="h-4 w-4" /> },
  { value: "quarto", label: "Quarto", icon: <BedDouble className="h-4 w-4" /> },
];

export function PresentesList({ sections }: { sections: PresenteSection[] }) {
  const [selectedKind, setSelectedKind] = useState<EnxovalKind>("roupinhas");

  const filtered = sections.filter((s) => s.kind === selectedKind);

  return (
    <>
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-border/60 bg-muted/60 p-1">
          {KIND_OPTIONS.map((opt) => {
            const active = opt.value === selectedKind;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedKind(opt.value)}
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
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Gift className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-muted-foreground text-sm">
              Tudo completo! Nenhum item faltando no momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        filtered.map((section, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{section.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {section.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      {item.name}
                      {item.sizeName && (
                        <Badge variant="outline" className="text-xs">
                          {item.sizeName}
                        </Badge>
                      )}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      faltam {item.missing}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </>
  );
}
