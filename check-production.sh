#!/bin/bash
echo "🔍 Checking Production Status..."
echo ""
echo "Production URL: https://6976dfb4.nexspark-growth.pages.dev"
echo ""
echo "Testing API Status Endpoint..."
curl -s https://6976dfb4.nexspark-growth.pages.dev/api/growth-audit/status | jq '.' || echo "No response or invalid JSON"
echo ""
echo "Testing Landing Page..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://6976dfb4.nexspark-growth.pages.dev
echo ""
echo "Testing Interview Page..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://6976dfb4.nexspark-growth.pages.dev/interview
