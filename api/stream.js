const request = require('request');

module.exports = (req, res) => {
  const url = new URL(`http://localhost${req.url}`);
  if (url.pathname === '/api/stream') {
    let streamUrl = req.query.url;
    if (!streamUrl) return res.redirect(302, 'https://bradio.dev');

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
      stream.pipe(res, { end: true });
    });

    stream.on('error', (err) => {
      console.error(`Stream error: ${err.message}`);
      res.status(500).end(`Stream error: ${err.message}`);
    });
  } else {
    res.redirect(302, 'https://bradio.dev');
  }
};