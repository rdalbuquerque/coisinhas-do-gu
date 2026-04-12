import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EnxovalProgressProps {
  label: string;
  current: number;
  target: number;
}

export function EnxovalProgress({ label, current, target }: EnxovalProgressProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const complete = current >= target;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={cn(complete && "text-primary font-medium")}>
          {label}
        </span>
        <span className={cn(
          "text-xs tabular-nums",
          complete ? "text-primary" : "text-muted-foreground"
        )}>
          {current}/{target}
        </span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}
