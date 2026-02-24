const express = require('express');

const ROUTE_REWRITES = [
  { from: '/interview', to: '/api/interview' },
  { from: '/reports', to: '/api/report' },
  { from: '/report', to: '/api/report' },
  { from: '/preview', to: '/api/preview' },
  { from: '/auth', to: '/api/auth' },
  { from: '/agent', to: '/api/agent' },
  { from: '/gtm-agent', to: '/api/gtm-agent' },
  { from: '/conversational-interview', to: '/api/conversational-interview' },
  { from: '/payment', to: '/api/payment' },
  { from: '/transcribe', to: '/api/transcribe' },
  { from: '/health', to: '/api/health' }
];

function resolveTargetPath(pathname) {
  for (const rule of ROUTE_REWRITES) {
    if (pathname === rule.from || pathname.startsWith(`${rule.from}/`)) {
      return pathname.replace(rule.from, rule.to);
    }
  }

  if (pathname === '/research' || pathname.startsWith('/research/')) {
    return null;
  }

  return `/api${pathname}`;
}

function buildProxyBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/x-www-form-urlencoded') && req.body && typeof req.body === 'object') {
    return new URLSearchParams(req.body).toString();
  }

  if (contentType.includes('application/json') && req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }

  if (typeof req.body === 'string') {
    return req.body;
  }

  if (req.body && Buffer.isBuffer(req.body)) {
    return req.body;
  }

  return undefined;
}

function filterHeaders(req) {
  const allowed = [
    'authorization',
    'content-type',
    'accept',
    'x-request-id',
    'user-agent'
  ];

  const headers = {};
  for (const header of allowed) {
    if (req.headers[header]) {
      headers[header] = req.headers[header];
    }
  }

  return headers;
}

function buildUpstreamHeaders(req) {
  const headers = filterHeaders(req);

  if (!headers.authorization && process.env.STRATEGIST_RUNTIME_BEARER_TOKEN) {
    headers.authorization = `Bearer ${process.env.STRATEGIST_RUNTIME_BEARER_TOKEN}`;
  }

  if (process.env.STRATEGIST_RUNTIME_API_KEY) {
    headers['x-api-key'] = process.env.STRATEGIST_RUNTIME_API_KEY;
  }

  return headers;
}

function createStrategistProxyRouter() {
  const router = express.Router();

  router.use(async (req, res) => {
    const strategistRuntimeUrl = process.env.STRATEGIST_RUNTIME_URL;
    if (!strategistRuntimeUrl) {
      return res.status(503).json({
        error: 'Strategist runtime unavailable',
        message: 'Set STRATEGIST_RUNTIME_URL to enable Strategist Part I proxy',
        baseline_path: 'backend/strategist',
        timestamp: new Date().toISOString()
      });
    }

    const targetPath = resolveTargetPath(req.path || '/');
    if (!targetPath) {
      return res.status(410).json({
        error: 'Legacy strategist research endpoint removed',
        message: 'Use Strategist Part I endpoints under /api/strategist/interview and /api/strategist/reports',
        timestamp: new Date().toISOString()
      });
    }

    const targetBase = strategistRuntimeUrl.replace(/\/+$/, '');
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `${targetBase}${targetPath}${query}`;

    try {
      const upstreamResponse = await fetch(targetUrl, {
        method: req.method,
        headers: buildUpstreamHeaders(req),
        body: buildProxyBody(req)
      });

      const contentType = upstreamResponse.headers.get('content-type') || '';
      res.status(upstreamResponse.status);

      if (contentType.includes('application/json')) {
        const data = await upstreamResponse.json();
        return res.json(data);
      }

      const text = await upstreamResponse.text();
      return res.send(text);
    } catch (error) {
      return res.status(502).json({
        error: 'Failed to proxy Strategist request',
        message: error.message,
        target_url: targetUrl,
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
}

module.exports = {
  createStrategistProxyRouter,
  resolveTargetPath
};
