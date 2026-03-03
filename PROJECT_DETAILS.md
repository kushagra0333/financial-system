# RIFT Financial Forensics Engine: Comprehensive Overview

## 1. Project Vision
RIFT (Rapid Investigation of Fraudulent Transactions) is a state-of-the-art graph-based forensics engine designed to detect "Money Muling" rings. While traditional systems flag individual suspicious transactions, RIFT uncovers the **underlying networks**—the rings, chains, and cycles that money mules use to layer and launder funds.

---

## 2. Technical Architecture
The system follows a modular, high-performance architecture optimized for large transaction datasets.

### A. The Data Ingestion Layer (Python/Pandas)
- Handles raw CSV uploads.
- Performs schema validation and temporal normalization.
- Maps diverse transaction formats into a standardized internal model.

### B. The Graph Engine (NetworkX)
- Transaction data is transformed into a **Directed Multi-Graph**.
- **Nodes**: Bank accounts (with associated risk metadata).
- **Edges**: Individual transactions (carrying amount, timestamp, and metadata).
- This structure allows us to move beyond row-based analysis to structural relationship analysis.

### C. The Detection Suite (Core Algorithms)
1. **Cycle Detection (Circular Routing)**: Detects when funds leave an account and return via a path of 3–10 intermediate nodes. This is a classic muling signature.
2. **Fan-In / Fan-Out (Aggregators & Distributors)**: Uses temporal windows to detect accounts receiving from many sources (aggregators) or dispersing to many destinations (distributors) in rapid succession.
3. **Shell Chain Detection (Layering)**: Identifies long, linear paths of low-activity accounts acting as transit points in layering.
4. **High Velocity Burst**: Detects accounts with extremely high transaction frequency that deviates from normal human or business behavior.

### D. The Scoring Engine (Weights & Dampeners)
Every account is assigned a **Suspicion Score (0-100)** calculated through a weighted formula:
- **Structural Weight**: Points for being part of a Cycle (+50) or Shell Chain (+30).
- **Behavioral Weight**: Points for High Velocity (+15) or Pass-through behavior (+40).
- **Volume Boost**: Logarithmic scale boost for high-value flows.
- **Trust Dampeners**: Reduces scores for slow transaction spreads or business-like patterns (Merchant/Payroll) to minimize false positives.

### E. Proof of Integrity (Blockchain Audit)
Once a report is generated, its summary is cryptographically "sealed" in a custom **Private Blockchain**. 
- Each forensic report creates a block containing a SHA-256 hash of the results and the previous block's hash.
- This creates an immutable audit trail, proving that the forensic evidence has not been altered since the moment of discovery.

### F. Visualization Layer (React / React Flow)
- A modern, high-fidelity dark-themed dashboard.
- **Interactive Graph Canvas**: Allows investigators to drag nodes, zoom into networks, and physically "see" the fraud rings.
- **Real-time Stats**: Processing 10,000+ transactions in <30s with instant summary updates.

---

## 3. High-Level Flow
1. **INPUT**: Investigator uploads a batch of transaction data.
2. **ANALYZE**: Engine builds the graph and runs detection algorithms in parallel.
3. **SCORE**: Accounts are ranked by risk; networks are grouped into "Fraud Rings."
4. **SEAL**: The analysis results are logged to the Blockchain for audit compliance.
5. **OUTPUT**: Interactive dashboard displays high-risk targets for immediate action.

---

## 4. Professional Video Script (2-Minute Pitch)

**[0:00 - 0:15] Intro & The Problem**
*(Visual: Close up of a dark, high-tech dashboard interface with flickering data)*
"Every year, billions of dollars are laundered through complex money muling networks. Traditional bank alerts catch the 'leaf nodes'—the individual mules—but the 'roots'—the criminal rings—remain hidden in plain sight. Meet RIFT: the Financial Forensics Engine designed to see the invisible."

**[0:15 - 0:45] The Core Technology**
*(Visual: Animation of nodes connecting into a circle, then a complex web)*
"RIFT isn't just looking at transactions; it's looking at relationships. By transforming raw bank data into a Directed Multi-Graph, our engine runs deep-cycle detection and shell-chain algorithms to uncover circular fund routing and layering patterns. We don't just find a suspicious account; we find the entire fraud ring."

**[0:45 - 1:15] The Scoring & Intelligence**
*(Visual: Screen recording showing the Dashboard with 'Suspicion Scores' ranking accounts)*
"Our proprietary scoring logic combines structural graph patterns with behavioral analysis. We apply logarithmic volume boosts and trust dampeners to separate legitimate business activity from high-risk muling. The result? A clear, ranked list of targets for forensic investigators, processed at scale—10,000 transactions in under 30 seconds."

**[1:15 - 1:45] Security & The Blockchain**
*(Visual: Switch to the 'Blockchain Audit' tab, showing 'Verified' badges and hashes)*
"In forensics, integrity is everything. RIFT integrates a custom blockchain audit trail. Every report generated is cryptographically sealed and linked to the previous one using SHA-256 hashing. This creates an immutable 'Proof of Integrity,' ensuring that your evidence is court-ready and tamper-proof."

**[1:45 - 2:00] Conclusion**
*(Visual:" Logo animation with 'RIFT: Seeing the Network')*
"Fast. Scalable. Immutable. RIFT moves financial forensics from 'what happened' to 'who is behind it.' Discover the network. Stop the cycle. This is RIFT.
