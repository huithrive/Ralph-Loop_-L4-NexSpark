#!/bin/bash

echo "=============================================="
echo "🚀 Testing Claude Sonnet 4.5 Deployment"
echo "=============================================="
echo ""

PROD_URL="https://74b9b287.nexspark-growth.pages.dev"

echo "1️⃣  API Status Check..."
STATUS=$(curl -s "$PROD_URL/api/growth-audit/status")
echo "$STATUS" | python3 -m json.tool
echo ""

echo "2️⃣  Landing Page..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")
echo "HTTP Status: $HTTP_CODE"
echo ""

echo "3️⃣  Demo Mode..."
DEMO_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/strategy-analysis?demo=true")
echo "HTTP Status: $DEMO_CODE"
echo ""

echo "=============================================="
echo "✅ Deployment Test Complete"
echo "=============================================="
echo ""
echo "📋 Next Steps:"
echo "1. Clear localStorage: localStorage.clear(); location.reload();"
echo "2. Test demo: $PROD_URL/strategy-analysis?demo=true"
echo "3. Test interview: $PROD_URL"
echo ""
echo "🔍 Expected Console Output:"
echo "   Calling Claude API with model: claude-sonnet-4-5-20250929"
echo "   Business profile extracted successfully"
echo ""
