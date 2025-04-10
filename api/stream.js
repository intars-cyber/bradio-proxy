module.exports = async (req, res) => {
  console.log(`Request received: ${req.url}`);
  const url = new URL(`http://localhost${req.url}`);
  if (url.pathname === '/api/stream') {
    let streamUrl = req.query.url;
    if (!streamUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('No stream URL provided');
      return;
    }

    if (!streamUrl.match(/^https?:\/\//)) streamUrl = `https://${streamUrl}`;

    try {
      const headResponse = await fetch(streamUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': 'BRadio-App' },
        redirect: 'follow',
        signal: AbortSignal.timeout(5000)
      });

      if (!headResponse.ok) {
        res.writeHead(headResponse.status, { 'Content-Type': 'text/plain' });
        res.end(`Upstream error: ${headResponse.status}`);
        return;
      }

      const upstreamCors = headResponse.headers.get('Access-Control-Allow-Origin');
      const corsAllowed = upstreamCors === '*' || upstreamCors?.includes('https://bradio.dev');
      let corsHeader = corsAllowed ? upstreamCors : 'https://bradio.dev';

      if (corsAllowed) {
        // Redirect if CORS is already sufficient
        res.writeHead(302, {
          'Location': streamUrl,
          'Access-Control-Allow-Origin': corsHeader,
          'Cache-Control': 'no-cache'
        });
        res.end();
      } else {
        // Fallback to piping if CORS is missing
        const streamResponse = await fetch(streamUrl, {
          headers: { 'User-Agent': 'BRadio-App' },
          redirect: 'follow',
          signal: AbortSignal.timeout(50000) // 50s for Fluid Compute
        });

        if (!streamResponse.ok) {
          res.writeHead(streamResponse.status, { 'Content-Type': 'text/plain' });
          res.end(`Upstream error: ${streamResponse.status}`);
          return;
        }

        res.writeHead(200, {
          'Content-Type': streamResponse.headers.get('content-type') || 'audio/aac',
          'Access-Control-Allow-Origin': corsHeader,
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        streamResponse.body.pipeTo(new WritableStream({
          write(chunk) {
            res.write(chunk);
          },
          close() {
            res.end();
          },
          abort(err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Stream error: ${err.message}`);
          }
        }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Fetch error: ${err.message}`);
    }
  } else {
    res.writeHead(302, { 'Location': 'https://bradio.dev' });
    res.end();
  }
};

export const config = { runtime: "edge" };