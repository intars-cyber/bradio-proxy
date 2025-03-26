const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/', (req, res) => {
  res.redirect(302, 'https://bradio.dev');
});

app.get('/stream', async (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) return res.redirect(302, 'https://bradio.dev');

  console.log(`Requesting stream: ${streamUrl}`);

  try {
    const response = await fetch(streamUrl, {
      headers: { 'User-Agent': 'BRadio-App' },
      timeout: 5000
    });

    if (!response.ok) {
      console.error(`Stream error: ${response.status} ${response.statusText}`);
      return res.status(response.status).send(`Stream error: ${response.status} ${response.statusText}`);
    }

    console.log(`Stream response: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
    
    let contentType = response.headers.get('content-type')?.toLowerCase() || 'audio/mpeg';
    if (streamUrl.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
    else if (streamUrl.endsWith('.aac')) contentType = 'audio/aac';
    else if (streamUrl.endsWith('.mp3')) contentType = 'audio/mpeg';

    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': 'https://bradio.dev',
      'Cache-Control': 'no-cache'
    });

    response.body.pipe(res);
  } catch (err) {
    console.error(`Stream error: ${err.message}`);
    res.status(500).send(`Stream error: ${err.message}`);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));