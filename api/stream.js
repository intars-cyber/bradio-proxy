export default async function handler(req) {
  const url = new URL(req.url, 'http://localhost');
  console.log(`Request received: ${req.url}`);

  if (url.pathname === '/api/stream') {
    const streamUrl = url.searchParams.get('url');
    if (!streamUrl) {
      console.log('No stream URL provided');
      return new Response('No stream URL provided', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const normalizedUrl = streamUrl.match(/^https?:\/\//) ? streamUrl : `https://${streamUrl}`;
    console.log(`Checking stream: ${normalizedUrl}`);

    try {
      const headResponse = await fetch(normalizedUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': 'BRadio-App' },
        redirect: 'follow',
        signal: AbortSignal.timeout(5000)
      });

      if (!headResponse.ok) {
        console.error(`HEAD request failed: ${headResponse.status}`);
        return new Response(`Upstream error: ${headResponse.status}`, {
          status: headResponse.status,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      const upstreamCors = headResponse.headers.get('Access-Control-Allow-Origin');
      const corsAllowed = upstreamCors === '*' || upstreamCors?.includes('https://bradio.dev');
      const corsHeader = corsAllowed ? upstreamCors : 'https://bradio.dev';
      console.log(`Upstream CORS: ${upstreamCors}, using: ${corsHeader}`);

      if (corsAllowed) {
        console.log(`Redirecting to: ${normalizedUrl}`);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': normalizedUrl,
            'Access-Control-Allow-Origin': corsHeader,
            'Cache-Control': 'no-cache'
          }
        });
      }

      // Fallback to streaming if no CORS
      const streamResponse = await fetch(normalizedUrl, {
        headers: { 'User-Agent': 'BRadio-App' },
        redirect: 'follow'
      });

      if (!streamResponse.ok) {
        console.error(`Stream request failed: ${streamResponse.status}`);
        return new Response(`Upstream error: ${streamResponse.status}`, {
          status: streamResponse.status,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      console.log(`Streaming from: ${normalizedUrl}`);
      return new Response(streamResponse.body, {
        status: 200,
        headers: {
          'Content-Type': streamResponse.headers.get('content-type') || 'audio/aac',
          'Access-Control-Allow-Origin': corsHeader,
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } catch (err) {
      console.error(`Error: ${err.message}`);
      return new Response(`Fetch error: ${err.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }

  console.log('Redirecting to bradio.dev');
  return new Response(null, {
    status: 302,
    headers: { 'Location': 'https://bradio.dev' }
  });
}

export const config = { runtime: 'edge' };