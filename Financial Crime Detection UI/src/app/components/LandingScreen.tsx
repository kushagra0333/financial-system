import { Upload, FileCheck, Database, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface LandingScreenProps {
  onUploadComplete: () => void;
}

export function LandingScreen({ onUploadComplete }: LandingScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleAnalyze = () => {
    if (fileName) {
      // Simulate processing delay
      setTimeout(onUploadComplete, 800);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Top Navbar */}
      <nav className="border-b border-[#334155] bg-[#0F172A]">
        <div className="mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                RIFT Financial Forensics Engine
              </h1>
              <p className="text-xs text-[#94A3B8]">Graph-Based Crime Detection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
            <span className="text-sm text-[#94A3B8]">System Ready</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-white mb-4 tracking-tight">
            Graph-Based Money Muling Detection
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            Upload transaction dataset to analyze financial crime patterns and identify suspicious account networks
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-8 shadow-2xl">
          <div
            className={`border-2 border-dashed rounded-lg p-12 transition-all ${
              isDragging
                ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                : fileName
                ? 'border-[#10B981] bg-[#10B981]/5'
                : 'border-[#334155] hover:border-[#475569]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              {fileName ? (
                <>
                  <FileCheck className="w-16 h-16 text-[#10B981]" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-white">{fileName}</p>
                    <p className="text-sm text-[#94A3B8] mt-1">File ready for analysis</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-[#64748B]" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-white mb-1">
                      Drag and drop CSV file here
                    </p>
                    <p className="text-sm text-[#94A3B8]">or</p>
                  </div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg transition-colors">
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
                className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-base"
              >
                Analyze Transactions
              </Button>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Max File Size</h4>
            <p className="text-2xl font-semibold text-white">10K</p>
            <p className="text-xs text-[#64748B] mt-1">transactions</p>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Supported Format</h4>
            <p className="text-2xl font-semibold text-white">CSV</p>
            <p className="text-xs text-[#64748B] mt-1">comma-separated values</p>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Required Columns</h4>
            <p className="text-sm font-mono text-white">from, to, amount</p>
            <p className="text-xs text-[#64748B] mt-1">timestamp optional</p>
          </div>
        </div>

        {/* Preview Table */}
        <div className="mt-8 bg-[#1E293B] border border-[#334155] rounded-lg p-6">
          <h4 className="text-sm font-medium text-[#94A3B8] mb-4">Expected Data Format</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-2 px-3 text-[#94A3B8] font-medium">from_account</th>
                  <th className="text-left py-2 px-3 text-[#94A3B8] font-medium">to_account</th>
                  <th className="text-left py-2 px-3 text-[#94A3B8] font-medium">amount</th>
                  <th className="text-left py-2 px-3 text-[#94A3B8] font-medium">timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#334155]/50">
                  <td className="py-2 px-3 text-[#64748B] font-mono text-xs">ACC001234</td>
                  <td className="py-2 px-3 text-[#64748B] font-mono text-xs">ACC005678</td>
                  <td className="py-2 px-3 text-[#64748B] font-mono text-xs">250.00</td>
                  <td className="py-2 px-3 text-[#64748B] font-mono text-xs">2026-02-19 14:23:11</td>
                </tr>
                <tr className="border-b border-[#334155]/50">
                  <td className="py-2 px-3 text-[#64748B] font-mono text-xs">ACC005678</td>
                  <td className="py-2 px-3 text-[#64748B] font-mono text-xs">ACC009012</td>
                  <td className="py-2 px-3 text-[#64748B] font-mono text-xs">245.00</td>
                  <td className="py-2 px-3 text-[#64748B] font-mono text-xs">2026-02-19 14:25:33</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
