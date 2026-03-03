import { useState } from "react";
import { Activity, AlertTriangle, Network, Clock, Eye, Download, BarChart3, Shield, ArrowRight, Menu, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { AccountDetailsModal } from "./AccountDetailsModal";
import { BlockchainAudit } from "./BlockchainAudit";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight leading-none">
                  RIFT Financial Forensics
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Analysis Complete</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onDownloadJSON}
              variant="outline"
              size="sm"
              className="gap-2 h-9"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export JSON</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`
            absolute top-0 left-0 z-40 h-full border-r border-border bg-card transition-all duration-300 ease-in-out
            md:static md:h-auto
            ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 md:opacity-100 md:w-0 md:translate-x-0 overflow-hidden'}
          `}
        >
          <nav className="p-4 space-y-2 py-6">
            <button
              onClick={() => onChangeView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-medium text-sm
                ${currentView === 'dashboard'
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onChangeView('rings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-medium text-sm
                ${currentView === 'rings'
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <Network className="w-5 h-5 flex-shrink-0" />
              <span>Fraud Rings</span>
            </button>
            <button
              onClick={() => onChangeView('accounts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-medium text-sm
                ${currentView === 'accounts'
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Analyzed Accounts</span>
            </button>
            <button
              onClick={() => onChangeView('graph')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-medium text-sm
                ${currentView === 'graph'
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Graph View</span>
            </button>
            <button
              onClick={() => onChangeView('audit')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-medium text-sm
                ${currentView === 'audit'
                  ? 'bg-primary/10 text-primary hover:bg-primary/15'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <Lock className="w-5 h-5 flex-shrink-0" />
              <span>Blockchain Audit</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <>
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
                {/* Fraud Rings Table Preview (First 5) */}
                <div className="bg-card border border-border rounded-lg shadow-lg">
                  <div className="border-b border-border px-6 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Fraud Rings</h3>
                      <p className="text-sm text-muted-foreground mt-1">Recent detected networks</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onChangeView('rings')}>
                      View All <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {data.fraud_rings.slice(0, 5).map((ring) => (
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

                {/* Top Suspicious Accounts Preview (Top 5) */}
                <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-fit">
                  <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Top Risk Accounts
                      </h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onChangeView('accounts')}>
                      View All <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 p-4 space-y-3">
                    {data.suspicious_accounts.slice(0, 5).map((acc) => (
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
            </>
          )}

          {/* Fraud Rings View */}
          {currentView === 'rings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Fraud Rings</h2>
                  <p className="text-muted-foreground">Detected suspicious account networks</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Detected: <span className="font-mono font-semibold text-foreground">{data.fraud_rings.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.fraud_rings.map((ring) => (
                  <div
                    key={ring.ring_id}
                    className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-mono text-lg text-foreground font-medium">{ring.ring_id}</p>
                        <p className="text-sm text-muted-foreground capitalize mt-1">{ring.pattern_type.replace(/_/g, " ")}</p>
                      </div>
                      <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30 px-3 py-1 text-sm">
                        {ring.member_accounts.length} members
                      </Badge>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Risk Score</span>
                        <span className="text-foreground font-semibold">{ring.risk_score}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] transition-all"
                          style={{ width: `${ring.risk_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground">
                        <span className="block font-medium text-foreground mb-1">Key Members:</span>
                        {ring.member_accounts.slice(0, 3).join(", ")}
                        {ring.member_accounts.length > 3 && "..."}
                      </div>
                    </div>

                    <Button
                      onClick={() => onViewRing(ring.ring_id)}
                      className="w-full mt-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Analysis
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious Accounts View */}
          {currentView === 'accounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Analyzed Accounts</h2>
                  <p className="text-muted-foreground">All accounts processed by the engine</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Accounts: <span className="font-mono font-semibold text-foreground">{data.suspicious_accounts.length}</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Score</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detected Patterns</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metrics</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.suspicious_accounts.map((acc) => (
                        <tr
                          key={acc.account_id}
                          className="hover:bg-secondary/20 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedAccountId(acc.account_id);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono font-medium text-foreground">{acc.account_id}</div>
                            {acc.ring_id && (
                              <Badge variant="outline" className="mt-1 text-[10px] border-primary/30 text-primary">
                                {acc.ring_id}
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className={`font-semibold ${acc.suspicion_score >= 80 ? "text-destructive" : acc.suspicion_score >= 50 ? "text-amber-500" : "text-yellow-500"}`}>
                                {acc.suspicion_score.toFixed(0)}
                              </span>
                              <div className="w-24 bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${getSuspicionColor(acc.suspicion_score)}`}
                                  style={{ width: `${acc.suspicion_score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {acc.detected_patterns.map((pattern, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[10px] bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                >
                                  {pattern.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span>Total Txns: <span className="text-foreground">{acc.total_transactions}</span></span>
                              <span>Fan-In: <span className="text-emerald-500">{acc.fan_in_count}</span></span>
                              <span>Fan-Out: <span className="text-destructive">{acc.fan_out_count}</span></span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAccountId(acc.account_id);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Graph View Placeholder */}
          {currentView === 'graph' && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Network className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Graph Visualization</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                To explore the transaction graph, please select a specific Fraud Ring or Account to visualize its connections.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => onChangeView('rings')} className="gap-2">
                  <Network className="w-4 h-4" />
                  Browse Fraud Rings
                </Button>
                <Button variant="outline" onClick={() => onChangeView('accounts')} className="gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Browse Accounts
                </Button>
              </div>
            </div>
          )}

          {/* Blockchain Audit View */}
          {currentView === 'audit' && (
            <BlockchainAudit />
          )}
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