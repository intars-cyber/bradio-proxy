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
      res.set({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': 'https://your-netlify-app.netlify.app',
        'Cache-Control': 'no-cache'
      });
    })
    .pipe(res);
});

app.listen(process.env.PORT || 3000);