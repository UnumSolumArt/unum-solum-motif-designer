import type { Handler, HandlerEvent } from '@netlify/functions';

/**
 * Proxy générique vers Rhino Compute.
 * Forwarde toute requête /api/solve/<path> vers ${RHINO_COMPUTE_URL}/<path>,
 * en injectant le header RhinoComputeKey côté serveur.
 *
 * En dev local : RHINO_COMPUTE_URL=http://localhost:5000 (Rhino Compute lancé).
 * En prod : URL Cloudflare Tunnel ou IP du VPS Windows.
 */
export const handler: Handler = async (event: HandlerEvent) => {
  const RHINO_URL = process.env.RHINO_COMPUTE_URL;
  const RHINO_KEY = process.env.RHINO_COMPUTE_KEY ?? '';

  if (!RHINO_URL) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          'RHINO_COMPUTE_URL not configured. Set it in .env (dev) or Netlify dashboard (prod).',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const subPath = stripPrefix(event.path, '/api/solve');
  const target = joinUrl(RHINO_URL, subPath, event.rawQuery);

  const headers: Record<string, string> = {
    'Content-Type': event.headers['content-type'] ?? 'application/json',
  };
  if (RHINO_KEY) {
    headers['RhinoComputeKey'] = RHINO_KEY;
  }

  let res: Response;
  try {
    res = await fetch(target, {
      method: event.httpMethod,
      headers,
      body:
        event.httpMethod === 'GET' || event.httpMethod === 'HEAD'
          ? undefined
          : event.body ?? undefined,
    });
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: 'Failed to reach Rhino Compute',
        target,
        detail: err instanceof Error ? err.message : String(err),
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const body = await res.text();
  const responseContentType = res.headers.get('content-type') ?? 'application/json';

  return {
    statusCode: res.status,
    body,
    headers: { 'Content-Type': responseContentType },
  };
};

function stripPrefix(path: string, prefix: string): string {
  if (path.startsWith(prefix)) {
    const rest = path.slice(prefix.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return path;
}

function joinUrl(base: string, subPath: string, rawQuery: string): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = subPath.startsWith('/') ? subPath : `/${subPath}`;
  const query = rawQuery ? `?${rawQuery}` : '';
  return `${cleanBase}${cleanPath}${query}`;
}
