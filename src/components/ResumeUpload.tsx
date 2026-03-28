import { Upload, FileText, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { extractTextFromFile } from "@/lib/file-parser";

interface ResumeUploadProps {
  onTextExtracted: (text: string) => void;
  isAnalyzing: boolean;
}

export function ResumeUpload({ onTextExtracted, isAnalyzing }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const extractText = useCallback(async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    onTextExtracted(text);
  }, [onTextExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) extractText(file);
  }, [extractText]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) extractText(file);
  }, [extractText]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-all duration-300 cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        isAnalyzing && "pointer-events-none opacity-60"
      )}
      onClick={() => document.getElementById("resume-file-input")?.click()}
    >
      <input
        id="resume-file-input"
        type="file"
        accept=".txt,.md,.text"
        className="hidden"
        onChange={handleFileInput}
      />
      
      {isAnalyzing ? (
        <>
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg font-medium text-foreground">Analyzing your resume...</p>
          <p className="text-sm text-muted-foreground">This usually takes 10-15 seconds</p>
        </>
      ) : fileName ? (
        <>
          <FileText className="h-12 w-12 text-primary" />
          <p className="text-lg font-medium text-foreground">{fileName}</p>
          <p className="text-sm text-muted-foreground">Click or drag to replace</p>
        </>
      ) : (
        <>
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Drop your resume here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse — supports .txt files</p>
          </div>
        </>
      )}
    </div>
  );
}
