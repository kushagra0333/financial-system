import networkx as nx

def detect_cycles(G: nx.DiGraph):
    """
    Detects directed cycles of length 3, 4, or 5 using a deterministic DFS.
    Returns a list of canonical cycles (tuples of node IDs).
    """
    cycles = set()
    nodes = sorted(list(G.nodes())) # Deterministic order
    
    for start_node in nodes:
        stack = [(start_node, [start_node])]
        
        while stack:
            curr, path = stack.pop()
            
            # Explore neighbors
            # Sort neighbors for determinism
            neighbors = sorted(list(G.successors(curr)))
            
            for neighbor in neighbors:
                if neighbor == start_node:
                    # Cycle found
                    if 3 <= len(path) <= 5:
                        cycle = tuple(path)
                        canonical = _canonicalize(cycle)
                        cycles.add(canonical)
                elif neighbor not in path:
                    # Continue detecting if depth limit not reached
                    # path length current is len(path). 
                    # If we add neighbor, length becomes len(path)+1.
                    # We only care about cycles up to length 5.
                    if len(path) < 5:
                        stack.append((neighbor, path + [neighbor]))
                        
    # Sort cycles for deterministic output list
    return sorted(list(cycles))

def _canonicalize(cycle):
    """
    Rotate cycle so the lexicographically smallest node is first.
    E.g. ('B', 'C', 'A') -> ('A', 'B', 'C')
    """
    min_node = min(cycle)
    min_index = cycle.index(min_node)
    return cycle[min_index:] + cycle[:min_index]
