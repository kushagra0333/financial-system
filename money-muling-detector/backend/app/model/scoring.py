from .cycle_detector import detect_cycles
from .fan_detector import detect_fan_patterns, detect_high_velocity, calculate_fan_counts
from .shell_detector import detect_shell_chains
import networkx as nx
import math
from datetime import timedelta

def analyze_graph(G: nx.DiGraph, df):
    """
    Orchestrates detection and scoring.
    """
    
    # 1. Detect Patterns
    cycles = detect_cycles(G)
    fan_in_nodes, fan_out_nodes = detect_fan_patterns(G)
    fan_in_counts, fan_out_counts = calculate_fan_counts(G)
    high_velocity = detect_high_velocity(G)
    shell_chains = detect_shell_chains(G, df) # Returns list of dicts with members
    
    # 2. Build Account Metadata
    # We need to track which patterns each account is involved in
    account_info = {n: {
        'patterns': set(), 
        'in_cycle': False,
        'rings': []  # list of (ring_id, score) to pick best later
    } for n in G.nodes()}
    
    # Initialize Global Ring List
    # Order: Cycles, then Fan In/Out, then Shell
    all_rings = []
    
    # Helper to create ring ID
    def next_ring_id():
        return f"RING_{len(all_rings) + 1:03d}"
    
    # Process Cycles
    for cycle in cycles:
        rid = next_ring_id()
        ring_data = {
            "ring_id": rid,
            "member_accounts": list(cycle),
            "pattern_type": "cycle",
            "base_score": 0 # to be calc
        }
        all_rings.append(ring_data)
        
        for node in cycle:
            account_info[node]['in_cycle'] = True
            if len(cycle) == 3:
                account_info[node]['patterns'].add('cycle_length_3')
            else:
                account_info[node]['patterns'].add('cycle') # Generic or specific? Prompt says "cycle_length_3" is a token. others implicitly
            account_info[node]['rings'].append(rid)

    # Process Fan In/Out
    # We need to construct these groups.
    # Re-scan fan nodes to build groups
    for node in fan_in_nodes:
        account_info[node]['patterns'].add('fan_in')
        if not account_info[node]['in_cycle']:
            # Create a ring
            members = [node] + sorted(list(G.predecessors(node)))
            rid = next_ring_id()
            all_rings.append({
                "ring_id": rid,
                "member_accounts": members,
                "pattern_type": "fan_in"
            })
            for m in members:
                account_info[m]['rings'].append(rid) # Members join the ring

    for node in fan_out_nodes:
        account_info[node]['patterns'].add('fan_out')
        if not account_info[node]['in_cycle']:
            members = [node] + sorted(list(G.successors(node)))
            rid = next_ring_id()
            all_rings.append({
                "ring_id": rid,
                "member_accounts": members,
                "pattern_type": "fan_out"
            })
            for m in members:
                account_info[m]['rings'].append(rid)

    # Process Shell Chains
    for chain in shell_chains:
        # If any node in the chain is in a cycle, maybe we skip creating a NEW ring?
        is_overlapping = any(account_info[m]['in_cycle'] for m in chain['members'])
        
        if not is_overlapping:
            rid = next_ring_id()
            all_rings.append({
                "ring_id": rid,
                "member_accounts": chain['members'],
                "pattern_type": "shell_chain"
            })
            for m in chain['members']:
                account_info[m]['patterns'].add('shell') # intermediate nodes get +20
                account_info[m]['rings'].append(rid)

    # High Velocity
    for node in high_velocity:
        account_info[node]['patterns'].add('high_velocity')
        
        # Create a specific ring for High Velocity to ensure ring_id exists
        rid = next_ring_id()
        all_rings.append({
            "ring_id": rid,
            "member_accounts": [node],
            "pattern_type": "high_velocity"
        })
        account_info[node]['rings'].append(rid)

    # 3. Calculate Scores
    scores = {}
    
    # Pre-calc durations for reduction rule
    node_durations = {}
    for node in G.nodes():
        timestamps = []
        for p in G.predecessors(node):
            for t in G[p][node]['transactions']: timestamps.append(t['timestamp'])
        for s in G.successors(node):
            for t in G[node][s]['transactions']: timestamps.append(t['timestamp'])
        
        if timestamps:
            spread = max(timestamps) - min(timestamps)
        else:
            spread = timedelta(0)
        node_durations[node] = spread

    suspicious_list = []
    
    for node in G.nodes():
        score = 0
        pats = account_info[node]['patterns']
        
        in_cycle = account_info[node]['in_cycle']
        
        if in_cycle:
            score += 40
            if 'cycle_length_3' in pats:
                score += 10
        
        if 'fan_in' in pats: score += 25
        if 'fan_out' in pats: score += 25
        if 'shell' in pats: score += 20
        if 'high_velocity' in pats: score += 15
        
        # Reduction Rule
        is_temporal = ('fan_in' in pats) or ('fan_out' in pats) or ('high_velocity' in pats)
        
        if (not in_cycle) and (not is_temporal):
             if node_durations[node] > timedelta(days=7):
                 score -= 30
                 
        score = max(0, min(100, score))
        scores[node] = score
        
    # 4. Compute Ring Scores
    final_fraud_rings = []
    
    for r in all_rings:
        members = r['member_accounts']
        member_scores = [scores[m] for m in members]
        if not member_scores:
            avg_score = 0
        else:
            avg_score = sum(member_scores) / len(member_scores)
        
        r['risk_score'] = round(avg_score, 2)
        final_fraud_rings.append(r)
        
    # 5. Finalize Suspicious Accounts
    for node, score in scores.items():
        if score > 0:
            # Find best ring
            my_rings = account_info[node]['rings']
            if not my_rings:
                best_rid = None
            else:
                # Find ring with max risk_score
                candidate_rings = []
                for rid in my_rings:
                     robj = next(r for r in final_fraud_rings if r['ring_id'] == rid)
                     candidate_rings.append(robj)
                
                # Sort by risk_score desc, then ring_id asc
                candidate_rings.sort(key=lambda x: (-x['risk_score'], x['ring_id']))
                best_rid = candidate_rings[0]['ring_id']

            suspicious_list.append({
                "account_id": node,
                "suspicion_score": float(f"{score:.2f}"),
                "detected_patterns": sorted(list(account_info[node]['patterns'])),
                "ring_id": best_rid,
                "total_transactions": G.degree(node),
                "fan_in": len(list(G.predecessors(node))), # Approximate, keep for debug?
                "fan_in_count": fan_in_counts.get(node, 0),
                "fan_out_count": fan_out_counts.get(node, 0)
            })


    # Sort suspicious list
    suspicious_list.sort(key=lambda x: (-x['suspicion_score'], x['account_id']))
    
    return suspicious_list, final_fraud_rings

