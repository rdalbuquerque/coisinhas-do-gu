import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
        <span className={cn("flex items-center gap-1.5", complete && "text-emerald-600 font-medium")}>
          {complete && <Check className="h-3.5 w-3.5" />}
          {label}
        </span>
        <span className={cn(
          "text-xs tabular-nums",
          complete ? "text-emerald-600 font-medium" : "text-muted-foreground"
        )}>
          {current}/{target}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          complete && "[&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-emerald-400 [&_[data-slot=progress-indicator]]:to-emerald-500"
        )}
      />
    </div>
  );
}
