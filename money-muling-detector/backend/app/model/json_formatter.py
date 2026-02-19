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
            "id": acc['account_id'],
            "suspicionScore": acc['suspicion_score'],
            "patterns": [p.replace('_', ' ').title() for p in acc['detected_patterns']], # "cycle_length_3" -> "Cycle Length 3"
            "totalTransactions": acc.get('total_transactions', 0),
            "fanIn": acc.get('fan_in_count', 0),
            "fanOut": acc.get('fan_out_count', 0)
        })

    # Transform rings
    rings = []
    for r in fraud_rings:
        rings.append({
            "id": r['ring_id'],
            "patternType": r['pattern_type'].replace('_', ' ').title(),
            "memberCount": len(r['member_accounts']),
            "riskScore": r['risk_score'],
            "accounts": r['member_accounts']
        })

    # Transform summary
    payload = {
        "totalAccounts": summary_stats['total_accounts_analyzed'],
        "suspiciousAccounts": summary_stats['suspicious_accounts_flagged'],
        "fraudRings": summary_stats['fraud_rings_detected'],
        "processingTime": summary_stats['processing_time_seconds'],
        "rings": rings,
        "accounts": accounts
    }
    
    return payload
