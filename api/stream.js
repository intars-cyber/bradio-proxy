const request = require('request');

module.exports = (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) return res.status(400).send('Missing stream URL');

  const stream = request({
    url: streamUrl,
    headers: { 'User-Agent': 'BRadio-App' },
    followRedirect: true,
    timeout: 5000 // Reduced to 5s to stay under Vercel’s 10s limit
  });

  stream.on('response', (resp) => {
    // Log status for debugging
    console.log(`Stream response: ${resp.statusCode}, Content-Type: ${resp.headers['content-type']}`);

    // Set content type based on URL or response
    let contentType = resp.headers['content-type']?.toLowerCase() || 'audio/mpeg';
    if (streamUrl.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
    else if (streamUrl.endsWith('.aac')) contentType = 'audio/aac';
    else if (streamUrl.endsWith('.mp3')) contentType = 'audio/mpeg';

    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': 'https://bradio.dev',
      'Cache-Control': 'no-cache'
    });

    // Pipe only after headers are set
    stream.pipe(res);
  });

  stream.on('error', (err) => {
    console.error(`Stream error: ${err.message}`);
    res.status(500).send(`Stream error: ${err.message}`);
  });
};