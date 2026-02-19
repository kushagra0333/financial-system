import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, ChevronLeft, TrendingUp, TrendingDown, Shield, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { FraudRing } from "./mockData";

interface GraphViewScreenProps {
  ring: FraudRing;
  onBack: () => void;
}

export function GraphViewScreen({ ring, onBack }: GraphViewScreenProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Generate graph data
  const generateGraphData = () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create center hub node
    const centerAccount = ring.accounts[0];
    nodes.push({
      id: centerAccount,
      data: { label: centerAccount },
      position: { x: 400, y: 300 },
      type: 'default',
      style: {
        background: '#EF4444',
        color: 'white',
        border: '2px solid #F59E0B',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '12px',
        fontFamily: 'monospace',
        fontWeight: '600',
        boxShadow: '0 0 30px rgba(239, 68, 68, 0.6), 0 0 15px rgba(245, 158, 11, 0.4)',
        animation: 'pulse-glow 2s ease-in-out infinite',
      },
    });

    // Create surrounding nodes in a circle
    const radius = 200;
    const angleStep = (2 * Math.PI) / (ring.accounts.length - 1);

    ring.accounts.slice(1).forEach((account, index) => {
      const angle = angleStep * index;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      const isHighRisk = index % 3 === 0;

      nodes.push({
        id: account,
        data: { label: account },
        position: { x, y },
        type: 'default',
        style: {
          background: isHighRisk ? '#F59E0B' : '#64748B',
          color: 'white',
          border: isHighRisk ? '2px solid #EF4444' : '1px solid #475569',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: '500',
          boxShadow: isHighRisk ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none',
        },
      });

      // Create edge from center to this node
      edges.push({
        id: `${centerAccount}-${account}`,
        source: centerAccount,
        target: account,
        animated: true,
        style: { stroke: '#3B82F6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3B82F6',
        },
      });

      // Create some circular connections
      if (index < ring.accounts.length - 2) {
        edges.push({
          id: `${account}-${ring.accounts[index + 2]}`,
          source: account,
          target: ring.accounts[index + 2],
          animated: Math.random() > 0.5,
          style: { stroke: '#64748B', strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#64748B',
          },
        });
      }
    });

    return { nodes, edges };
  };

  const { nodes: initialNodes, edges: initialEdges } = generateGraphData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const getAccountData = (accountId: string) => {
    const isCenter = accountId === ring.accounts[0];
    return {
      id: accountId,
      suspicionScore: isCenter ? ring.riskScore : Math.floor(Math.random() * 30) + 50,
      patterns: isCenter ? [ring.patternType, "Hub Account"] : [ring.patternType],
      totalTransactions: Math.floor(Math.random() * 200) + 50,
      fanIn: Math.floor(Math.random() * 10) + 2,
      fanOut: Math.floor(Math.random() * 10) + 2,
    };
  };

  const selectedAccountData = selectedNode ? getAccountData(selectedNode) : null;

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Top Navbar */}
      <nav className="border-b border-[#334155] bg-[#0F172A]">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-[#94A3B8] hover:text-white"
              size="sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">
                  RIFT Financial Forensics Engine
                </h1>
                <p className="text-xs text-[#94A3B8]">Ring Detail View</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="px-8 py-4 bg-[#0F172A] border-b border-[#334155]">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={onBack} className="text-[#3B82F6] hover:underline">
            Dashboard
          </button>
          <span className="text-[#64748B]">/</span>
          <span className="text-white">Fraud Ring {ring.id}</span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div>
            <p className="text-xs text-[#94A3B8]">Ring ID</p>
            <p className="text-sm font-mono text-white">{ring.id}</p>
          </div>
          <div className="w-px h-10 bg-[#334155]"></div>
          <div>
            <p className="text-xs text-[#94A3B8]">Pattern Type</p>
            <p className="text-sm text-white">{ring.patternType}</p>
          </div>
          <div className="w-px h-10 bg-[#334155]"></div>
          <div>
            <p className="text-xs text-[#94A3B8]">Risk Score</p>
            <p className="text-sm font-semibold text-[#EF4444]">{ring.riskScore}%</p>
          </div>
          <div className="w-px h-10 bg-[#334155]"></div>
          <div>
            <p className="text-xs text-[#94A3B8]">Members</p>
            <p className="text-sm text-white">{ring.memberCount} accounts</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-185px)]">
        {/* Graph Visualization */}
        <div className="flex-1 relative bg-[#0B1220]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            className="bg-[#0B1220]"
            minZoom={0.5}
            maxZoom={2}
          >
            <Background color="#334155" gap={16} />
            <Controls className="bg-[#1E293B] border border-[#334155] rounded-lg" />
            <MiniMap
              className="bg-[#1E293B] border border-[#334155] rounded-lg"
              nodeColor={(node) => {
                if (node.id === ring.accounts[0]) return '#EF4444';
                return '#64748B';
              }}
            />
          </ReactFlow>

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-[#1E293B] border border-[#334155] rounded-lg p-4 shadow-xl">
            <h4 className="text-sm font-semibold text-white mb-3">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#EF4444] border-2 border-[#F59E0B]"></div>
                <span className="text-xs text-[#94A3B8]">High-risk (Hub)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#F59E0B] border border-[#EF4444]"></div>
                <span className="text-xs text-[#94A3B8]">Suspicious</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#64748B]"></div>
                <span className="text-xs text-[#94A3B8]">Ring Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Account Details */}
        {selectedAccountData && (
          <aside className="w-96 border-l border-[#334155] bg-[#0F172A] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Account Details</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[#94A3B8] hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Account ID */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mb-4">
                <p className="text-xs text-[#94A3B8] mb-1">Account ID</p>
                <p className="text-lg font-mono font-semibold text-white">{selectedAccountData.id}</p>
              </div>

              {/* Suspicion Score */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[#94A3B8]">Suspicion Score</p>
                  <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30">
                    {selectedAccountData.suspicionScore}
                  </Badge>
                </div>
                <div className="w-full bg-[#0F172A] rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-[#EF4444]"
                    style={{ width: `${selectedAccountData.suspicionScore}%` }}
                  />
                </div>
              </div>

              {/* Detected Patterns */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mb-4">
                <p className="text-xs text-[#94A3B8] mb-3">Detected Patterns</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAccountData.patterns.map((pattern, idx) => (
                    <Badge
                      key={idx}
                      className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Transaction Metrics */}
              <div className="space-y-3">
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-sm text-[#94A3B8]">Total Transactions</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {selectedAccountData.totalTransactions}
                    </span>
                  </div>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-[#94A3B8]">Fan-In (Incoming)</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {selectedAccountData.fanIn}
                    </span>
                  </div>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#EF4444]" />
                      <span className="text-sm text-[#94A3B8]">Fan-Out (Outgoing)</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {selectedAccountData.fanOut}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Flow Preview */}
              <div className="mt-6 bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#94A3B8] mb-3">Recent Transaction Pattern</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                    <span className="text-[#64748B] font-mono">ACC{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}</span>
                    <span className="text-[#94A3B8]">→</span>
                    <span className="text-white font-mono">{selectedAccountData.id}</span>
                    <span className="ml-auto text-[#94A3B8]">$250.00</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                    <span className="text-white font-mono">{selectedAccountData.id}</span>
                    <span className="text-[#94A3B8]">→</span>
                    <span className="text-[#64748B] font-mono">ACC{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}</span>
                    <span className="ml-auto text-[#94A3B8]">$245.00</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                    <span className="text-white font-mono">{selectedAccountData.id}</span>
                    <span className="text-[#94A3B8]">→</span>
                    <span className="text-[#64748B] font-mono">ACC{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}</span>
                    <span className="ml-auto text-[#94A3B8]">$240.00</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}