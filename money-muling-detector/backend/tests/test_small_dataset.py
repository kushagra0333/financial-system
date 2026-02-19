import pytest
import pandas as pd
import sys
import os
import io

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../app'))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.model.graph_builder import build_graph
from app.model.scoring import analyze_graph

def test_small_dataset_logic():
    # Load sample CSV content
    csv_content = """transaction_id,sender_id,receiver_id,amount,timestamp
T1,A,B,100.00,2026-02-01 10:00:00
T2,B,C,90.00,2026-02-01 11:00:00
T3,C,A,95.00,2026-02-01 12:00:00
T4,D,E,10.00,2026-02-02 09:00:00
T5,F,E,12.00,2026-02-03 08:00:00
T6,G,E,11.00,2026-02-03 09:00:00
T7,H,E,13.00,2026-02-03 10:00:00
T8,I,E,14.00,2026-02-03 11:00:00
T9,J,E,15.00,2026-02-03 12:00:00
T10,K,E,9.00,2026-02-03 13:00:00
T11,L,E,8.00,2026-02-03 14:00:00
T12,M,E,7.00,2026-02-03 15:00:00
T13,N,O,5.00,2026-02-04 10:00:00
T14,O,P,5.00,2026-02-04 11:00:00
T15,P,Q,5.00,2026-02-04 12:00:00
"""
    df = pd.read_csv(io.StringIO(csv_content))
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    G = build_graph(df)
    suspicious, rings = analyze_graph(G, df)
    
    # 1. Check Cycle A-B-C
    # A, B, C should be in a ring
    cycle_ring = next((r for r in rings if r['pattern_type'] == 'cycle'), None)
    assert cycle_ring is not None
    assert set(cycle_ring['member_accounts']) == {'A', 'B', 'C'}
    
    # Check individual suspicions
    a_susp = next((s for s in suspicious if s['account_id'] == 'A'), None)
    assert a_susp is not None
    assert 'cycle_length_3' in a_susp['detected_patterns']
    # Score: Cycle (40) + Length 3 (10) = 50.
    assert a_susp['suspicion_score'] == 50.00

    # 2. Check Shell Chain N-O-P-Q
    shell_ring = next((r for r in rings if r['pattern_type'] == 'shell_chain'), None)
    assert shell_ring is not None
    assert set(shell_ring['member_accounts']) == {'N', 'O', 'P', 'Q'}
    
    # O, P are Shell Nodes. Score +20.
    # N, Q are ends. They are NOT shell nodes unless they have low degree too.
    # N has out=1, in=0 (in sample). Total 1. So N is shell node candidate?
    # Yes, degree <= 3.
    # Q has in=1, out=0. Total 1. So Q is shell node candidate? Yes.
    # So N, O, P, Q should all get +20 if included in shell chain logic?
    # Prompt: "If node flagged shell_node (intermediate in a shell chain): score += 20".
    # Only "intermediate".
    # Intermediates of N->O->P->Q are O, P.
    # So O, P get +20. N, Q get 0 (unless they cycle etc).
    
    o_susp = next((s for s in suspicious if s['account_id'] == 'O'), None)
    assert o_susp is not None
    assert 'shell' in o_susp['detected_patterns']
    # Score: Shell (20). Correct.
    
    # 3. Check Fan-In E
    # In sample provided in prompt (T1..T15), E has 9 distinct senders.
    # So Fan-In < 10. Should NOT be detected.
    e_susp = next((s for s in suspicious if s['account_id'] == 'E'), None)
    # E has 0 score. Is it in suspicious list? 
    # Logic: score > 0 -> add to list.
    # if E has 0, it won't be in list.
    assert e_susp is None 
