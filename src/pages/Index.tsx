import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResumeUpload } from "@/components/ResumeUpload";
import { AnalysisResults, type ResumeAnalysis } from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, FileSearch } from "lucide-react";

const Index = () => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (text: string) => {
    setResumeText(text);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText: text },
      });

      if (error) throw error;
      setAnalysis(data as ResumeAnalysis);
    } catch (e: any) {
      console.error("Analysis error:", e);
      toast({
        title: "Analysis failed",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setResumeText(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <FileSearch className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-display text-foreground">ResumeAI</h1>
          </div>
          {analysis && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        {!analysis && !isAnalyzing && (
          <div className="text-center mb-10 animate-in fade-in duration-500">
            <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              Get your resume reviewed
              <br />
              <span className="text-primary">by AI in seconds</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Upload your resume and get instant, actionable feedback on formatting, content, keywords, and impact.
            </p>
          </div>
        )}

        <ResumeUpload onTextExtracted={handleAnalyze} isAnalyzing={isAnalyzing} />

        {analysis && (
          <div className="mt-12">
            <AnalysisResults analysis={analysis} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
