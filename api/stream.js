const request = require('request');

module.exports = (req, res) => {
  console.log(`Request received: ${req.url}`);
  const url = new URL(`http://localhost${req.url}`);
  if (url.pathname === '/api/stream') {
    let streamUrl = req.query.url;
    if (!streamUrl) {
      console.log('No stream URL provided');
      res.status(400).end('No stream URL provided');
      return;
    }

    if (!streamUrl.match(/^https?:\/\//)) streamUrl = `https://${streamUrl}`;

    console.log(`Requesting stream: ${streamUrl}`);
    res.set({
      'Content-Type': 'audio/aac',
      'Access-Control-Allow-Origin': 'https://bradio.dev',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

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
      res.status(500).end(`Stream error: ${err.message}`);
    });
  } else {
    console.log('Redirecting to bradio.dev');
    res.redirect(302, 'https://bradio.dev');
  }
};