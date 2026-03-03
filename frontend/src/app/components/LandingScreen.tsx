import { Upload, FileCheck, Database, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

interface LandingScreenProps {
  onUploadComplete: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function LandingScreen({ onUploadComplete, isLoading, error }: LandingScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onUploadComplete(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
                RIFT Financial Forensics Engine
              </h1>
              <p className="text-xs text-muted-foreground">Graph-Based Crime Detection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm text-muted-foreground mr-4 hidden sm:inline">System Ready</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-foreground mb-4 tracking-tight">
            Graph-Based Money Muling Detection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload transaction dataset to analyze financial crime patterns and identify suspicious account networks
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-8 shadow-2xl">
          <div
            className={`border-2 border-dashed rounded-lg p-6 md:p-12 transition-all ${isDragging
              ? 'border-primary bg-primary/5'
              : fileName
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-border hover:border-muted-foreground/50'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              {fileName ? (
                <>
                  <FileCheck className="w-12 h-12 md:w-16 md:h-16 text-[#10B981]" />
                  <div className="text-center">
                    <p className="text-base md:text-lg font-medium text-foreground">{fileName}</p>
                    <p className="text-sm text-muted-foreground mt-1">File ready for analysis</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-[#64748B]" />
                  <div className="text-center">
                    <p className="text-base md:text-lg font-medium text-foreground mb-1">
                      Drag and drop CSV file here
                    </p>
                    <p className="text-sm text-muted-foreground">or</p>
                  </div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors">
                      <Database className="w-4 h-4" />
                      Browse Files
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {fileName && (
            <div className="mt-6">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-base disabled:opacity-50"
              >
                {isLoading ? "Analyzing..." : "Analyze Transactions"}
              </Button>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Max File Size</h4>
            <p className="text-2xl font-semibold text-foreground">10K</p>
            <p className="text-xs text-muted-foreground mt-1">transactions</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Supported Format</h4>
            <p className="text-2xl font-semibold text-foreground">CSV</p>
            <p className="text-xs text-muted-foreground mt-1">comma-separated values</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Required Columns</h4>
            <p className="text-sm font-mono text-foreground">from, to, amount</p>
            <p className="text-xs text-muted-foreground mt-1">timestamp optional</p>
          </div>
        </div>

        {/* Preview Table */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Expected Data Format</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">from_account</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">to_account</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">amount</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">ACC001234</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">ACC005678</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">250.00</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">2026-02-19 14:23:11</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">ACC005678</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">ACC009012</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">245.00</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">2026-02-19 14:25:33</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
