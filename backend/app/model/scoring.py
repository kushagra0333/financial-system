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
    shell_chains = detect_shell_chains(G, df)

    # 2. Build Account Metadata
    account_info = {
        n: {
            'patterns': set(),
            'in_cycle': False,
            'rings': []
        }
        for n in G.nodes()
    }

    all_rings = []

    def next_ring_id():
        return f"RING_{len(all_rings) + 1:03d}"

    # -------------------- CYCLES --------------------
    for cycle in cycles:
        rid = next_ring_id()

        ring_data = {
            "ring_id": rid,
            "member_accounts": list(cycle),
            "pattern_type": "cycle"
        }
        all_rings.append(ring_data)

        for node in cycle:
            account_info[node]['in_cycle'] = True

            if 3 <= len(cycle) <= 5:
                account_info[node]['patterns'].add('cycle_length_3_5')
            else:
                account_info[node]['patterns'].add('cycle')

            account_info[node]['rings'].append(rid)

    # -------------------- FAN IN --------------------
    for node in fan_in_nodes:
        account_info[node]['patterns'].add('fan_in')

        if not account_info[node]['in_cycle']:
            members = [node] + sorted(list(G.predecessors(node)))
            rid = next_ring_id()

            all_rings.append({
                "ring_id": rid,
                "member_accounts": members,
                "pattern_type": "fan_in"
            })

            for m in members:
                account_info[m]['rings'].append(rid)

    # -------------------- FAN OUT --------------------
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

    # -------------------- SHELL CHAINS --------------------
    for chain in shell_chains:
        is_overlapping = any(account_info[m]['in_cycle'] for m in chain['members'])

        if not is_overlapping:
            rid = next_ring_id()

            all_rings.append({
                "ring_id": rid,
                "member_accounts": chain['members'],
                "pattern_type": "shell_chain"
            })

            for m in chain['members']:
                account_info[m]['patterns'].add('shell')
                account_info[m]['rings'].append(rid)

    # -------------------- HIGH VELOCITY --------------------
    for node in high_velocity:
        account_info[node]['patterns'].add('high_velocity')
        
        # Only create a high_velocity ring if the node is NOT involved in any other STRUCTURAL ring pattern
        # checking 'rings' list might be insufficient if ring creation failed for some reason
        # so we check if they have any of the structural patterns.
        existing_patterns = account_info[node]['patterns']
        has_structural_ring = any(p in existing_patterns for p in ['cycle', 'cycle_length_3_5', 'fan_in', 'fan_out', 'shell'])
        
        if not has_structural_ring:
            rid = next_ring_id()
            all_rings.append({
                "ring_id": rid,
                "member_accounts": [node],
                "pattern_type": "high_velocity"
            })
            account_info[node]['rings'].append(rid)

    # -------------------- SCORING --------------------
    scores = {}
    scores_breakdown = {}

    node_durations = {}
    for node in G.nodes():
        timestamps = []

        for p in G.predecessors(node):
            for t in G[p][node]['transactions']:
                timestamps.append(t['timestamp'])

        for s in G.successors(node):
            for t in G[node][s]['transactions']:
                timestamps.append(t['timestamp'])

        spread = max(timestamps) - min(timestamps) if timestamps else timedelta(0)
        node_durations[node] = spread

    suspicious_list = []

    for node in G.nodes():
        score = 0
        breakdown = []

        pats = account_info[node]['patterns']
        in_cycle = account_info[node]['in_cycle']

        # Volume
        in_amt = fan_in_amounts.get(node, 0)
        out_amt = fan_out_amounts.get(node, 0)
        total_vol = in_amt + out_amt

        vol_score = min(20, math.log10(total_vol) * 2) if total_vol > 0 else 0

        flow_ratio = out_amt / in_amt if in_amt > 0 else 999.0

        is_pass_through = 0.9 <= flow_ratio <= 1.1
        is_merchant_like = flow_ratio < 0.1 and in_amt > 1000
        is_payroll_like = flow_ratio > 10.0 and out_amt > 1000

        # --- Pattern Scores ---

        if in_cycle:
            score += 50
            breakdown.append({"reason": "In Cycle", "points": 50})

            if 'cycle_length_3_5' in pats:
                score += 15
                breakdown.append({"reason": "Short Cycle (3-5 hops)", "points": 15})

        if 'fan_in' in pats:
            if is_merchant_like:
                score += 5
                breakdown.append({"reason": "Fan In (Merchant-like)", "points": 5})
            elif is_pass_through:
                score += 40
                breakdown.append({"reason": "Fan In (Pass-through)", "points": 40})
            else:
                score += 25
                breakdown.append({"reason": "Fan In Pattern", "points": 25})

        if 'fan_out' in pats:
            if is_payroll_like:
                score += 5
                breakdown.append({"reason": "Fan Out (Payroll-like)", "points": 5})
            elif is_pass_through:
                score += 40
                breakdown.append({"reason": "Fan Out (Pass-through)", "points": 40})
            else:
                score += 25
                breakdown.append({"reason": "Fan Out Pattern", "points": 25})

        if 'shell' in pats:
            score += 30
            breakdown.append({"reason": "Shell Chain Member", "points": 30})

            if is_pass_through:
                score += 10
                breakdown.append({"reason": "Shell Pass-through", "points": 10})

        if 'high_velocity' in pats:
            score += 15
            breakdown.append({"reason": "High Velocity", "points": 15})

        if score > 20:
            score += vol_score
            breakdown.append({
                "reason": f"High Volume (${total_vol:,.0f})",
                "points": round(vol_score, 1)
            })

        if is_pass_through and (in_cycle or 'shell' in pats):
            score += 10
            breakdown.append({"reason": "Confirmed Mule Behavior", "points": 10})

        if (not in_cycle) and ('fan_in' not in pats and 'fan_out' not in pats and 'high_velocity' not in pats):
            if node_durations[node] > timedelta(days=7):
                score -= 30
                breakdown.append({"reason": "Long Duration (>7 days)", "points": -30})

        if is_merchant_like and not in_cycle and score > 40:
            breakdown.append({"reason": "Merchant Trust Cap", "points": -(score - 40)})
            score = 40

        if is_payroll_like and not in_cycle and score > 40:
            breakdown.append({"reason": "Payroll Trust Cap", "points": -(score - 40)})
            score = 40

        score = max(0, min(100, score))

        scores[node] = score
        scores_breakdown[node] = breakdown

    # -------------------- RING SCORING --------------------
    final_fraud_rings = []

    for r in all_rings:
        members = r['member_accounts']
        member_scores = [scores[m] for m in members]

        if not member_scores:
            risk_score = 0
        else:
            max_s = max(member_scores)
            avg_s = sum(member_scores) / len(member_scores)
            risk_score = (max_s * 0.6) + (avg_s * 0.4)

        r['risk_score'] = round(risk_score, 2)
        final_fraud_rings.append(r)

    # -------------------- FINAL OUTPUT --------------------
    for node, score in scores.items():
        if score > 0:

            my_rings = account_info[node]['rings']

            candidate_rings = [
                r for r in final_fraud_rings if r['ring_id'] in my_rings
            ]

            if candidate_rings:
                candidate_rings.sort(key=lambda x: (-x['risk_score'], x['ring_id']))
                best_rid = candidate_rings[0]['ring_id']
            else:
                best_rid = None

            # ✅ IMPORTANT CHANGE: Add high_velocity to cycle accounts
            patterns = set(account_info[node]['patterns'])
            if account_info[node]['in_cycle']:
                patterns.add('high_velocity')

            suspicious_list.append({
                "account_id": node,
                "suspicion_score": float(f"{score:.2f}"),
                "score_breakdown": scores_breakdown[node],
                "detected_patterns": sorted(list(patterns)),
                "ring_id": best_rid,
                "total_transactions": G.degree(node),
                "fan_in": len(list(G.predecessors(node))),
                "fan_in_count": fan_in_counts.get(node, 0),
                "fan_out_count": fan_out_counts.get(node, 0)
            })

    suspicious_list.sort(key=lambda x: (-x['suspicion_score'], x['account_id']))

    # -------------------- FILTERING FOR CYCLES ONLY --------------------
    # User Request: "in the backend only send the data which are making the cycle dont send the data without cycles"
    
    cycle_rings = [r for r in final_fraud_rings if r['pattern_type'] == 'cycle']
    
    cycle_suspicious_list = []
    
    # We only want accounts that are part of a cycle.
    # checking account_info[node]['in_cycle'] is the most direct way.
    
    for item in suspicious_list:
        node = item['account_id']
        if account_info[node]['in_cycle']:
            # Ensure the ring_id associated is also a cycle ring (it should be if in_cycle is true, but good to be safe)
             cycle_suspicious_list.append(item)

    return cycle_suspicious_list, cycle_rings

