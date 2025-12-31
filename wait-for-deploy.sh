#!/bin/bash
echo "⏳ Waiting for Cloudflare Pages redeploy..."
echo ""
echo "Checking every 10 seconds for API status..."
echo ""

for i in {1..18}; do
  echo "Attempt $i/18 ($(($i * 10))s elapsed)..."
  
  response=$(curl -s https://6976dfb4.nexspark-growth.pages.dev/api/growth-audit/status)
  
  claude_enabled=$(echo "$response" | jq -r '.features.claudeAI')
  rapid_enabled=$(echo "$response" | jq -r '.features.rapidAPI')
  
  echo "  Claude AI: $claude_enabled"
  echo "  RapidAPI: $rapid_enabled"
  
  if [ "$claude_enabled" = "true" ] && [ "$rapid_enabled" = "true" ]; then
    echo ""
    echo "✅ Deployment complete! All APIs enabled!"
    echo ""
    echo "$response" | jq '.'
    exit 0
  fi
  
  if [ $i -lt 18 ]; then
    sleep 10
  fi
done

echo ""
echo "⚠️  Deployment may still be in progress. Current status:"
echo "$response" | jq '.'
