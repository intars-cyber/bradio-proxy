module.exports = async (req, res) => {
  console.log(`Request received: ${req.url}`);
  const url = new URL(`http://localhost${req.url}`);
  if (url.pathname === '/api/stream') {
    let streamUrl = req.query.url;
    if (!streamUrl) {
      console.log('No stream URL provided');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('No stream URL provided');
      return;
    }

    if (!streamUrl.match(/^https?:\/\//)) streamUrl = `https://${streamUrl}`;

    console.log(`Requesting stream: ${streamUrl}`);
    res.writeHead(200, {
      'Content-Type': 'audio/aac',
      'Access-Control-Allow-Origin': 'https://bradio.dev',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    try {
      const response = await fetch(streamUrl, {
        headers: { 'User-Agent': 'BRadio-App' },
        redirect: 'follow'
      });

      if (!response.ok) {
        console.error(`Upstream error: ${response.status}`);
        res.writeHead(response.status, { 'Content-Type': 'text/plain' });
        res.end(`Upstream error: ${response.status}`);
        return;
      }

      console.log(`Stream response: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
      response.body.pipeTo(new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
        abort(err) {
          console.error(`Stream error: ${err.message}`);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Stream error: ${err.message}`);
        }
      }));
    } catch (err) {
      console.error(`Fetch error: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Fetch error: ${err.message}`);
    }
  } else {
    console.log('Redirecting to bradio.dev');
    res.writeHead(302, { 'Location': 'https://bradio.dev' });
    res.end();
  }
};