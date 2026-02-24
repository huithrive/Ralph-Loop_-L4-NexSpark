#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Starting Landing Bridge Service on port 3002..."
echo ""

# Check if ANTHROPIC_API_KEY is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  Warning: ANTHROPIC_API_KEY environment variable not set"
    echo "   Please set it before making API calls"
    echo ""
fi

# Install requirements quietly
echo "📦 Installing dependencies..."
pip install -r requirements.txt -q

echo ""
echo "✅ Starting FastAPI server..."
echo "   URL: http://localhost:3002"
echo "   Docs: http://localhost:3002/docs"
echo ""

uvicorn app:app --host 0.0.0.0 --port 3002 --reload
