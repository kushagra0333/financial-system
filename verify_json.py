import urllib.request
import json
import sys
import os

# File path
FILE_PATH = "/home/arjavjain5203/Coding/Hackathon/high_precision_money_muling_dataset_10000.csv"
URL = "http://localhost:8000/upload"

def verify():
    print(f"Uploading {FILE_PATH}...")
    try:
        # Create multipart body manually or just use a simple hack if server supports it.
        # FastAPI UploadFile expects multipart/form-data.
        # Constructing multipart body with urllib is painful.
        # Let's use curl invoked from python for simplicity and then parse output.
        import subprocess
        
        result = subprocess.run([
            "curl", "-X", "POST", URL,
            "-F", f"file=@{FILE_PATH}",
            "-s"
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Curl failed: {result.stderr}")
            sys.exit(1)
            
        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON: {result.stdout[:200]}...")
            sys.exit(1)
            
        print("Response received. Verifying structure...")
        
        # Check top level
        expected_keys = {"suspicious_accounts", "fraud_rings", "summary"}
        missing = expected_keys - data.keys()
        if missing:
            print(f"FAILED: Missing top level keys: {missing}")
            # print(f"Keys found: {data.keys()}")
            sys.exit(1)
            
        # Check suspicious_accounts
        if data.get('suspicious_accounts'):
            acc = data['suspicious_accounts'][0]
            # print(f"Sample Account Keys: {acc.keys()}")
            if 'account_id' not in acc or 'suspicion_score' not in acc:
                print("FAILED: Suspicious account missing keys")
                sys.exit(1)
        else:
            print("WARNING: No suspicious accounts found")
            
        # Check fraud_rings
        if data.get('fraud_rings'):
            ring = data['fraud_rings'][0]
            # print(f"Sample Ring Keys: {ring.keys()}")
            if 'ring_id' not in ring or 'member_accounts' not in ring:
                 print("FAILED: Fraud ring missing keys")
                 sys.exit(1)
        else:
            print("WARNING: No fraud rings found")
            
        print("SUCCESS: JSON structure appears correct!")
        
    except Exception as e:
        print(f"Exception: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify()
