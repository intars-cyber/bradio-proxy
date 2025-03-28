const express = require('express');
const request = require('request');
const app = express();

app.get('/stream', (req, res) => {
  let streamUrl = req.query.url;
  if (!streamUrl) return res.status(400).send('No stream URL provided');

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
});

app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('BRadio Proxy Running - Use /stream?url=<stream-url>');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));