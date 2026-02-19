import sys
import os
import io # Added import
import pandas as pd
import json

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.model.graph_builder import build_graph
from app.model.scoring import analyze_graph
from app.model.json_formatter import format_output

def generate():
    csv_path = 'sample_data/sample_transactions.csv'
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return

    df = pd.read_csv(csv_path)
    # Ensure timestamp parsing matches API strictness if possible, but here just use pandas default or explicit
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    G = build_graph(df)
    suspicious, rings = analyze_graph(G, df)
    
    # Mock summary stats
    summary = {
        "total_accounts_analyzed": int(G.number_of_nodes()),
        "suspicious_accounts_flagged": len(suspicious),
        "fraud_rings_detected": len(rings),
        "processing_time_seconds": 0.05
    }
    
    output = format_output(suspicious, rings, summary)
    
    # Write to file
    with open('sample_data/expected_output.json', 'w') as f:
        json.dump(output, f, indent=2)
        
    print("Generated sample_data/expected_output.json")
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    generate()
