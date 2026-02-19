# Money Muling Detection Web App

## Title
**Financial Forensics Engine: Money Muling Ring Detection**

## Live Demo URL
[Live Demo Placeholder](https://money-muling-detector.demo-placeholder.com)

## Tech Stack
*   **Backend**: Python 3.10+, FastAPI, Uvicorn, Pandas, NetworkX
*   **Frontend**: React (Vite), Vis-Network, Axios, CSS Modules
*   **Algorithms**: Deterministic Graph Traversal (DFS/BFS), Sliding Window Analysis

## System Architecture
The system consists of a Python backend service and a React single-page application (SPA).

1.  **Backend**:
    *   Exposes REST endpoints via FastAPI (`/upload`, `/download`, `/ring`).
    *   Processes CSV uploads into a directed graph structure.
    *   Executes deterministic detection algorithms sequentially (Cycles -> Fan-in/out -> Shell Chains).
    *   Calculates suspicion scores based on weighted pattern detection.
    *   Returns JSON results matching a strict schema.

2.  **Frontend**:
    *   Provides a file upload interface for transaction CSVs.
    *   Displays real-time analysis summaries and suspicion lists.
    *   Enables detailed exploration of fraud rings via interactive graph visualization.
    *   Downloads analysis reports in JSON format.

## Algorithm Approach (Complexity Analysis)

1.  **Graph Construction**: Builds an adjacency list representation using NetworkX. Time: O(E), Space: O(V+E).
2.  **Cycle Detection**: Deterministic depth-limited DFS (depth 3-5). Time: O(V * (d^depth)) in worst case, but practically constrained by node degree (d) and time limits. We optimize by canonicalizing cycles to avoid duplicates.
3.  **Fan-in / Fan-out**: Sliding window (72h) over sorted transaction lists per node. Time: O(E * log E) for sorting + O(E) linear scan per node.
4.  **Shell Chain Detection**: Identifies paths of length ≥ 3 with low-activity intermediate nodes. Time: O(V_shell * E_shell) using DFS on the subgraph of low-degree nodes.
5.  **Performance**: Designed to handle 10,000 transactions within 30 seconds by using efficient data structures and non-blocking I/O where possible.

## Suspicion Score Methodology
Scores are calculated deterministically (capped at 100):
*   **Base Score**: 0
*   **Cycle Participation**: +40 points (+10 bonus if cycle length is 3)
*   **Fan-In / Fan-Out**: +25 points
*   **Shell Node**: +20 points
*   **High Velocity**: +15 points
*   **False Positive Reduction**: -30 points if node is not in a cycle, has no temporal bursts, and activity spans > 7 days.

## Installation & Setup

### Backend
1.  Navigate to `backend/`:
    ```bash
    cd money-muling-detector/backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run tests:
    ```bash
    pytest tests/
    ```
4.  Start server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend
1.  Navigate to `frontend/`:
    ```bash
    cd money-muling-detector/frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```

## Usage Instructions
1.  Open the frontend (default: `http://localhost:5173`).
2.  Upload a CSV file containing transactions (columns: `transaction_id,sender_id,receiver_id,amount,timestamp`).
3.  View the summary dashboard and list of suspicious accounts.
4.  Click on a Ring ID to visualize the transaction graph structure.
5.  Click "Download JSON" to get the detailed analysis report.

## Deployment Guidelines
*   **Backend (Render)**: Deploy as a Python Web Service. Set build command `pip install -r requirements.txt` and start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Ensure Python 3.10+ environment.
*   **Frontend (Vercel)**: Deploy as a Vite project. Override build command: `npm run build`. Output directory: `dist`.

## Known Limitations
*   Graph visualization may lag with >2000 simultaneous nodes (optimization: cluster viewing).
*   Large file uploads (>10MB) depend on network speed and server memory limits.

## Team Members
*   Arjav Jain (AI Assistant)
