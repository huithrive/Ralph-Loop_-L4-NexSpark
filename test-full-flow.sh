#!/bin/bash
# Test complete Auxora flow: Interview → Research → GTM Report

set -e

BASE_URL="http://localhost:3001"

echo "=== 1. CREATE SESSION ==="
SESSION=$(curl -s -X POST $BASE_URL/api/v3/session | python3 -c "import sys,json; print(json.load(sys.stdin)['sessionId'])")
echo "Session ID: $SESSION"

echo ""
echo "=== 2. GET GREETING ==="
curl -s "$BASE_URL/api/v3/session/$SESSION/start" | grep -E "event:|data:" | head -10

echo ""
echo "=== 3. ANSWER Q1: Website ==="
curl -s -X POST "$BASE_URL/api/v3/session/$SESSION/message" \
  -H 'Content-Type: application/json' \
  -d '{"text":"www.yamabushifarms.com"}' | grep "question" | head -3

echo ""
echo "=== 4. ANSWER Q2: Business Type ==="
curl -s -X POST "$BASE_URL/api/v3/session/$SESSION/message" \
  -H 'Content-Type: application/json' \
  -d '{"text":"E-commerce / DTC Brand"}' | grep "question" | head -3

echo ""
echo "=== 5. ANSWER Q3: Target Customers ==="
curl -s -X POST "$BASE_URL/api/v3/session/$SESSION/message" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Health & fitness enthusiasts"}' | grep "question" | head -3

echo ""
echo "=== 6. ANSWER Q4: Current Revenue ==="
curl -s -X POST "$BASE_URL/api/v3/session/$SESSION/message" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Pre-revenue"}' | grep "question" | head -3

echo ""
echo "=== 7. ANSWER Q5: Revenue Goal ==="
curl -s -X POST "$BASE_URL/api/v3/session/$SESSION/message" \
  -H 'Content-Type: application/json' \
  -d '{"text":"$10K/mo"}' | grep "question" | head -3

echo ""
echo "=== 8. ANSWER Q6: Marketing Budget (final question) ==="
echo "This should trigger report generation..."
curl -s -X POST "$BASE_URL/api/v3/session/$SESSION/message" \
  -H 'Content-Type: application/json' \
  -d '{"text":"$1K-$3K/mo"}' > /tmp/final-response.txt

echo ""
echo "=== CHECKING FOR REPORT GENERATION ==="
grep -o "gtm-report\|chat_progress\|agent_action" /tmp/final-response.txt | head -10

echo ""
echo "=== FULL RESPONSE (last 50 lines) ==="
tail -50 /tmp/final-response.txt

echo ""
echo "✅ Test complete!"
