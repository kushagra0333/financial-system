import { useState, useEffect } from "react";
import { Shield, CheckCircle2, AlertCircle, Database, Link as LinkIcon, Clock, FileText, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { API_BASE_URL } from "../config";

interface Block {
    index: number;
    timestamp: number;
    data: {
        filename?: string;
        summary?: {
            total_accounts_analyzed: number;
            suspicious_accounts_flagged: number;
            fraud_rings_detected: number;
            processing_time_seconds: number;
        };
        message?: string;
        timestamp?: string;
    };
    previous_hash: string;
    hash: string;
}

interface BlockchainResponse {
    chain: Block[];
    is_valid: boolean;
    length: number;
}

export function BlockchainAudit() {
    const [data, setData] = useState<BlockchainResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBlockchain();
    }, []);

    const fetchBlockchain = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/blockchain`);
            if (!response.ok) throw new Error("Failed to fetch audit trail");
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Activity className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Verifying Integrity...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Audit Synchronization Failed</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={fetchBlockchain}>Retry Sync</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Shield className="w-7 h-7 text-primary" />
                        Blockchain Audit Trail
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Immutable cryptographic record of forensic analysis reports.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className={`px-3 py-1 text-sm ${data?.is_valid ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
                        {data?.is_valid ? (
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Chain Verified
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4" /> Chain Compromised
                            </span>
                        )}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={fetchBlockchain} className="gap-2">
                        <Clock className="w-4 h-4" /> Refresh
                    </Button>
                </div>
            </div>

            <div className="relative">
                {/* Vertical Line for the chain */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-border to-transparent z-0" />

                <div className="space-y-8 relative z-10">
                    {data?.chain.slice().reverse().map((block) => (
                        <div key={block.hash} className="group flex gap-8">
                            <div className="flex-shrink-0 mt-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xl transition-all duration-300 ${block.index === 0 ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' : 'bg-card border-border group-hover:border-primary/50 text-muted-foreground group-hover:text-primary'}`}>
                                    {block.index === 0 ? <Database className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                                </div>
                            </div>

                            <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">BLOCK #{block.index}</span>
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {block.index === 0 ? "Genesis Block" : `Report: ${block.data.filename}`}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" /> {formatDate(block.timestamp)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Data Summary */}
                                    <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3 flex items-center gap-1.5">
                                            <FileText className="w-3 h-3" /> Audit Payload
                                        </p>
                                        {block.index === 0 ? (
                                            <p className="text-sm text-foreground italic">{block.data.message}</p>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Accounts Analyzed</span>
                                                    <span className="text-foreground font-medium">{block.data.summary?.total_accounts_analyzed}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Suspicious Flagged</span>
                                                    <span className="text-red-400 font-medium">{block.data.summary?.suspicious_accounts_flagged}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Fraud Rings</span>
                                                    <span className="text-amber-400 font-medium">{block.data.summary?.fraud_rings_detected}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cryptographic Proof */}
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Block Hash</p>
                                            <div className="font-mono text-[10px] break-all bg-background border border-border p-2 rounded text-primary">
                                                {block.hash}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">Previous Hash</p>
                                            <div className="font-mono text-[10px] break-all bg-background/50 border border-border/50 p-2 rounded text-muted-foreground">
                                                {block.previous_hash}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {block.index !== 0 && (
                                    <div className="mt-4 pt-4 border-t border-border flex justify-end">
                                        <Badge variant="outline" className="text-[10px] gap-1.5 border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10">
                                            <CheckCircle2 className="w-3 h-3" /> Cryptographically Sealed
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
