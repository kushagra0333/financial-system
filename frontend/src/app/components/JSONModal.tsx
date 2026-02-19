import { X, Download, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import type { AnalysisData } from "./types";

interface JSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalysisData | null;
  runId: string | null;
}

export function JSONModal({ isOpen, onClose, data, runId }: JSONModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (runId) {
      // Use backend endpoint
      window.location.href = `http://localhost:8000/download/${runId}`;
    } else {
      // Fallback to client-side blob if no runId (unlikely in new flow but safe)
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rift-analysis-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#334155]">
            <div>
              <h2 className="text-xl font-semibold text-white">Analysis Results (JSON)</h2>
              <p className="text-sm text-[#94A3B8] mt-1">Export complete analysis data</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#334155] text-[#94A3B8] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* JSON Content */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 font-mono text-sm">
              <pre className="text-[#94A3B8] whitespace-pre-wrap break-words">
                {jsonString}
              </pre>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-6 py-4 border-t border-[#334155] gap-4">
            <div className="text-xs text-[#64748B]">
              Total size: {new Blob([jsonString]).size} bytes
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={handleCopy}
                className="bg-[#334155] hover:bg-[#475569] text-white gap-2 flex-1 sm:flex-none h-9 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2 flex-1 sm:flex-none h-9 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
