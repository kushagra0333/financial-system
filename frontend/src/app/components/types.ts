export interface FraudRing {
    ring_id: string;
    pattern_type: string;
    risk_score: number;
    member_accounts: string[];
}

export interface SuspiciousAccount {
    account_id: string;
    suspicion_score: number;
    detected_patterns: string[];
    total_transactions: number;
    fan_in: number;
    fan_out: number;
    ring_id?: string;
    score_breakdown?: { reason: string; points: number }[];
}

export interface AnalysisSummary {
    total_accounts_analyzed: number;
    suspicious_accounts_flagged: number;
    fraud_rings_detected: number;
    processing_time_seconds: number;
}

export interface AnalysisData {
    summary: AnalysisSummary;
    suspicious_accounts: SuspiciousAccount[];
    fraud_rings: FraudRing[];
    // Keeping these aliases for now if needed, or better, remove them and fix call sites
    // The previous interface had flat properties for summary stats. 
    // New one nests them in 'summary'.
}
