const express = require('express');
const request = require('request');
const app = express();

app.get('/stream', (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) return res.status(400).send('Missing stream URL');
  request({ url: streamUrl, headers: { 'User-Agent': 'BRadio-App' }, followRedirect: true, timeout: 10000 })
    .on('response', (resp) => {
      let contentType = resp.headers['content-type']?.toLowerCase() || 'audio/mpeg';
      if (streamUrl.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
      else if (streamUrl.endsWith('.aac')) contentType = 'audio/aac';
      else if (streamUrl.endsWith('.mp3')) contentType = 'audio/mpeg';
      res.set({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': 'https://bradio.dev',
        'Cache-Control': 'no-cache'
      });
    })
    .on('error', (err) => res.status(500).send(`Stream error: ${err.message}`))
    .pipe(res);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));