#!/bin/bash

# Update Cloudflare Pages Environment Variables for Stripe TEST Mode

echo "=============================================="
echo "🧪 Updating Cloudflare to Stripe TEST Mode"
echo "=============================================="
echo ""

export CLOUDFLARE_API_TOKEN=$(cat /home/user/webapp/.cloudflare-token)
PROJECT_NAME="nexspark-growth"

echo "📝 Setting STRIPE_SECRET_KEY (TEST)..."
echo "REDACTED_STRIPE_SECRET" | \
  npx wrangler pages secret put STRIPE_SECRET_KEY --project-name="$PROJECT_NAME"

echo ""
echo "📝 Setting STRIPE_PUBLISHABLE_KEY (TEST)..."
echo "REDACTED_STRIPE_PUBLISHABLE" | \
  npx wrangler pages secret put STRIPE_PUBLISHABLE_KEY --project-name="$PROJECT_NAME"

echo ""
echo "✅ Cloudflare environment variables updated!"
echo ""
echo "⏳ Wait 2-3 minutes for automatic redeploy..."
echo ""
echo "🧪 Test Card: 4242 4242 4242 4242"
echo "   Expiry: 12/25"
echo "   CVC: 123"
echo "   ZIP: 12345"
echo ""
