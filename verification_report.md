# Fraud Detection Logic Verification Report

This report confirms that the current implementation of the Financial Forensics Engine strictly adheres to the specified detection patterns.

## 1. Circular Fund Routing (Cycles)
*   **Requirement:** Detect cycles of length 3 to 5.
*   **Status:** ✅ **VERIFIED**
*   **Evidence:** `backend/app/model/cycle_detector.py`
    ```python
    if 3 <= len(path) <= 5:
        # ... add cycle ...
    elif len(path) < 5:
        # ... continue search ...
    ```
    The Depth First Search explicitly constrains the path length to be between 3 and 5 nodes.

*   **Requirement:** All accounts flagged as part of the same ring.
*   **Status:** ✅ **VERIFIED**
*   **Evidence:** `backend/app/model/scoring.py`
    *   A unique `ring_id` is generated for each detected cycle.
    *   All members of the cycle are assigned this `ring_id` in the `account_info` dictionary.

## 2. Smurfing Patterns (Fan-in / Fan-out)
*   **Requirement:** 
    *   Fan-in: 10+ senders → 1 receiver.
    *   Fan-out: 1 sender → 10+ receivers.
*   **Status:** ✅ **VERIFIED**
*   **Evidence:** `backend/app/model/fan_detector.py`
    ```python
    if len(window_partners) >= 10:
        return True
    ```
    The logic specifically checks for a count of distinct partners greater than or equal to 10.

*   **Requirement:** Temporal analysis (72-hour window).
*   **Status:** ✅ **VERIFIED**
*   **Evidence:** `backend/app/model/fan_detector.py`
    ```python
    end_time = start_time + timedelta(hours=72)
    ```
    The sliding window algorithm explicitly aggregates unique partners within a strict 72-hour timeframe.

## 3. Layered Shell Networks
*   **Requirement:** Chains of 3+ hops.
*   **Status:** ✅ **VERIFIED**
*   **Evidence:** `backend/app/model/shell_detector.py`
    *   The detector identifies partial shell chains of length >= 2 nodes (e.g., `S1 -> S2`).
    *   It then connects them to a Predecessor and Successor (`Pre -> S1 -> S2 -> Post`).
    *   Total Hops: `Pre->S1` (1) + `S1->S2` (1) + `S2->Post` (1) = 3 Hops.
    *   This logic ensures a minimum of 3 hops.

*   **Requirement:** Intermediate accounts have only 2–3 total transactions.
*   **Status:** ✅ **VERIFIED**
*   **Evidence:** `backend/app/model/shell_detector.py`
    ```python
    shell_candidates = {n for n, d in degrees.items() if d <= 3}
    ```
    *   Candidate selection is restricted to nodes with a total degree (In + Out) of 3 or less.
    *   Since a node in a chain must have at least 1 input and 1 output, the effective degree range for intermediate nodes is **2 to 3**.

---
**Conclusion:** The algorithms implemented in `cycle_detector.py`, `fan_detector.py`, and `shell_detector.py` are fully aligned with the requirements.
