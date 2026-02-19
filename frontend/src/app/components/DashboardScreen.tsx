import { useState } from "react";
import { Activity, AlertTriangle, Network, Clock, Eye, Download, BarChart3, Shield, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { AccountDetailsModal } from "./AccountDetailsModal";
import type { AnalysisData } from "./types";

interface DashboardScreenProps {
  data: AnalysisData;
  onViewRing: (ringId: string) => void;
  onDownloadJSON: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

export function DashboardScreen({ data, onViewRing, onDownloadJSON, currentView, onChangeView }: DashboardScreenProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getSuspicionColor = (score: number) => {
    if (score >= 80) return "bg-[#EF4444]";
    if (score >= 50) return "bg-[#F59E0B]";
    return "bg-[#EAB308]";
  };

  const getSuspicionBadgeColor = (score: number) => {
    if (score >= 80) return "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30";
    if (score >= 50) return "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30";
    return "bg-[#EAB308]/20 text-[#EAB308] border-[#EAB308]/30";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <nav className="border-b border-border bg-card">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                RIFT Financial Forensics Engine
              </h1>
              <p className="text-xs text-muted-foreground">Analysis Complete</p>
            </div>
          </div>
          <Button
            onClick={onDownloadJSON}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground gap-2"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
          <div className="ml-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => onChangeView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onChangeView('rings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'rings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <Network className="w-5 h-5" />
              <span>Fraud Rings</span>
            </button>
            <button
              onClick={() => onChangeView('accounts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'accounts'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Suspicious Accounts</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span>Graph View</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-foreground mb-1">
                {data.summary.total_accounts_analyzed.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Accounts Analyzed</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#EF4444]/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-foreground mb-1">
                {data.summary.suspicious_accounts_flagged}
              </p>
              <p className="text-sm text-muted-foreground">Suspicious Accounts Flagged</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                  <Network className="w-6 h-6 text-[#F59E0B]" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-foreground mb-1">
                {data.summary.fraud_rings_detected}
              </p>
              <p className="text-sm text-muted-foreground">Fraud Rings Detected</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#10B981]" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-foreground mb-1">
                {data.summary.processing_time_seconds}s
              </p>
              <p className="text-sm text-muted-foreground">Processing Time</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Fraud Rings Table */}
            <div className="bg-card border border-border rounded-lg shadow-lg">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Fraud Rings</h3>
                <p className="text-sm text-muted-foreground mt-1">Detected suspicious account networks</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {data.fraud_rings.map((ring) => (
                    <div
                      key={ring.ring_id}
                      className="bg-card/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-mono text-sm text-foreground font-medium">{ring.ring_id}</p>
                          <p className="text-xs text-muted-foreground mt-1">{ring.pattern_type}</p>
                        </div>
                        <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30">
                          {ring.member_accounts.length} members
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Risk Score</span>
                          <span className="text-foreground font-medium">{ring.risk_score}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] transition-all"
                            style={{ width: `${ring.risk_score}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => onViewRing(ring.ring_id)}
                        className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground h-9 gap-2"
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Suspicious Accounts */}
            <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-[500px]">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Top Suspicious Accounts
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {data.suspicious_accounts.slice(0, 10).map((acc) => (
                  <div
                    key={acc.account_id}
                    className="bg-card/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group cursor-pointer"
                    onClick={() => {
                      setSelectedAccountId(acc.account_id);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-mono text-sm text-foreground font-medium truncate" title={acc.account_id}>
                          {acc.account_id}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {acc.detected_patterns.slice(0, 2).map((pattern, idx) => (
                            <span key={idx} className="text-[10px] text-muted-foreground">
                              {pattern.replace(/_/g, " ")}
                              {idx < acc.detected_patterns.length - 1 && idx < 1 ? ", " : ""}
                            </span>
                          ))}
                          {acc.detected_patterns.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{acc.detected_patterns.length - 2} more</span>
                          )}
                        </div>
                      </div>
                      <Badge className={getSuspicionBadgeColor(acc.suspicion_score)}>
                        Score: {acc.suspicion_score.toFixed(0)}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Suspicion Level</span>
                        <span className="text-foreground font-medium">{acc.suspicion_score.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${getSuspicionColor(acc.suspicion_score)} transition-all`}
                          style={{ width: `${acc.suspicion_score}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAccountId(acc.account_id);
                        setIsDetailsModalOpen(true);
                      }}
                      className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground h-9 gap-2"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Analysis
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <AccountDetailsModal
        accountId={selectedAccountId}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}