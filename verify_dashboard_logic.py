7

import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.model.scoring import analyze_graph
import networkx as nx
import pandas as pd

def test_logic():
    print("Testing scoring.py logic...")
    
    # Create simple graph with 1 suspicious cycle and 1 isolated innocent node
    df = pd.DataFrame([
        {'sender_id': 'A', 'receiver_id': 'B', 'amount': 100, 'timestamp': '2023-01-01', 'transaction_id': '1'},
        {'sender_id': 'B', 'receiver_id': 'C', 'amount': 100, 'timestamp': '2023-01-01', 'transaction_id': '2'},
        {'sender_id': 'C', 'receiver_id': 'A', 'amount': 100, 'timestamp': '2023-01-01', 'transaction_id': '3'},
        {'sender_id': 'X', 'receiver_id': 'Y', 'amount': 50, 'timestamp': '2023-01-01', 'transaction_id': '4'}
    ])
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Mock Graph
    G = nx.DiGraph()
    for _, row in df.iterrows():
        G.add_edge(row['sender_id'], row['receiver_id'], transactions=[row.to_dict()])
        
    suspicious_accounts, rings = analyze_graph(G, df)
    
    # Check if ALL accounts are present (A, B, C, X, Y)
    found_ids = sorted([acc['account_id'] for acc in suspicious_accounts])
    all_ids = sorted(['A', 'B', 'C', 'X', 'Y'])
    
    print(f"Found IDs: {found_ids}")
    
    if found_ids == all_ids:
        print("PASS: analyze_graph returns ALL accounts.")
    else:
        print(f"FAIL: analyze_graph returned {found_ids}, expected {all_ids}")
        
    # Check filtering logic (simulation of api.py)
    print("\nTesting API filtering logic...")
    
    filtered_for_download = [
        acc for acc in suspicious_accounts
        if acc['suspicion_score'] > 0 or acc['ring_id'] is not None
    ]
    
    filtered_ids = sorted([acc['account_id'] for acc in filtered_for_download])
    expected_suspicious = sorted(['A', 'B', 'C']) # Cycle
    
    print(f"Filtered IDs: {filtered_ids}")
    
    # X and Y might have score 0 or very low. 
    # Let's check their scores.
    for acc in suspicious_accounts:
        if acc['account_id'] in ['X', 'Y']:
            print(f"Account {acc['account_id']} score: {acc['suspicion_score']}")
            
    if filtered_ids == expected_suspicious:
        print("PASS: Download filtering removes innocent accounts.")
    else:
        print(f"FAIL: Filtered list is {filtered_ids}, expected {expected_suspicious}")

if __name__ == "__main__":
    test_logic()
