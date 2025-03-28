const request = require('request');

module.exports = (req, res) => {
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

    const stream = request({
      url: streamUrl,
      headers: { 'User-Agent': 'BRadio-App' },
      followRedirect: true,
      timeout: 5000
    });

    stream.on('response', (resp) => {
      console.log(`Stream response: ${resp.statusCode}, Content-Type: ${resp.headers['content-type']}`);
      console.log('Piping stream to response');
      stream.pipe(res, { end: true });
    });

    stream.on('error', (err) => {
      console.error(`Stream error: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Stream error: ${err.message}`);
    });
  } else {
    console.log('Redirecting to bradio.dev');
    res.writeHead(302, { 'Location': 'https://bradio.dev' });
    res.end();
  }
};