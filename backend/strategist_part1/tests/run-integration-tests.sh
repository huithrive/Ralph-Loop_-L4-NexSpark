#!/bin/bash

# Integration Test Runner for SimilarWeb Traffic Data Tool
# Loads environment from .dev.vars and runs tests

echo "🧪 Loading environment variables from .dev.vars..."

# Check if .dev.vars exists
if [ ! -f ".dev.vars" ]; then
    echo ".dev.vars file not found"
    exit 1
fi

# Load environment variables from .dev.vars
export $(grep -v '^#' .dev.vars | xargs)

echo "Environment loaded"

# Build the project first
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi

echo "Build successful"

# Run the integration test
echo ""
echo "🚀 Running integration tests..."
echo ""

node --loader tsx tests/integration/traffic-data-tool.test.ts

exit $?