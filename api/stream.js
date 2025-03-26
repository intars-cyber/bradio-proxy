const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.url === '/' || req.url === '/api' || !req.query.url) {
    res.statusCode = 302;
    res.setHeader('Location', 'https://bradio.dev');
    return res.end();
  }

  const streamUrl = req.query.url;
  console.log(`Requesting stream: ${streamUrl}`);

  try {
    const response = await fetch(streamUrl, {
      headers: { 'User-Agent': 'BRadio-App' },
      timeout: 5000
    });

    if (!response.ok) {
      console.error(`Stream error: ${response.status} ${response.statusText}`);
      res.statusCode = response.status;
      return res.end(`Stream error: ${response.status} ${response.statusText}`);
    }

    console.log(`Stream response: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
    
    let contentType = response.headers.get('content-type')?.toLowerCase() || 'audio/mpeg';
    if (streamUrl.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
    else if (streamUrl.endsWith('.aac')) contentType = 'audio/aac';
    else if (streamUrl.endsWith('.mp3')) contentType = 'audio/mpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', 'https://bradio.dev');
    res.setHeader('Cache-Control', 'no-cache');

    response.body.pipe(res);
  } catch (err) {
    console.error(`Stream error: ${err.message}`);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Stream error: ${err.message}`);
  }
};