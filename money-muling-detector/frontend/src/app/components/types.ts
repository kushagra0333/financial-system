export interface FraudRing {
    id: string;
    patternType: string;
    memberCount: number;
    riskScore: number;
    accounts: string[];
}

export interface SuspiciousAccount {
    id: string;
    suspicionScore: number;
    patterns: string[];
    totalTransactions: number;
    fanIn: number;
    fanOut: number;
}

export interface AnalysisData {
    totalAccounts: number;
    suspiciousAccounts: number;
    fraudRings: number;
    processingTime: number;
    rings: FraudRing[];
    accounts: SuspiciousAccount[];
}
