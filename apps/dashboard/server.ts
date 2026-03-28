/// <reference types="bun" />
const port = Number(process.env.PORT ?? '5173');
const distRoot = new URL('./dist/', import.meta.url);
const apiProxyUrl = process.env.API_PROXY_URL ?? 'http://api:3001';
const graphQlProxyUrl = process.env.GRAPHQL_PROXY_URL ?? 'https://graphql.testnet.sui.io';

const contentTypes = new Map<string, string>([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function extensionFor(pathname: string): string {
  const dotIndex = pathname.lastIndexOf('.');
  return dotIndex >= 0 ? pathname.slice(dotIndex) : '';
}

async function serveFile(pathname: string): Promise<Response | null> {
  const normalized = pathname === '/' ? '/index.html' : pathname;
  const fileUrl = new URL(`.${normalized}`, distRoot);
  const file = Bun.file(fileUrl);

  if (!(await file.exists())) {
    return null;
  }

  return new Response(file, {
    headers: {
      'content-type': contentTypes.get(extensionFor(normalized)) ?? 'application/octet-stream',
    },
  });
}

async function proxyRequest(request: Request, targetBaseUrl: string): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, targetBaseUrl);
  const method = request.method.toUpperCase();
  const headers = new Headers(request.headers);
  headers.delete('host');

  const init: RequestInit = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = request.body;
  }

  return fetch(targetUrl, init);
}

Bun.serve({
  hostname: '0.0.0.0',
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return proxyRequest(request, apiProxyUrl);
    }

    if (url.pathname === '/graphql') {
      return proxyRequest(request, graphQlProxyUrl);
    }

    const direct = await serveFile(url.pathname);

    if (direct) {
      return direct;
    }

    const fallback = Bun.file(new URL('./index.html', distRoot));
    return new Response(fallback, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    });
  },
});

console.log(`frontier-sentinel-dashboard serving on ${port}`);
