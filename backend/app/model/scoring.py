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
    fan_in_counts, fan_out_counts, fan_in_amounts, fan_out_amounts = calculate_fan_counts(G)
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
            if 3 <= len(cycle) <= 5:
                account_info[node]['patterns'].add('cycle_length_3_5')
            else:
                account_info[node]['patterns'].add('cycle') # Should not happen given detector limits
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
    scores_breakdown = {}
    
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
        breakdown = [] # List of {"reason": str, "points": float}
        pats = account_info[node]['patterns']
        
        in_cycle = account_info[node]['in_cycle']
        
        # --- Volume & Flow Analysis ---
        in_amt = fan_in_amounts.get(node, 0)
        out_amt = fan_out_amounts.get(node, 0)
        total_vol = in_amt + out_amt
        
        # Volume Score: Logarithmic scale
        vol_score = 0
        if total_vol > 0:
            vol_score = min(20, math.log10(total_vol) * 2)
        
        # Flow Ratio
        if in_amt > 0:
            flow_ratio = out_amt / in_amt
        else:
            flow_ratio = 999.0 # High value if no input
            
        is_pass_through = 0.9 <= flow_ratio <= 1.1
        is_merchant_like = flow_ratio < 0.1 and in_amt > 1000
        is_payroll_like = flow_ratio > 10.0 and out_amt > 1000
        
        # --- Scoring Logic ---
        
        # Base Pattern Scores
        if in_cycle:
            points = 50
            score += points
            breakdown.append({"reason": "In Cycle", "points": points})
            if 'cycle_length_3_5' in pats:
                points = 15
                score += points
                breakdown.append({"reason": "Short Cycle (3-5 hops)", "points": points})
        
        if 'fan_in' in pats:
            if is_merchant_like:
                points = 5
                score += points
                breakdown.append({"reason": "Fan In (Merchant-like)", "points": points})
            elif is_pass_through:
                points = 40
                score += points
                breakdown.append({"reason": "Fan In (Pass-through)", "points": points})
            else:
                points = 25
                score += points
                breakdown.append({"reason": "Fan In Pattern", "points": points})
                
        if 'fan_out' in pats:
            if is_payroll_like:
                points = 5
                score += points
                breakdown.append({"reason": "Fan Out (Payroll-like)", "points": points})
            elif is_pass_through:
                points = 40
                score += points
                breakdown.append({"reason": "Fan Out (Pass-through)", "points": points})
            else:
                points = 25
                score += points
                breakdown.append({"reason": "Fan Out Pattern", "points": points})
                
        if 'shell' in pats: 
            points = 30
            score += points
            breakdown.append({"reason": "Shell Chain Member", "points": points})
            if is_pass_through:
                points = 10
                score += points
                breakdown.append({"reason": "Shell Pass-through", "points": points})
            
        if 'high_velocity' in pats: 
            points = 15
            score += points
            breakdown.append({"reason": "High Velocity", "points": points})
        
        # Add Volume Score if suspicious
        if score > 20: 
            score += vol_score
            breakdown.append({"reason": f"High Volume (${total_vol:,.0f})", "points": round(vol_score, 1)})
            
        # Specific Pattern Boosts
        if is_pass_through and (in_cycle or 'shell' in pats):
            points = 10
            score += points
            breakdown.append({"reason": "Confirmed Mule Behavior", "points": points})
            
        # Reduction Rules
        is_temporal = ('fan_in' in pats) or ('fan_out' in pats) or ('high_velocity' in pats)
        
        if (not in_cycle) and (not is_temporal):
             if node_durations[node] > timedelta(days=7):
                 points = -30
                 score += points
                 breakdown.append({"reason": "Long Duration (>7 days)", "points": points})
        
        # Strong Dampener for Legitimate looking high volume
        if is_merchant_like and not in_cycle:
            if score > 40:
                deduction = score - 40
                score = 40
                breakdown.append({"reason": "Merchant Trust Cap", "points": -deduction})
                
        if is_payroll_like and not in_cycle:
            if score > 40:
                deduction = score - 40
                score = 40
                breakdown.append({"reason": "Payroll Trust Cap", "points": -deduction})
                 
        score = max(0, min(100, score))
        scores[node] = score
        scores_breakdown[node] = breakdown
        
    # 4. Compute Ring Scores
    final_fraud_rings = []
    
    for r in all_rings:
        members = r['member_accounts']
        member_scores = [scores[m] for m in members]
        
        if not member_scores:
            risk_score = 0
        else:
            # Weighted Ring Scoring: Max score has 50% weight, Avg score has 50%
            max_s = max(member_scores)
            avg_s = sum(member_scores) / len(member_scores)
            risk_score = (max_s * 0.6) + (avg_s * 0.4)
        
        r['risk_score'] = round(risk_score, 2)
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
                     try:
                        robj = next(r for r in final_fraud_rings if r['ring_id'] == rid)
                        candidate_rings.append(robj)
                     except StopIteration:
                        pass
                
                if candidate_rings:
                    # Sort by risk_score desc, then ring_id asc
                    candidate_rings.sort(key=lambda x: (-x['risk_score'], x['ring_id']))
                    best_rid = candidate_rings[0]['ring_id']
                else:
                    best_rid = None

            suspicious_list.append({
                "account_id": node,
                "suspicion_score": float(f"{score:.2f}"),
                "score_breakdown": scores_breakdown[node],
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

