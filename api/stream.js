const request = require('request');

module.exports = (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Missing stream URL');
  }

  const stream = request({
    url: streamUrl,
    headers: { 'User-Agent': 'BRadio-App' },
    followRedirect: true,
    timeout: 5000 // Stay under Vercel’s 10s limit
  });

  stream.on('response', (resp) => {
    console.log(`Stream response: ${resp.statusCode}, Content-Type: ${resp.headers['content-type']}`);

    // Set headers using native Node.js methods
    let contentType = resp.headers['content-type']?.toLowerCase() || 'audio/mpeg';
    if (streamUrl.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
    else if (streamUrl.endsWith('.aac')) contentType = 'audio/aac';
    else if (streamUrl.endsWith('.mp3')) contentType = 'audio/mpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', 'https://bradio.dev');
    res.setHeader('Cache-Control', 'no-cache');

    // Pipe the stream to the response
    stream.pipe(res);
  });

  stream.on('error', (err) => {
    console.error(`Stream error: ${err.message}`);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Stream error: ${err.message}`);
  });
};