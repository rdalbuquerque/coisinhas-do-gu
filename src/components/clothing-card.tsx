import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clothing } from "@/lib/types/database";
import { SEASON_LABELS } from "@/lib/constants";
import { Sun, Snowflake, Circle, Shirt } from "lucide-react";

const seasonIcon: Record<string, React.ReactNode> = {
  verao: <Sun className="h-3 w-3" />,
  inverno: <Snowflake className="h-3 w-3" />,
  neutro: <Circle className="h-3 w-3" />,
};

export function ClothingCard({ item }: { item: Clothing }) {
  return (
    <Link href={`/inventario/${item.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-soft-lg hover:-translate-y-0.5">
        <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted">
          {item.photo_url ? (
            <Image
              src={item.photo_url}
              alt={item.clothing_types?.name || "Roupa"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground/50">
              <Shirt className="h-8 w-8" />
              <span className="text-xs">Sem foto</span>
            </div>
          )}
        </div>
        <div className="p-2.5 space-y-1.5">
          <p className="text-sm font-semibold truncate">
            {item.clothing_types?.name}
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            {item.size_periods?.name && (
              <Badge variant="secondary" className="text-xs">
                {item.size_periods.name}
              </Badge>
            )}
            {item.clothing_types?.kind !== "quarto" && (
              <Badge variant="outline" className="text-xs gap-1">
                {seasonIcon[item.season]}
                {SEASON_LABELS[item.season]}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
