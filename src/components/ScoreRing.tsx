import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: "sm" | "lg";
}

export function ScoreRing({ score, label, size = "sm" }: ScoreRingProps) {
  const isLarge = size === "lg";
  const radius = isLarge ? 54 : 36;
  const stroke = isLarge ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = (radius + stroke) * 2;

  const getColor = (s: number) => {
    if (s >= 80) return "text-success";
    if (s >= 60) return "text-primary";
    if (s >= 40) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={stroke}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            className={cn("transition-all duration-1000 ease-out", getColor(score))}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold text-foreground",
            isLarge ? "text-3xl" : "text-lg"
          )}
        >
          {score}
        </span>
      </div>
      <span className={cn("font-medium text-muted-foreground", isLarge ? "text-base" : "text-sm")}>
        {label}
      </span>
    </div>
  );
}
