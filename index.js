const express = require('express');
const request = require('request');
const app = express();

app.use('/proxy', (req, res, next) => {
  console.log('Middleware hit for /proxy');
  if (req.path === '/stream') next();
  else res.redirect(302, 'https://bradio.dev');
});

app.get('/proxy/stream', (req, res) => {
  let streamUrl = req.query.url;
  if (!streamUrl) return res.redirect(302, 'https://bradio.dev');

  if (!streamUrl.match(/^https?:\/\//)) streamUrl = `https://${streamUrl}`;

  console.log(`Requesting stream: ${streamUrl}`);
  // Set headers immediately to start response
  res.set({
    'Content-Type': 'audio/aac',
    'Access-Control-Allow-Origin': 'https://bradio.dev',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive' // Ensure streaming
  });

  const stream = request({
    url: streamUrl,
    headers: { 'User-Agent': 'BRadio-App' },
    followRedirect: true,
    timeout: 5000
  });

  stream.on('response', (resp) => {
    console.log(`Stream response: ${resp.statusCode}, Content-Type: ${resp.headers['content-type']}`);
    console.log('Piping stream to response');
    stream.pipe(res, { end: true }); // Explicitly end response with stream
  });

  stream.on('error', (err) => {
    console.error(`Stream error: ${err.message}`);
    res.status(500).end(`Stream error: ${err.message}`);
  });
});

app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('BRadio Proxy Running - Use /proxy/stream');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));