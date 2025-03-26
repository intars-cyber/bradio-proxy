const request = require('request');

module.exports = (req, res) => {
  // Check if this is a streaming request with a URL
  if (req.query.url) {
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

  // For all other requests, redirect to bradio.dev
  console.log(`Redirecting to bradio.dev from path: ${req.url}`);
  res.writeHead(302, {
    'Location': 'https://bradio.dev'
  });
  res.end();
};