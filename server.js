process.chdir(__dirname);
const fs = require('fs');
const { createServer } = require('http');
const next = require('next');

process.on('uncaughtException', (err) => {
  console.error('Server Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Server Unhandled Rejection:', reason);
});

const hasBuild = fs.existsSync(require('path').join(__dirname, '.next', 'BUILD_ID'));
const dev = process.env.NODE_ENV === 'development' || !hasBuild;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const host = req.headers.host || 'localhost:3000';
      const url = new URL(req.url || '/', 'http://' + host);

      if (url.pathname === '/health' || url.pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: Math.floor(process.uptime()) }));
        return;
      }

      await handle(req, res);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  server.listen(port, hostname, () => {
    console.log('> Ready on http://localhost:' + port + ' and http://' + hostname + ':' + port);
  });
}).catch(err => {
  console.error('Next.js prepare error:', err);
});
