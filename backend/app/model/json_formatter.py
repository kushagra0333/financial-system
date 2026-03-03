from decimal import Decimal
import json

def format_output(suspicious_accounts, fraud_rings, summary_stats):
    """
    Formats the output exactly as required by the new frontend (camelCase).
    """
    
    # Transform suspicious accounts
    accounts = []
    for acc in suspicious_accounts:
        accounts.append({
            "account_id": acc['account_id'],
            "suspicion_score": acc['suspicion_score'],
            "detected_patterns": sorted(list(acc['detected_patterns'])), # Keep raw snake_case or whatever is in there, maybe sort? Protocol says "cycle_length_3_5"
            "ring_id": acc.get('ring_id'),
            # Extra fields from your current impl, keep them? User example has ring_id key in account
        })

    # The user example for suspicious_accounts:
    # { "account_id": "ACC_00123", "suspicion_score": 87.5,
    #   "detected_patterns": ["cycle_length_3", "high_velocity"],
    #   "ring_id": "RING_001" }
    
    # My previous code had more fields (totalTransactions etc). I should probably keep them but snake_case them?
    # The user instruction said "this is the format... correct it". 
    # I will strictly follow their example but maybe keep valuable extra info if it fits the schema?
    # actually the user example is minimal. I'll stick to the keys in their example + the ones I know I have and are useful.
    # checking the user request again:
    # "suspicious_accounts": [ { "account_id": ..., "suspicion_score": ..., "detected_patterns": ..., "ring_id": ... } ]
    # It doesn't explicitly *forbid* other keys, but I should align with their keys.
    # The frontend uses fanIn/fanOut/totalTransactions. If I drop them, I need to update frontend to NOT use them or calc them elsewhere.
    # I will KEEP them but renamed to snake_case, to break less logic if possible, or actually, let's just use snake_case for everything.
    
    formatted_accounts = []
    for acc in suspicious_accounts:
        formatted_accounts.append({
            "account_id": acc['account_id'],
            "suspicion_score": acc['suspicion_score'],
            "detected_patterns": sorted(list(acc['detected_patterns'])),
            "ring_id": acc.get('ring_id')
        })

    # Transform rings
    formatted_rings = []
    for r in fraud_rings:
        formatted_rings.append({
            "ring_id": r['ring_id'],
            "member_accounts": r['member_accounts'],
            "pattern_type": r['pattern_type'], 
            "risk_score": r['risk_score']
        })

    # Transform summary
    payload = {
        "suspicious_accounts": formatted_accounts,
        "fraud_rings": formatted_rings,
        "summary": {
            "total_accounts_analyzed": summary_stats['total_accounts_analyzed'],
            "suspicious_accounts_flagged": summary_stats['suspicious_accounts_flagged'],
            "fraud_rings_detected": summary_stats['fraud_rings_detected'],
            "processing_time_seconds": summary_stats['processing_time_seconds']
        }
    }
    
    return payload
