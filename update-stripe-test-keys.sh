#!/bin/bash

# Update Cloudflare Pages Environment Variables for Stripe
# Usage: Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY as env vars before running
# Example:
#   export STRIPE_SECRET_KEY=sk_live_...
#   export STRIPE_PUBLISHABLE_KEY=pk_live_...
#   ./update-stripe-test-keys.sh

echo "=============================================="
echo "🔑 Updating Cloudflare Stripe Keys"
echo "=============================================="

export CLOUDFLARE_API_TOKEN=$(cat /home/user/webapp/.cloudflare-token 2>/dev/null)
PROJECT_NAME="nexspark-growth"

if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$STRIPE_PUBLISHABLE_KEY" ]; then
  echo "❌ Error: STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY must be set as environment variables"
  exit 1
fi

echo "📝 Setting STRIPE_SECRET_KEY..."
echo "$STRIPE_SECRET_KEY" | \
  npx wrangler pages secret put STRIPE_SECRET_KEY --project-name="$PROJECT_NAME"

echo ""
echo "📝 Setting STRIPE_PUBLISHABLE_KEY..."
echo "$STRIPE_PUBLISHABLE_KEY" | \
  npx wrangler pages secret put STRIPE_PUBLISHABLE_KEY --project-name="$PROJECT_NAME"

echo ""
echo "✅ Cloudflare environment variables updated!"
echo "⏳ Wait 2-3 minutes for automatic redeploy..."
