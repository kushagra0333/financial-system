#!/bin/bash
# Simple smoke test

echo "Checking Health..."
curl -s http://localhost:8000/health | grep "ok" && echo "Health OK" || echo "Health FAILED"

echo "Checking Upload..."
# Use sample CSV
RESPONSE=$(curl -s -w "\n%{time_total}" -X POST -F "file=@sample_data/sample_transactions.csv" http://localhost:8000/upload)

# Extract time from last line
TIME=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "Response Body:"
echo "$BODY" | head -n 20 # First 20 lines

echo "Total Request Time: $TIME seconds"
