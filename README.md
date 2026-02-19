# RIFT Financial Forensics Engine: Money Muling Ring Detection

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## Project Title
**RIFT Financial Forensics Engine: Money Muling Ring Detection**

## Live Demo URL
[Live Demo Placeholder](https://money-muling-detector.demo-placeholder.com)

## Tech Stack
### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Data Processing**: [Pandas](https://pandas.pydata.org/)
- **Graph Analytics**: [NetworkX](https://networkx.org/)
- **Server**: [Uvicorn](https://www.uvicorn.org/)

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) & [Tailwind CSS](https://tailwindcss.com/)
- **Visualization**: [React Flow](https://reactflow.dev/) (formerly Vis-Network)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [Next Themes](https://github.com/pacocoursey/next-themes)

---

## System Architecture
The RIFT system architecture is designed for high-performance financial crime detection through a decoupled frontend-backend model:

1.  **Ingestion Layer**: Sanitizes and validates CSV transaction data.
2.  **Graph Engine**: Constructs a directed multi-graph where nodes are accounts and edges are transactions.
3.  **Detection Layer**: Runs parallelizable deterministic algorithms to identify clusters (Rings).
4.  **Scoring Engine**: Evaluates individual account risk based on behavioral and structural patterns.
5.  **Visualization Layer**: An interactive React-based dashboard for exploring detected rings and account flows.

---

## Algorithm Approach (Complexity Analysis)

| Algorithm | Description | Complexity |
| :--- | :--- | :--- |
| **Cycle Detection** | Uses depth-limited DFS to find circular fund movements (muling cycles). Canonicalization prevents duplicates. | $O(V \cdot (\text{avg\_degree}^{\text{depth}}))$ |
| **Fan-In / Fan-Out** | Uses sliding window analysis (72h default) to detect rapid fund consolidation or dispersal. | $O(E \log E + E)$ |
| **Shell Chain Detection** | Identifies linear paths of low-activity accounts acting as transit points in layering. | $O(V_{\text{shell}} \cdot E_{\text{shell}})$ |
| **High Velocity** | Monitors bursts of high-frequency transactions from a single account. | $O(E)$ |

**Performance Goal**: Handles up to 10,000 transactions in under 30 seconds through adjacency list optimizations and efficient pruning.

---

## Suspicion Score Methodology
Scores are cumulative and capped at **100**.

### Positive Risk Factors
- **Involvement in Cycle**: +50 points
- **Short Cycle Bonus (3-5 hops)**: +15 points
- **Fan-In (Pass-through behavior)**: +40 points
- **Fan-Out (Pass-through behavior)**: +40 points
- **Shell Chain Member**: +30 points
- **High Velocity Burst**: +15 points
- **High Volume Bonus**: $min(20, 2 \cdot \log_{10}(\text{total\_volume}))$

### Trust & Mitigation Factors
- **Duration Penalty**: -30 points if account activity spans $>7$ days with no structural structural patterns.
- **Trust Caps**: Merchant/Payroll-like behavior caps the score at **40** to reduce false positives.

---

## Installation & Setup

### Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install requirements:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the FastAPI server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

## Usage Instructions
1.  **Upload**: Upload a transaction CSV (Required columns: `from_account`, `to_account`, `amount`, `timestamp`).
2.  **Monitor**: Review the summary dashboard for high-risk accounts and active fraud rings.
3.  **Explore**: Use the **Graph View** to interactively visualize the flow of funds within specific rings.
4.  **Export**: Download the full analysis report in JSON format for external auditing.

---

## Deployment with Docker (Monolithic)

The easiest way to deploy the entire application (frontend + backend) is using the monolithic root Dockerfile. This is ideal for platforms like Render, Railway, or AWS.

1.  **Build the Image**:
    ```bash
    docker build -t rift-forensics .
    ```
2.  **Run the Container**:
    ```bash
    docker run -p 8000:8000 rift-forensics
    ```
3.  **Access the App**: Open `http://localhost:8000` in your browser.

---

## Alternative: Docker Compose (Development)
If you prefer running services separately (e.g., for local development with hot-reloading):

1.  **Start Services**:
    ```bash
    docker-compose up --build
    ```
2.  **Access**:
    - Frontend: `http://localhost`
    - Backend API: `http://localhost:8000`

---

## Known Limitations
- Graph visualization is optimized for up to 2,000 nodes; performance may degrade beyond this without clustering.
- Real-time streaming ingestion is currently not supported (batch processing only).

---

## Team Members
- **Arjav Jain**
- **Kushagra Pandey**
- **Prince Singh**
