import networkx as nx
from datetime import timedelta
import pandas as pd

def detect_fan_patterns(G: nx.DiGraph):
    """
    Detects fan-in and fan-out patterns.
    Fan-in: receiver has >= 10 distinct senders in 72h window.
    Fan-out: sender has >= 10 distinct receivers in 72h window.
    
    Returns:
        fan_in_nodes (set): Set of node IDs
        fan_out_nodes (set): Set of node IDs
    """
    fan_in_nodes = set()
    fan_out_nodes = set()
    
    nodes = sorted(list(G.nodes()))
    
    for node in nodes:
        # Fan-in check: Look at incoming edges
        incoming_txs = []
        for sender in G.predecessors(node):
            for tx in G[sender][node]['transactions']:
                incoming_txs.append({'partner': sender, 'ts': tx['timestamp'], 'type': 'in'})
        
        if _check_fan_condition(incoming_txs):
            fan_in_nodes.add(node)
            
        # Fan-out check: Look at outgoing edges
        outgoing_txs = []
        for receiver in G.successors(node):
            for tx in G[node][receiver]['transactions']:
                outgoing_txs.append({'partner': receiver, 'ts': tx['timestamp'], 'type': 'out'})
                
        if _check_fan_condition(outgoing_txs):
            fan_out_nodes.add(node)
            
    return sorted(list(fan_in_nodes)), sorted(list(fan_out_nodes))

def _check_fan_condition(transactions):
    """
    Check if there are >= 10 distinct partners in any 72h window.
    transactions: list of dicts {'partner': str, 'ts': datetime}
    """
    if not transactions:
        return False
        
    # Sort by timestamp
    transactions.sort(key=lambda x: x['ts'])
    
    # Sliding window
    # Optimized: for each tx as start of window, count distinct partners in next 72h
    for i in range(len(transactions)):
        start_time = transactions[i]['ts']
        end_time = start_time + timedelta(hours=72)
        
        window_partners = set()
        for j in range(i, len(transactions)):
            if transactions[j]['ts'] > end_time:
                break
            window_partners.add(transactions[j]['partner'])
            
            if len(window_partners) >= 10:
                return True
                
    return False

def calculate_fan_counts(G: nx.DiGraph):
    """
    Calculates the maximum number of distinct partners in any 72h window for all nodes.
    Returns:
        fan_in_counts (dict): {node_id: int}
        fan_out_counts (dict): {node_id: int}
    """
    fan_in_counts = {}
    fan_out_counts = {}
    
    for node in G.nodes():
        # Fan-in
        incoming_txs = []
        for sender in G.predecessors(node):
            for tx in G[sender][node]['transactions']:
                incoming_txs.append({'partner': sender, 'ts': tx['timestamp']})
        fan_in_counts[node] = _get_max_window_count(incoming_txs)
        
        # Fan-out
        outgoing_txs = []
        for receiver in G.successors(node):
            for tx in G[node][receiver]['transactions']:
                outgoing_txs.append({'partner': receiver, 'ts': tx['timestamp']})
        fan_out_counts[node] = _get_max_window_count(outgoing_txs)
        
    return fan_in_counts, fan_out_counts

def _get_max_window_count(transactions):
    if not transactions:
        return 0
        
    # Sort by timestamp
    transactions.sort(key=lambda x: x['ts'])
    
    max_count = 0
    # Sliding window
    for i in range(len(transactions)):
        start_time = transactions[i]['ts']
        end_time = start_time + timedelta(hours=72)
        
        window_partners = set()
        for j in range(i, len(transactions)):
            if transactions[j]['ts'] > end_time:
                break
            window_partners.add(transactions[j]['partner'])
            
        max_count = max(max_count, len(window_partners))
        
    return max_count

def detect_high_velocity(G: nx.DiGraph):
    """
    High velocity: detects nodes with >= 20 txns (send or receive) in 72h window.
    Returns set of node IDs.
    """
    high_velocity_nodes = set()
    nodes = sorted(list(G.nodes()))
    
    for node in nodes:
        all_txs = []
        # Incoming
        for sender in G.predecessors(node):
            for tx in G[sender][node]['transactions']:
                all_txs.append(tx['timestamp'])
        # Outgoing
        for receiver in G.successors(node):
            for tx in G[node][receiver]['transactions']:
                all_txs.append(tx['timestamp'])
                
        all_txs.sort()
        
        # Sliding window check
        found = False
        for i in range(len(all_txs)):
            if found: break
            start_time = all_txs[i]
            end_time = start_time + timedelta(hours=72)
            
            count = 0
            for j in range(i, len(all_txs)):
                if all_txs[j] > end_time:
                    break
                count += 1
                if count >= 20:
                    high_velocity_nodes.add(node)
                    found = True
                    break
                    
    return sorted(list(high_velocity_nodes))
