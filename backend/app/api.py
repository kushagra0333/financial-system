from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import io
import time
import uuid
from datetime import datetime
from .model.graph_builder import build_graph
from .model.scoring import analyze_graph
from .model.json_formatter import format_output
from .model.blockchain import audit_trail

router = APIRouter()

# In-memory storage for results (simple caching for download)
# Key: run_id, Value: result_dict
RESULTS_CACHE = {}

# Global in-memory storage
LATEST_DATA = {}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    start_time = time.time()
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV allowed.")
    
    try:
        content = await file.read()
        try:
             # Use engine='python' or default. Explicitly parse dates?
             # analyze_graph expects pandas df with 'timestamp' column
             df = pd.read_csv(io.BytesIO(content))
        except Exception:
             raise HTTPException(status_code=400, detail="Corrupt CSV file")

        # Validation & Normalization
        # Map frontend columns to backend columns if needed
        # Expected: transaction_id,sender_id,receiver_id,amount,timestamp
        # Frontend might send: from_account, to_account
        
        rename_map = {
            'from_account': 'sender_id',
            'to_account': 'receiver_id', 
            'from': 'sender_id',
            'to': 'receiver_id'
        }
        df.rename(columns=rename_map, inplace=True)
        
        # If transaction_id missing, generate it
        if 'transaction_id' not in df.columns:
             df['transaction_id'] = [f"TXN_{i}" for i in range(len(df))]
             
        required_cols = {'sender_id', 'receiver_id', 'amount'}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"Missing columns. Required: {required_cols}")
            
        # 1. Build Graph
        # Ensure timestamp is datetime before building graph (done in build_graph but good to be safe)
        if 'timestamp' in df.columns:
            if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
                try:
                    df['timestamp'] = pd.to_datetime(df['timestamp'])
                except:
                     pass
            # Strict parsing check removed to be more lenient with user uploads from UI
        else:
            # Create dummy timestamp if missing?
            # Algorithms rely on time.
            # "Processing requirement: ... specific tech stack ... algorithms"
            # Prompt algorithms rely on 72h window.
            # If no timestamp, assume all simultaneous or spread?
            # Let's generating mock timestamps if missing for valid demo?
            # Or fail.
            # "Input: CSV upload with columns ... timestamp"
            # I'll stick to failing if critical cols missing.
            raise HTTPException(status_code=400, detail="Missing timestamp column")

        G = build_graph(df)
        
        # 2. Analyze
        suspicious_accounts, fraud_rings = analyze_graph(G, df)
        
        # 3. Calculate Stats
        processing_time = time.time() - start_time
        rounded_time = round(processing_time, 2)
        
        # Calculate suspicious count based on score > 0 (or some threshold) to maintain metric meaning
        suspicious_count = sum(1 for acc in suspicious_accounts if acc['suspicion_score'] > 0)

        summary = {
            "total_accounts_analyzed": int(G.number_of_nodes()),
            "suspicious_accounts_flagged": suspicious_count,
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": rounded_time
        }
        
        # 'result' contains EVERYTHING (for Dashboard)
        result = format_output(suspicious_accounts, fraud_rings, summary)
        
        # Cache fully detailed result
        run_id = str(uuid.uuid4())
        RESULTS_CACHE[run_id] = result
        
        # Update LATEST_DATA for /ring endpoint
        LATEST_DATA['G'] = G
        LATEST_DATA['rings'] = fraud_rings
        LATEST_DATA['scores'] = {item['account_id']: item for item in suspicious_accounts}
        # Also map ring objects by ID for fast lookup
        LATEST_DATA['rings_map'] = {r['ring_id']: r for r in fraud_rings}
        
        # 4. Record in Blockchain (Audit Trail)
        audit_trail.add_block({
            "filename": file.filename,
            "summary": summary,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
        return JSONResponse(content=result, headers={"X-Run-ID": run_id})
        
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{run_id}")
async def download_json(run_id: str):
    if run_id not in RESULTS_CACHE:
        raise HTTPException(status_code=404, detail="Run ID not found")
        
    full_result = RESULTS_CACHE[run_id]
    
    # Filter for download: Only suspicious accounts
    # Creating a deep copy or just a new dictionary with filtered list
    
    suspicious_only = [
        acc for acc in full_result['suspicious_accounts'] 
        if acc['suspicion_score'] > 0 or acc['ring_id'] is not None
    ]
    
    filtered_result = {
        "suspicious_accounts": suspicious_only,
        "fraud_rings": full_result['fraud_rings'],
        "summary": full_result['summary']
    }
    
    return JSONResponse(content=filtered_result, media_type="application/json")

@router.get("/ring/{ring_id}")
async def get_ring_details(ring_id: str):
    if 'G' not in LATEST_DATA:
         raise HTTPException(status_code=404, detail="No data loaded. Please upload a file first.")
         
    G = LATEST_DATA['G']
    rings_map = LATEST_DATA.get('rings_map', {})
    
    target_ring = rings_map.get(ring_id)
    if not target_ring:
        raise HTTPException(status_code=404, detail="Ring not found")
        
    # Get only ring members
    members = set(target_ring['member_accounts'])
    subgraph_nodes = set(members)
    # User requested only ring members, so we do NOT add neighbors
    # for m in members:
    #     if m in G:
    #         subgraph_nodes.update(G.predecessors(m))
    #         subgraph_nodes.update(G.successors(m))
            
    # Build response
    nodes = []
    edges = []
    
    # We want to show all nodes in subgraph
    for n in subgraph_nodes:
        # Score data
        score_info = LATEST_DATA['scores'].get(n)
        score = score_info['suspicion_score'] if score_info else 0.0
        patterns = score_info['detected_patterns'] if score_info else []
        
        # Calculate total txns for this node (global)
        in_deg = G.in_degree(n) if n in G else 0
        out_deg = G.out_degree(n) if n in G else 0
        total_tx = in_deg + out_deg
        
        nodes.append({
            "id": n,
            "data": { "label": n }, # ReactFlow format
            "suspicionScore": score,
            "patterns": patterns,
            "totalTransactions": total_tx,
            "fanIn": in_deg,
            "fanOut": out_deg,
            "isMember": n in members
        })
        
    # Edges within subgraph
    for u in subgraph_nodes:
        if u not in G: continue
        for v in G.successors(u):
            if v in subgraph_nodes:
                # Add all edges
                for tx in G[u][v]['transactions']:
                     edges.append({
                         "id": f"{u}-{v}-{tx['transaction_id']}",
                         "source": u,
                         "target": v,
                         "amount": tx['amount'],
                         "timestamp": tx['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
                         "transaction_id": tx['transaction_id']
                     })
                
    return {
        "ringId": ring_id,
        "patternType": target_ring['pattern_type'],
        "riskScore": target_ring['risk_score'],
        "nodes": nodes,
        "edges": edges
    }

@router.get("/account/{account_id}")
async def get_account_details(account_id: str):
    if 'G' not in LATEST_DATA:
         raise HTTPException(status_code=404, detail="No data loaded. Please upload a file first.")
         
    G = LATEST_DATA['G']
    scores = LATEST_DATA.get('scores', {})
    
    if account_id not in G:
        raise HTTPException(status_code=404, detail="Account not found")
        
    # Get Score Data
    score_info = scores.get(account_id)
    if not score_info:
        # Should not happen if in G, but handle safely
        score_info = {
            "suspicion_score": 0,
            "score_breakdown": [],
            "detected_patterns": []
        }
        
    # Get Transactions (In and Out)
    transactions = []
    
    # Incoming
    for pred in G.predecessors(account_id):
        for tx in G[pred][account_id]['transactions']:
            transactions.append({
                "id": tx['transaction_id'],
                "date": tx['timestamp'].strftime('%Y-%m-%d %H:%M'),
                "counterparty": pred,
                "type": "Incoming",
                "amount": tx['amount']
            })
            
    # Outgoing
    for succ in G.successors(account_id):
        for tx in G[account_id][succ]['transactions']:
            transactions.append({
                "id": tx['transaction_id'],
                "date": tx['timestamp'].strftime('%Y-%m-%d %H:%M'),
                "counterparty": succ,
                "type": "Outgoing",
                "amount": tx['amount']
            })
            
    # Sort by date desc
    transactions.sort(key=lambda x: x['date'], reverse=True)
    
    return {
        "accountId": account_id,
        "suspicionScore": score_info.get('suspicion_score', 0),
        "scoreBreakdown": score_info.get('score_breakdown', []),
        "detectedPatterns": score_info.get('detected_patterns', []),
        "recentTransactions": transactions[:50] # Limit to 50 recent
    }

@router.get("/blockchain")
async def get_blockchain():
    return {
        "chain": audit_trail.to_list(),
        "is_valid": audit_trail.is_chain_valid(),
        "length": len(audit_trail.chain)
    }

