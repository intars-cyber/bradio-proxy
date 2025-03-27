const express = require('express');
const request = require('request');
const app = express();

// Middleware for /proxy subpath
app.use('/proxy', (req, res, next) => {
  if (req.path === '/stream') next();
  else res.redirect(302, 'https://bradio.dev');
});

// Stream endpoint at /proxy/stream
app.get('/proxy/stream', (req, res) => {
  let streamUrl = req.query.url;
  if (!streamUrl) return res.redirect(302, 'https://bradio.dev');

  if (!streamUrl.match(/^https?:\/\//)) streamUrl = `https://${streamUrl}`;

  console.log(`Requesting stream: ${streamUrl}`);
  const stream = request({
    url: streamUrl,
    headers: { 'User-Agent': 'BRadio-App' },
    followRedirect: true,
    timeout: 5000
  });

  stream.on('response', (resp) => {
    console.log(`Stream response: ${resp.statusCode}, Content-Type: ${resp.headers['content-type']}`);
    const rawContentType = resp.headers['content-type'];
    let contentType = rawContentType ? rawContentType.toLowerCase() : 'audio/mpeg';
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

// Root fallback
app.get('/', (req, res) => {
  res.send('BRadio Proxy Running - Use /proxy/stream');
});

// Use process.env.PORT for Koyeb (set to 8000 internally)
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));