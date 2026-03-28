import { CheckCircle2, AlertTriangle, ArrowUpCircle, Lightbulb } from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export interface ResumeAnalysis {
  overallScore: number;
  scores: {
    formatting: number;
    content: number;
    keywords: number;
    impact: number;
  };
  summary: string;
  strengths: string[];
  suggestions: {
    category: string;
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
  }[];
}

interface AnalysisResultsProps {
  analysis: ResumeAnalysis;
}

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Low", className: "bg-primary/10 text-primary border-primary/20" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  formatting: <ArrowUpCircle className="h-4 w-4" />,
  content: <Lightbulb className="h-4 w-4" />,
  keywords: <AlertTriangle className="h-4 w-4" />,
  impact: <ArrowUpCircle className="h-4 w-4" />,
  general: <Lightbulb className="h-4 w-4" />,
};

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary */}
      <Card className="shadow-card border-primary/10">
        <CardContent className="pt-6">
          <p className="text-lg text-muted-foreground leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Scores */}
      <div className="flex flex-wrap items-center justify-center gap-8 py-4">
        <ScoreRing score={analysis.overallScore} label="Overall" size="lg" />
        <div className="flex gap-6">
          <ScoreRing score={analysis.scores.formatting} label="Formatting" />
          <ScoreRing score={analysis.scores.content} label="Content" />
          <ScoreRing score={analysis.scores.keywords} label="Keywords" />
          <ScoreRing score={analysis.scores.impact} label="Impact" />
        </div>
      </div>

      {/* Strengths */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-success shrink-0" />
                <span className="text-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-accent" />
            Suggestions to Improve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
              >
                <span className="mt-0.5 text-muted-foreground">{categoryIcons[s.category]}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{s.title}</h4>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", priorityConfig[s.priority].className)}
                    >
                      {priorityConfig[s.priority].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
