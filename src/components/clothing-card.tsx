import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clothing } from "@/lib/types/database";
import { SEASON_LABELS } from "@/lib/constants";
import { Sun, Snowflake, Circle } from "lucide-react";

const seasonIcon: Record<string, React.ReactNode> = {
  verao: <Sun className="h-3 w-3" />,
  inverno: <Snowflake className="h-3 w-3" />,
  neutro: <Circle className="h-3 w-3" />,
};

export function ClothingCard({ item }: { item: Clothing }) {
  return (
    <Link href={`/inventario/${item.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          {item.photo_url ? (
            <Image
              src={item.photo_url}
              alt={item.clothing_types?.name || "Roupa"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Sem foto
            </div>
          )}
        </div>
        <div className="p-2 space-y-1">
          <p className="text-sm font-medium truncate">
            {item.clothing_types?.name}
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {item.size_periods?.name}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              {seasonIcon[item.season]}
              {SEASON_LABELS[item.season]}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
