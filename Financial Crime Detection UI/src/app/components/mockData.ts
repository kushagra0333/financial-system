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

// Mock data generator
export const generateMockData = (): AnalysisData => {
  const rings: FraudRing[] = [
    {
      id: "RING-001",
      patternType: "Circular Transfer",
      memberCount: 8,
      riskScore: 94,
      accounts: ["ACC001234", "ACC001567", "ACC001892", "ACC002134", "ACC002456", "ACC002789", "ACC003012", "ACC003345"]
    },
    {
      id: "RING-002",
      patternType: "Rapid Distribution",
      memberCount: 5,
      riskScore: 87,
      accounts: ["ACC004567", "ACC004890", "ACC005123", "ACC005456", "ACC005789"]
    },
    {
      id: "RING-003",
      patternType: "Star Pattern",
      memberCount: 12,
      riskScore: 82,
      accounts: ["ACC006012", "ACC006345", "ACC006678", "ACC006901", "ACC007234", "ACC007567", "ACC007890", "ACC008123", "ACC008456", "ACC008789", "ACC009012", "ACC009345"]
    },
    {
      id: "RING-004",
      patternType: "Layered Smurfing",
      memberCount: 6,
      riskScore: 78,
      accounts: ["ACC010678", "ACC010901", "ACC011234", "ACC011567", "ACC011890", "ACC012123"]
    },
    {
      id: "RING-005",
      patternType: "Value Averaging",
      memberCount: 4,
      riskScore: 71,
      accounts: ["ACC013456", "ACC013789", "ACC014012", "ACC014345"]
    }
  ];

  const accounts: SuspiciousAccount[] = [
    {
      id: "ACC001234",
      suspicionScore: 94,
      patterns: ["Circular Transfer", "High Velocity"],
      totalTransactions: 156,
      fanIn: 7,
      fanOut: 7
    },
    {
      id: "ACC004567",
      suspicionScore: 87,
      patterns: ["Rapid Distribution", "Round Amount"],
      totalTransactions: 89,
      fanIn: 1,
      fanOut: 12
    },
    {
      id: "ACC006012",
      suspicionScore: 82,
      patterns: ["Star Pattern", "Hub Account"],
      totalTransactions: 234,
      fanIn: 15,
      fanOut: 15
    },
    {
      id: "ACC010678",
      suspicionScore: 78,
      patterns: ["Layered Smurfing"],
      totalTransactions: 67,
      fanIn: 3,
      fanOut: 8
    },
    {
      id: "ACC013456",
      suspicionScore: 71,
      patterns: ["Value Averaging"],
      totalTransactions: 45,
      fanIn: 2,
      fanOut: 3
    },
    {
      id: "ACC002456",
      suspicionScore: 68,
      patterns: ["Circular Transfer"],
      totalTransactions: 78,
      fanIn: 4,
      fanOut: 4
    },
    {
      id: "ACC005123",
      suspicionScore: 64,
      patterns: ["Rapid Distribution"],
      totalTransactions: 56,
      fanIn: 2,
      fanOut: 6
    },
    {
      id: "ACC007234",
      suspicionScore: 59,
      patterns: ["Star Pattern"],
      totalTransactions: 89,
      fanIn: 8,
      fanOut: 9
    }
  ];

  return {
    totalAccounts: 2847,
    suspiciousAccounts: accounts.length,
    fraudRings: rings.length,
    processingTime: 2.34,
    rings,
    accounts
  };
};
