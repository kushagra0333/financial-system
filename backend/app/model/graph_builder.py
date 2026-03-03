import pandas as pd
import networkx as nx
from datetime import datetime

def build_graph(df: pd.DataFrame) -> nx.DiGraph:
    """
    Builds a directed graph from the transaction DataFrame.
    Nodes: Account IDs (strings)
    Edges: Directed edge from sender_id to receiver_id.
           Edge attributes: list of transaction dicts (transaction_id, amount, timestamp)
    """
    G = nx.DiGraph()
    
    # Ensure timestamps are datetime
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Add edges
    for _, row in df.iterrows():
        sender = str(row['sender_id'])
        receiver = str(row['receiver_id'])
        
        # Add nodes implicitly or explicitly to ensure all are present
        if sender not in G:
            G.add_node(sender)
        if receiver not in G:
            G.add_node(receiver)
            
        attr = {
            'transaction_id': row['transaction_id'],
            'amount': float(row['amount']),
            'timestamp': row['timestamp']
        }
        
        if G.has_edge(sender, receiver):
            G[sender][receiver]['transactions'].append(attr)
        else:
            G.add_edge(sender, receiver, transactions=[attr])
            
    return G
