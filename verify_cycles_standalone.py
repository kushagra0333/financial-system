
import networkx as nx
import sys

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

def test_cycle_detection():
    G = nx.DiGraph()
    
    # 2-cycle (Should be IGNORED)
    G.add_edge(1, 2)
    G.add_edge(2, 1)
    
    # 3-cycle (Should be DETECTED)
    G.add_edge(10, 11)
    G.add_edge(11, 12)
    G.add_edge(12, 10)
    
    # 4-cycle (Should be DETECTED)
    G.add_edge(20, 21)
    G.add_edge(21, 22)
    G.add_edge(22, 23)
    G.add_edge(23, 20)
    
    # 5-cycle (Should be DETECTED)
    G.add_edge(30, 31)
    G.add_edge(31, 32)
    G.add_edge(32, 33)
    G.add_edge(33, 34)
    G.add_edge(34, 30)
    
    # 6-cycle (Should be IGNORED)
    G.add_edge(40, 41)
    G.add_edge(41, 42)
    G.add_edge(42, 43)
    G.add_edge(43, 44)
    G.add_edge(44, 45)
    G.add_edge(45, 40)
    
    print("Graph created with cycles of length 2, 3, 4, 5, 6.")
    
    try:
        cycles = detect_cycles(G)
    except Exception as e:
        print(f"Error during detection: {e}")
        return

    print(f"\nDetected {len(cycles)} cycles:")
    for c in cycles:
        print(f" - Length {len(c)}: {c}")
        
    lengths = [len(c) for c in cycles]
    
    if 2 in lengths:
        print("FAIL: Detected length 2")
    if 6 in lengths:
        print("FAIL: Detected length 6")
        
    if 3 in lengths and 4 in lengths and 5 in lengths:
        print("\nSUCCESS: Detected lengths 3, 4, and 5.")
    else:
        print("\nFAIL: Missed expected cycles.")

if __name__ == "__main__":
    test_cycle_detection()
