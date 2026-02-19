import networkx as nx

def detect_shell_chains(G: nx.DiGraph, df_tx):
    """
    Detects shell chains: Directed simple paths A -> B -> C -> ... -> Z
    where length >= 3 (edges), so at least 4 nodes.
    And all INTERMEDIATE nodes (B, C, ...) have total_degree <= 3.
    """
    shell_chains = []
    
    # Pre-calculate total degrees (in + out)
    # Note: G.degree() is in_degree + out_degree for DiGraph
    degrees = dict(G.degree())
    
    # Identify shell candidates (degree <= 3)
    shell_candidates = {n for n, d in degrees.items() if d <= 3}
    
    if not shell_candidates:
        return []
        
    # Build subgraph of ONLY shell candidates
    G_shell = G.subgraph(shell_candidates).copy()
    
    # Find all path fragments in G_shell
    # Since max degree is 3, these components are small (lines or simple cycles)
    # We want simple paths.
    
    # Helper to find paths in G_shell
    # We can iterate over all nodes in G_shell and run DFS
    # But optimal way for sparse graph:
    # Find weakly connected components, then explore.
    
    # Even simpler: Just standard DFS from each node in G_shell, 
    # but since it's a subgraph of low degree nodes, depths are small.
    # We store paths as list of nodes.
    
    partial_paths = []
    visited_paths = set()
    
    nodes_shell = sorted(list(G_shell.nodes()))
    
    for start_node in nodes_shell:
        stack = [(start_node, [start_node])]
        while stack:
            curr, path = stack.pop()
            
            # Save this path if it has length >= 1 (at least 2 nodes)
            # This represents a chain of shell nodes: S1 -> ... -> Sk
            if len(path) >= 2:
                path_tuple = tuple(path)
                if path_tuple not in visited_paths:
                    visited_paths.add(path_tuple)
                    partial_paths.append(path)
            
            # Continue DFS
            neighbors = sorted(list(G_shell.successors(curr)))
            for nbr in neighbors:
                if nbr not in path: # Simple path
                    stack.append((nbr, path + [nbr]))

    # Now we have all valid chains of shell nodes.
    # A shell chain in the full definition is: Pre -> S_chain -> Post
    # Length of full path = 1 + (len(S_chain)-1) + 1 = len(S_chain) + 1.
    # Requirement: Length >= 3 => len(S_chain)+1 >= 3 => len(S_chain) >= 2 edges => 3 nodes?
    # Wait. 
    # Path A -> S1 -> S2 -> B. Intermediates S1, S2.
    # Edges: (A,S1), (S1,S2), (S2,B). Total 3 edges.
    # Here S_chain is [S1, S2]. Length of S_chain is 1 edge. 
    # So if S_chain has length 1 (2 nodes), total path has length 3.
    # So we need S_chain with >= 2 nodes.
    
    # What if A -> S1 -> B ? Intermed S1. Length 2. Not enough.
    # So yes, we need at least 2 Shell Nodes connected.
    
    final_rings = []
    
    for path in partial_paths:
        # path is [S1, S2, ..., Sk]
        s_start = path[0]
        s_end = path[-1]
        
        # Check for Predecessors of s_start in G (not in path)
        preds = sorted([p for p in G.predecessors(s_start) if p not in path])
        # Check for Successors of s_end in G (not in path)
        succs = sorted([s for s in G.successors(s_end) if s not in path])
        
        # Determine strict extensions
        # If we have valid preds and succs, we can form at least one chain
        if preds and succs:
            # We found a valid shell chain structure.
            # Create a ring/pattern for this.
            # "Each unique path found ... group all accounts in that path"
            # To avoid combinatorial explosion (A->S...->B, C->S...->D),
            # we can report one ring per core shell-chain?
            # Or iterate all combinations?
            # Prompt: "Each unique path found can contribute... For ring creation: group all accounts in that path"
            
            # Let's emit one ring for each valid (Pre, Post) pair.
            for p in preds:
                for s in succs:
                    if p != s: # Simple path
                         full_path = [p] + path + [s]
                         # Check length explicitly
                         # Edges = len(full_path) - 1. 
                         # Since len(path)>=2, full_path has >= 4 nodes. Edges >= 3.
                         
                         final_rings.append({
                             "members": full_path,
                             "type": "shell_chain"
                         })
    
    # Deduplicate based on member sets or exact paths?
    # "Each unique path found ... unique canonical cycle is one fraud ring"
    # For shell chains, maybe similar?
    # I'll return list of paths (list of nodes).
    
    # Sort for determinism
    final_rings.sort(key=lambda x: (len(x["members"]), x["members"][0]))
    
    return final_rings
