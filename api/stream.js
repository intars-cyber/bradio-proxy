module.exports = (req, res) => {
  console.log(`Request received: ${req.url}`);
  const url = new URL(`http://localhost${req.url}`);
  if (url.pathname === '/api/stream') {
    let streamUrl = req.query.url;
    if (!streamUrl) {
      console.log('No stream URL provided');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('No stream URL provided');
      return;
    }

    if (!streamUrl.match(/^https?:\/\//)) streamUrl = `https://${streamUrl}`;

    console.log(`Redirecting to stream: ${streamUrl}`);
    res.writeHead(302, { 'Location': streamUrl });
    res.end();
  } else {
    console.log('Redirecting to bradio.dev');
    res.writeHead(302, { 'Location': 'https://bradio.dev' });
    res.end();
  }
};