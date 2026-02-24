# Integration Guide

How to integrate the Landing Bridge service into your Node.js OpenClaw layer.

## Quick Start

### 1. Start the Bridge Service

```bash
cd ~/Downloads/Dev/nexspark/backend/services/landing-bridge
export ANTHROPIC_API_KEY="your_key_here"
./start.sh
```

Service will run on http://localhost:3002

### 2. Use from Node.js

```javascript
// In your executorModule or any Node.js service

const { generateLandingPage, healthCheck } = require('./services/landing-bridge/node_client');

// Check if service is running
const isHealthy = await healthCheck();
if (!isHealthy) {
  console.error('Landing bridge service not running!');
  return;
}

// Generate landing page
const result = await generateLandingPage({
  projectId: 'proj_xyz',
  brief: 'Create a landing page for premium coffee subscriptions',
  brandName: 'Brewly',
  industry: 'Food & Beverage',
  targetMarket: 'Coffee enthusiasts aged 25-45',
  changeType: 'content'
});

if (result.error) {
  console.error('Generation failed:', result.error);
} else {
  console.log('Generated:', result.artifactId);
  // Save result.code to file or database
  // Deploy to preview environment
}
```

## Example: OpenClaw Tool Integration

Create a new tool in your OpenClaw layer:

```javascript
// tools/generateLanding.js

const { generateLandingPage } = require('../services/landing-bridge/node_client');

async function executeTool({ projectId, brief, brandName, industry, targetMarket }) {
  try {
    const result = await generateLandingPage({
      projectId,
      brief,
      brandName,
      industry,
      targetMarket,
      changeType: 'content'
    });
    
    if (result.error) {
      return {
        success: false,
        error: result.error
      };
    }
    
    // Save to artifacts directory
    const fs = require('fs').promises;
    const artifactPath = `./artifacts/${result.artifactId}.jsx`;
    await fs.writeFile(artifactPath, result.code);
    
    return {
      success: true,
      artifactId: result.artifactId,
      title: result.title,
      path: artifactPath,
      code: result.code
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { executeTool };
```

## Example: Executor Module Integration

```javascript
// In your main executorModule.js

const landingBridge = require('./services/landing-bridge/node_client');

// Add to your tool registry
const tools = {
  // ... existing tools
  
  generateLandingPage: {
    description: 'Generate a landing page from brand info and brief',
    params: {
      projectId: { type: 'string', required: true },
      brief: { type: 'string', required: true },
      brandName: { type: 'string', required: true },
      industry: { type: 'string', required: true },
      targetMarket: { type: 'string', required: true },
      changeType: { type: 'string', default: 'content', enum: ['structural', 'content', 'micro'] }
    },
    execute: async (params) => {
      return await landingBridge.generateLandingPage(params);
    }
  }
};
```

## Error Handling

```javascript
try {
  const result = await generateLandingPage({...});
  
  if (result.error) {
    // Claude API error or generation failure
    console.error('Generation error:', result.error);
  } else {
    // Success - use result.code
  }
} catch (error) {
  // Network error or service down
  if (error.message.includes('not responding')) {
    console.error('Bridge service is not running. Start it with ./start.sh');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Process Management

### Development

```bash
# Terminal 1: Start bridge service
cd ~/Downloads/Dev/nexspark/backend/services/landing-bridge
./start.sh

# Terminal 2: Run your Node.js app
cd ~/Downloads/Dev/nexspark
node server.js
```

### Production

Use a process manager like PM2:

```bash
# ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'landing-bridge',
      cwd: './backend/services/landing-bridge',
      script: 'uvicorn',
      args: 'app:app --host 0.0.0.0 --port 3002',
      interpreter: 'python3',
      env: {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
      }
    },
    {
      name: 'main-server',
      script: 'server.js'
    }
  ]
};

# Start both services
pm2 start ecosystem.config.js
```

## Testing

### Test the bridge service directly

```bash
cd ~/Downloads/Dev/nexspark/backend/services/landing-bridge
python test_bridge.py
```

### Test from Node.js

```javascript
const { healthCheck, generateLandingPage } = require('./services/landing-bridge/node_client');

async function test() {
  // Health check
  console.log('Health:', await healthCheck());
  
  // Generate
  const result = await generateLandingPage({
    projectId: 'test_001',
    brief: 'Modern landing page for AI SaaS product',
    brandName: 'NexSpark',
    industry: 'Technology',
    targetMarket: 'B2B SaaS buyers',
    changeType: 'content'
  });
  
  console.log('Result:', result.artifactId);
  console.log('Code length:', result.code.length);
}

test().catch(console.error);
```

## Next Steps

1. **Preview Environment**: Deploy generated code to a preview URL (Vercel, Netlify, etc.)
2. **E2B Integration**: Connect to E2B sandbox for live previews
3. **Artifact Storage**: Save generated pages to database with versioning
4. **Style Transfer**: Implement style analysis and modification
5. **A/B Testing**: Generate multiple variants for testing

## Troubleshooting

**Service won't start:**
- Check ANTHROPIC_API_KEY is set
- Verify port 3002 is not in use: `lsof -i :3002`
- Check Python version: `python3 --version` (need 3.8+)

**Connection refused from Node.js:**
- Verify service is running: `curl http://localhost:3002/health`
- Check firewall settings
- Try explicit localhost in LANDING_BRIDGE_URL

**Claude API errors:**
- Verify API key is valid
- Check rate limits
- Look at FastAPI logs for detailed error messages

**Generated code issues:**
- Check template at `templates/page_template.jsx`
- Verify token structure in bridge_service.py
- Test token generation independently
