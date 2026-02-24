import { Progress } from "@/components/ui/progress";

interface EnxovalProgressProps {
  label: string;
  current: number;
  target: number;
}

export function EnxovalProgress({ label, current, target }: EnxovalProgressProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const complete = current >= target;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className={complete ? "text-green-600 font-medium" : ""}>
          {label}
        </span>
        <span className={`text-xs ${complete ? "text-green-600" : "text-muted-foreground"}`}>
          {current}/{target}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
