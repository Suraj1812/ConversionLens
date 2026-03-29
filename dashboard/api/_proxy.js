const DEFAULT_BACKEND_ORIGIN = process.env.RAILWAY_BACKEND_URL || 'https://conversionlens-production.up.railway.app';

function buildUpstreamHeaders(requestHeaders) {
  const headers = new Headers(requestHeaders);

  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');
  headers.delete('x-forwarded-host');
  headers.delete('x-forwarded-proto');
  headers.delete('x-forwarded-for');

  return headers;
}

export async function proxyToBackend(request, upstreamPath) {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${upstreamPath}${incomingUrl.search}`, DEFAULT_BACKEND_ORIGIN);
  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: buildUpstreamHeaders(request.headers),
    body,
    redirect: 'manual'
  });

  const responseHeaders = new Headers(upstreamResponse.headers);

  responseHeaders.delete('content-length');
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('transfer-encoding');

  return new Response(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders
  });
}
