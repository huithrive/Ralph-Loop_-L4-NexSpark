#!/bin/bash

# NexSpark Ralph Loop
# Automated implementation loop for building NexSpark

set -e

MODE=${1:-build}
MAX_ITERATIONS=${2:-0}

if [ "$MODE" = "plan" ]; then
    PROMPT_FILE="PROMPT_plan.md"
    MAX_ITERATIONS=5
else
    PROMPT_FILE="PROMPT_build.md"
fi

if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found"
    exit 1
fi

if ! command -v claude &> /dev/null; then
    echo "Error: Claude CLI not found"
    echo "Install: https://docs.anthropic.com/en/docs/agents/claude-code"
    exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

echo "========================================"
echo "  NexSpark Ralph Loop"
echo "========================================"
echo "Mode:   $MODE"
echo "Prompt: $PROMPT_FILE"
echo "Branch: $CURRENT_BRANCH"
echo "Max:    $MAX_ITERATIONS iterations"
echo "========================================"
echo ""

ITERATION=0

while true; do
    ITERATION=$((ITERATION + 1))
    
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -gt $MAX_ITERATIONS ]; then
        echo ""
        echo "========================================"
        echo ""
        echo "✅ Reached max iterations: $MAX_ITERATIONS"
        echo ""
        echo "========================================"
        break
    fi
    
    echo ""
    echo "--- Iteration $ITERATION ---"
    echo ""
    
    # Run Claude with the prompt (non-interactive)
    if ! cat "$PROMPT_FILE" | claude --dangerously-skip-permissions --model claude-sonnet-4-20250514; then
        echo ""
        echo "⚠️  Claude execution failed. Continuing to next iteration..."
        echo ""
    fi
    
    # Push changes
    git push origin "$CURRENT_BRANCH" 2>/dev/null || true
    
    echo ""
done

echo ""
echo "✅ Ralph Loop completed!"
echo ""
