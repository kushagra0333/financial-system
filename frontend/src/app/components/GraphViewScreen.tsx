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
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { FraudRing } from "./types";
import { useTheme } from "next-themes";
import { API_BASE_URL } from "../config";

interface GraphViewScreenProps {
  ring: FraudRing;
  onBack: () => void;
}

export function GraphViewScreen({ ring, onBack }: GraphViewScreenProps) {
  const { theme } = useTheme();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeDetails, setNodeDetails] = useState<Record<string, any>>({});

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Fetch graph data
  useState(() => {
    const fetchRingDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ring/${ring.ring_id}`);
        if (!res.ok) throw new Error('Failed to fetch ring details');
        const data = await res.json();

        // Map edges
        const newEdges: Edge[] = data.edges.map((e: any) => ({
          id: e.id || `${e.source}-${e.target}-${Math.random()}`,
          source: e.source,
          target: e.target,
          animated: true,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' },
        }));

        // Map nodes and layout
        // Simple circle layout around center
        const centerId = ring.member_accounts[0];
        const otherNodes = data.nodes.filter((n: any) => n.id !== centerId);

        const newNodes: Node[] = [];
        const nodeInfoMap: Record<string, any> = {};

        // Center node
        const centerNodeData = data.nodes.find((n: any) => n.id === centerId);
        if (centerNodeData) {
          newNodes.push({
            id: centerId,
            data: { label: centerId },
            position: { x: 400, y: 300 },
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
              width: 180,
              wordBreak: 'break-all',
              textAlign: 'center',
            }
          });
          nodeInfoMap[centerId] = centerNodeData;
        }

        // Surrounding nodes
        const radius = 250;
        const angleStep = (2 * Math.PI) / (otherNodes.length || 1);

        otherNodes.forEach((n: any, index: number) => {
          const angle = angleStep * index;
          const x = 400 + radius * Math.cos(angle);
          const y = 300 + radius * Math.sin(angle);

          const isMember = n.isMember; // from backend

          newNodes.push({
            id: n.id,
            data: { label: n.id },
            position: { x, y },
            style: {
              background: isMember ? '#F59E0B' : '#64748B',
              color: 'white',
              border: isMember ? '2px solid #EF4444' : '1px solid #475569',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: '500',
              width: 160,
              wordBreak: 'break-all',
              textAlign: 'center',
            }
          });
          nodeInfoMap[n.id] = n;
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setNodeDetails(nodeInfoMap);

      } catch (err) {
        console.error("Error fetching graph:", err);
      }
    };
    fetchRingDetails();
  }); // call once

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const selectedAccountData = selectedNode ? nodeDetails[selectedNode] : null;



  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <nav className="border-b border-border bg-card">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground p-0 h-auto"
              size="sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
                  RIFT Financial Forensics
                </h1>
                <p className="text-xs text-muted-foreground">Ring Detail View</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="px-8 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={onBack} className="text-primary hover:underline">
            Dashboard
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Fraud Ring {ring.ring_id}</span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div>
            <p className="text-xs text-muted-foreground">Ring ID</p>
            <p className="text-sm font-mono text-foreground">{ring.ring_id}</p>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div>
            <p className="text-xs text-muted-foreground">Pattern Type</p>
            <p className="text-sm text-foreground">{ring.pattern_type}</p>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div>
            <p className="text-xs text-muted-foreground">Risk Score</p>
            <p className="text-sm font-semibold text-[#EF4444]">{ring.risk_score}%</p>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div>
            <p className="text-xs text-muted-foreground">Members</p>
            <p className="text-sm text-foreground">{ring.member_accounts.length} accounts</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-185px)]">
        {/* Graph Visualization */}
        <div className="flex-1 relative bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            className="bg-background"
            minZoom={0.5}
            maxZoom={2}
          >
            <Background color={theme === 'dark' ? "#334155" : "#E2E8F0"} gap={16} />
            <Controls className="bg-card border border-border rounded-lg" />
            <MiniMap
              className="bg-card border border-border rounded-lg"
              nodeColor={(node) => {
                if (node.id === ring.member_accounts[0]) return '#EF4444';
                return '#64748B';
              }}
            />
          </ReactFlow>

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-card border border-border rounded-lg p-4 shadow-xl">
            <h4 className="text-sm font-semibold text-foreground mb-3">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#EF4444] border-2 border-[#F59E0B]"></div>
                <span className="text-xs text-muted-foreground">High-risk (Hub)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#F59E0B] border border-[#EF4444]"></div>
                <span className="text-xs text-muted-foreground">Suspicious</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#64748B]"></div>
                <span className="text-xs text-muted-foreground">Ring Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Account Details */}
        {selectedAccountData && (
          <aside className="fixed inset-x-0 bottom-0 z-50 h-[60vh] md:h-auto md:static md:w-96 md:inset-auto bg-card border-t md:border-t-0 md:border-l border-border shadow-2xl md:shadow-none rounded-t-xl md:rounded-none flex flex-col transition-transform duration-300 ease-in-out transform translate-y-0">
            <div className="p-6 overflow-y-auto h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Account Details</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {/* Account ID */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Account ID</p>
                <p className="text-lg font-mono font-semibold text-foreground break-all">{selectedAccountData.id}</p>
              </div>

              {/* Suspicion Score */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Suspicion Score</p>
                  <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30">
                    {selectedAccountData.suspicionScore}
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-[#EF4444]"
                    style={{ width: `${selectedAccountData.suspicionScore}%` }}
                  />
                </div>
              </div>

              {/* Detected Patterns */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-3">Detected Patterns</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAccountData.patterns.map((pattern: string, idx: number) => (
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
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Total Transactions</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {selectedAccountData.totalTransactions}
                    </span>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-muted-foreground">Fan-In (Incoming)</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {selectedAccountData.fanIn}
                    </span>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">Fan-Out (Outgoing)</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {selectedAccountData.fanOut}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Flow Preview */}
              <div className="mt-6 bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-3">Recent Transaction Pattern</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                    <span className="text-muted-foreground font-mono truncate max-w-[80px]">ACC{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}</span>
                    <span className="text-muted-foreground shrink-0">→</span>
                    <span className="text-foreground font-mono truncate max-w-[80px]">{selectedAccountData.id}</span>
                    <span className="ml-auto text-muted-foreground shrink-0">$250.00</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-destructive shrink-0"></div>
                    <span className="text-foreground font-mono truncate max-w-[80px]">{selectedAccountData.id}</span>
                    <span className="text-muted-foreground shrink-0">→</span>
                    <span className="text-muted-foreground font-mono truncate max-w-[80px]">ACC{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}</span>
                    <span className="ml-auto text-muted-foreground shrink-0">$245.00</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-destructive shrink-0"></div>
                    <span className="text-foreground font-mono truncate max-w-[80px]">{selectedAccountData.id}</span>
                    <span className="text-muted-foreground shrink-0">→</span>
                    <span className="text-[#64748B] font-mono truncate max-w-[80px]">ACC{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}</span>
                    <span className="ml-auto text-[#94A3B8] shrink-0">$240.00</span>
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