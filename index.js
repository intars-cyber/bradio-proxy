const express = require('express');
const request = require('request');
const app = express();

// Enable CORS for bradio.dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://bradio.dev');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/stream', (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) {
    return res.status(400).send('Missing stream URL');
  }

  const requestOptions = {
    url: streamUrl,
    headers: { 'User-Agent': 'BRadio-App' },
    followRedirect: true,
    timeout: 10000
  };

  request(requestOptions)
    .on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).send('Stream error occurred');
    })
    .on('response', (resp) => {
      let contentType = resp.headers['content-type']?.toLowerCase() || 'audio/mpeg';
      if (streamUrl.endsWith('.m3u8')) {
        contentType = 'application/vnd.apple.mpegurl';
      } else if (streamUrl.endsWith('.aac')) {
        contentType = 'audio/aac';
      }
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
    })
    .pipe(res)
    .on('error', (err) => {
      console.error('Pipe error:', err);
      if (!res.headersSent) {
        res.status(500).send('Stream error occurred');
      }
    });
});

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 3000);
}

// Export for serverless
module.exports = app;