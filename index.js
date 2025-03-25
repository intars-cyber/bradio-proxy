const express = require('express');
const request = require('request');
const app = express();

app.get('/stream', (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) return res.status(400).send('Missing stream URL');

  console.log(`Requesting stream: ${streamUrl}`);
  const stream = request({
    url: streamUrl,
    headers: { 'User-Agent': 'BRadio-App' },
    followRedirect: true,
    timeout: 5000 // 5s to avoid Glitch timeout
  });

  stream.on('response', (resp) => {
    console.log(`Stream response: ${resp.statusCode}, Content-Type: ${resp.headers['content-type']}`);
    let contentType = resp.headers['content-type']?.toLowerCase() || 'audio/mpeg';
    if (streamUrl.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
    else if (streamUrl.endsWith('.aac')) contentType = 'audio/aac';
    else if (streamUrl.endsWith('.mp3')) contentType = 'audio/mpeg';
    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': 'https://bradio.dev',
      'Cache-Control': 'no-cache'
    });
    stream.pipe(res);
  });

  stream.on('error', (err) => {
    console.error(`Stream error: ${err.message}`);
    res.status(500).send(`Stream error: ${err.message}`);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));