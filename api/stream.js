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
    res.setHeader('Content-Type', 'audio/aac');
    res.setHeader('Access-Control-Allow-Origin', 'https://bradio.dev');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const response = await fetch(streamUrl, {
        headers: { 'User-Agent': 'BRadio-App' },
        redirect: 'follow'
      });

      console.log(`Stream response: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
      if (!response.ok) throw new Error(`Upstream returned ${response.status}`);

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
      console.error(`Stream error: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Stream error: ${err.message}`);
    }
  } else {
    console.log('Redirecting to bradio.dev');
    res.writeHead(302, { 'Location': 'https://bradio.dev' });
    res.end();
  }
};