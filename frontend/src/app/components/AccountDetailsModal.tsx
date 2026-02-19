import { useState, useEffect } from "react";
import { X, Shield, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../config";

interface Transaction {
    id: string;
    date: string;
    counterparty: string;
    type: "Incoming" | "Outgoing";
    amount: number;
}

interface ScoreBreakdownItem {
    reason: string;
    points: number;
}

interface AccountDetailsData {
    accountId: string;
    suspicionScore: number;
    scoreBreakdown: ScoreBreakdownItem[];
    detectedPatterns: string[];
    recentTransactions: Transaction[];
}

interface AccountDetailsModalProps {
    accountId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AccountDetailsModal({ accountId, isOpen, onClose }: AccountDetailsModalProps) {
    const [data, setData] = useState<AccountDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && accountId) {
            fetchAccountDetails(accountId);
        } else {
            setData(null);
        }
    }, [isOpen, accountId]);

    const fetchAccountDetails = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/account/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch account details");
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto rounded-xl border border-border shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Shield className="w-6 h-6 text-primary" />
                            Account Analysis
                        </h2>
                        <p className="text-muted-foreground font-mono mt-1">{accountId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-4 md:p-6 space-y-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-destructive">
                            <p>{error}</p>
                        </div>
                    ) : data ? (
                        <>
                            {/* Score Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 bg-secondary/50 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-border">
                                    <div className="relative mb-4">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="60"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                className="text-secondary"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="60"
                                                stroke={data.suspicionScore > 75 ? "#EF4444" : data.suspicionScore > 50 ? "#F59E0B" : "#10B981"}
                                                strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray={377}
                                                strokeDashoffset={377 - (377 * data.suspicionScore) / 100}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-3xl font-bold text-foreground">{data.suspicionScore}</span>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Risk Score</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {data.detectedPatterns.map((pat, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-background border border-border rounded text-xs text-muted-foreground font-mono">
                                                {pat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-primary" />
                                        Score Breakdown
                                    </h3>
                                    <div className="bg-card border border-border rounded-lg overflow-hidden overflow-x-auto">
                                        <table className="w-full text-sm min-w-[400px] md:min-w-0">
                                            <thead className="bg-secondary/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Risk Factor</th>
                                                    <th className="px-4 py-3 text-right text-muted-foreground font-medium">Points</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {data.scoreBreakdown.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-secondary/20">
                                                        <td className="px-4 py-3 text-foreground">{item.reason}</td>
                                                        <td className={`px-4 py-3 text-right font-mono font-medium ${item.points > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                                                            {item.points > 0 ? '+' : ''}{item.points}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {data.scoreBreakdown.length === 0 && (
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-3 text-center text-muted-foreground">No specific risk factors identified.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                                <div className="bg-card border border-border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto overflow-x-auto">
                                    <table className="w-full text-sm min-w-[500px] md:min-w-0">
                                        <thead className="bg-secondary/50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Date</th>
                                                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Type</th>
                                                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Counterparty</th>
                                                <th className="px-4 py-3 text-right text-muted-foreground font-medium">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {data.recentTransactions.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-secondary/20">
                                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${tx.type === 'Incoming'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : 'bg-destructive/10 text-destructive'
                                                            }`}>
                                                            {tx.type === 'Incoming' ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-foreground">{tx.counterparty}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-foreground">
                                                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                            {data.recentTransactions.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No recent transactions found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
