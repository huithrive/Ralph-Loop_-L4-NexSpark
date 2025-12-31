#!/bin/bash

# NexSpark Production API Setup Script
# This script helps you configure environment variables in Cloudflare Pages

echo "🚀 NexSpark API Configuration Helper"
echo "===================================="
echo ""

# Read from .dev.vars
ANTHROPIC_KEY=$(grep ANTHROPIC_API_KEY .dev.vars | cut -d'=' -f2)
RAPIDAPI_KEY=$(grep RAPIDAPI_KEY .dev.vars | cut -d'=' -f2)
STRIPE_SECRET=$(grep STRIPE_SECRET_KEY .dev.vars | cut -d'=' -f2)
STRIPE_PUBLIC=$(grep STRIPE_PUBLISHABLE_KEY .dev.vars | cut -d'=' -f2)

echo "📋 Found these API keys in .dev.vars:"
echo ""
echo "1. Claude AI (Anthropic):"
echo "   ${ANTHROPIC_KEY:0:20}... (${#ANTHROPIC_KEY} chars)"
echo ""
echo "2. RapidAPI:"
echo "   ${RAPIDAPI_KEY:0:20}... (${#RAPIDAPI_KEY} chars)"
echo ""
echo "3. Stripe Secret:"
echo "   ${STRIPE_SECRET:0:20}... (${#STRIPE_SECRET} chars)"
echo ""
echo "4. Stripe Publishable:"
echo "   ${STRIPE_PUBLIC:0:20}... (${#STRIPE_PUBLIC} chars)"
echo ""
echo "===================================="
echo ""
echo "📝 To add these to Cloudflare Pages:"
echo ""
echo "1. Go to: https://dash.cloudflare.com/pages/nexspark-growth"
echo "2. Click: Settings → Environment variables"
echo "3. Click: 'Add variables' button"
echo "4. Add each variable for 'Production' environment:"
echo ""
echo "Variable Name: ANTHROPIC_API_KEY"
echo "Value: $ANTHROPIC_KEY"
echo ""
echo "Variable Name: RAPIDAPI_KEY"  
echo "Value: $RAPIDAPI_KEY"
echo ""
echo "Variable Name: RAPIDAPI_HOST"
echo "Value: similarweb-data.p.rapidapi.com"
echo ""
echo "Variable Name: STRIPE_SECRET_KEY"
echo "Value: $STRIPE_SECRET"
echo ""
echo "Variable Name: STRIPE_PUBLISHABLE_KEY"
echo "Value: $STRIPE_PUBLIC"
echo ""
echo "Variable Name: ENVIRONMENT"
echo "Value: production"
echo ""
echo "5. Click 'Save' after adding all variables"
echo "6. Cloudflare will automatically redeploy your site"
echo ""
echo "✅ Done! Wait ~2 minutes for deployment to complete"
