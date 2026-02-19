import { Activity, AlertTriangle, Network, Clock, Eye, Download, BarChart3, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import type { AnalysisData, FraudRing, SuspiciousAccount } from "./mockData";

interface DashboardScreenProps {
  data: AnalysisData;
  onViewRing: (ringId: string) => void;
  onDownloadJSON: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

export function DashboardScreen({ data, onViewRing, onDownloadJSON, currentView, onChangeView }: DashboardScreenProps) {
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
    <div className="min-h-screen bg-[#0B1220]">
      {/* Top Navbar */}
      <nav className="border-b border-[#334155] bg-[#0F172A]">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                RIFT Financial Forensics Engine
              </h1>
              <p className="text-xs text-[#94A3B8]">Analysis Complete</p>
            </div>
          </div>
          <Button
            onClick={onDownloadJSON}
            className="bg-[#334155] hover:bg-[#475569] text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-[#334155] bg-[#0F172A] min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => onChangeView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onChangeView('rings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'rings'
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
              }`}
            >
              <Network className="w-5 h-5" />
              <span>Fraud Rings</span>
            </button>
            <button
              onClick={() => onChangeView('accounts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'accounts'
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Suspicious Accounts</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#94A3B8] hover:bg-[#1E293B] hover:text-white transition-colors"
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
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#3B82F6]" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-white mb-1">
                {data.totalAccounts.toLocaleString()}
              </p>
              <p className="text-sm text-[#94A3B8]">Total Accounts Analyzed</p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#EF4444]/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-white mb-1">
                {data.suspiciousAccounts}
              </p>
              <p className="text-sm text-[#94A3B8]">Suspicious Accounts Flagged</p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                  <Network className="w-6 h-6 text-[#F59E0B]" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-white mb-1">
                {data.fraudRings}
              </p>
              <p className="text-sm text-[#94A3B8]">Fraud Rings Detected</p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#10B981]" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-white mb-1">
                {data.processingTime}s
              </p>
              <p className="text-sm text-[#94A3B8]">Processing Time</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Fraud Rings Table */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg shadow-lg">
              <div className="border-b border-[#334155] px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Fraud Rings</h3>
                <p className="text-sm text-[#94A3B8] mt-1">Detected suspicious account networks</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {data.rings.map((ring) => (
                    <div
                      key={ring.id}
                      className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 hover:border-[#3B82F6]/50 transition-all hover:shadow-lg hover:shadow-[#3B82F6]/10 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-mono text-sm text-white font-medium">{ring.id}</p>
                          <p className="text-xs text-[#94A3B8] mt-1">{ring.patternType}</p>
                        </div>
                        <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30">
                          {ring.memberCount} members
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#94A3B8]">Risk Score</span>
                          <span className="text-white font-medium">{ring.riskScore}%</span>
                        </div>
                        <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] transition-all"
                            style={{ width: `${ring.riskScore}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => onViewRing(ring.id)}
                        className="w-full bg-[#334155] hover:bg-[#475569] text-white h-9 gap-2"
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
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg shadow-lg">
              <div className="border-b border-[#334155] px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Top Suspicious Accounts</h3>
                <p className="text-sm text-[#94A3B8] mt-1">Highest risk score accounts</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {data.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-[#0F172A] border border-[#334155] rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-mono text-sm text-white font-medium">{account.id}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {account.patterns.map((pattern, idx) => (
                              <Badge
                                key={idx}
                                className="text-xs bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30"
                              >
                                {pattern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge className={getSuspicionBadgeColor(account.suspicionScore)}>
                          {account.suspicionScore}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#94A3B8]">Suspicion Score</span>
                          <span className="text-white font-medium">{account.suspicionScore}%</span>
                        </div>
                        <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${getSuspicionColor(account.suspicionScore)} transition-all`}
                            style={{ width: `${account.suspicionScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}