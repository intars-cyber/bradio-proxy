const request = require('request');

module.exports = (req, res) => {
  // Handle streaming requests
  if (req.url.startsWith('/api/stream') && req.query.url) {
    console.log(`Requesting stream: ${req.query.url}`);
    const stream = request({
      url: req.query.url,
      headers: { 'User-Agent': 'BRadio-App' },
      followRedirect: true,
      timeout: 5000
    });

    stream.on('response', (resp) => {
      console.log(`Stream response: ${resp.statusCode}, Content-Type: ${resp.headers['content-type']}`);
      let contentType = resp.headers['content-type']?.toLowerCase() || 'audio/mpeg';
      if (req.query.url.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
      else if (req.query.url.endsWith('.aac')) contentType = 'audio/aac';
      else if (req.query.url.endsWith('.mp3')) contentType = 'audio/mpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', 'https://bradio.dev');
      res.setHeader('Cache-Control', 'no-cache');
      stream.pipe(res);
    });

    stream.on('error', (err) => {
      console.error(`Stream error: ${err.message}`);
      res.statusCode = 500;
      res.end(`Stream error: ${err.message}`);
    });
    return;
  }

  // Redirect all other requests to bradio.dev
  res.statusCode = 302;
  res.setHeader('Location', 'https://bradio.dev');
  res.end();
};