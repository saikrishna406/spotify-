process.chdir(__dirname);
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Prevent unexpected process.exit from shutting down server
const realExit = process.exit;
process.exit = function(code) {
  if (code === 0) {
    return realExit(0);
  }
  console.warn('⚠️ Prevented exit with code:', code);
  console.trace();
};

process.on('uncaughtException', (err) => {
  console.error('Server Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Server Unhandled Rejection:', reason);
});

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // Fast-path health check for monitors and IDE checkers
      if (parsedUrl.pathname === '/health' || parsedUrl.pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: Math.floor(process.uptime()) }));
        return;
      }

      await handle(req, res, parsedUrl);
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
    console.log(`> Ready on http://localhost:${port} and http://${hostname}:${port}`);
  });
}).catch(err => {
  console.error('Next.js prepare error:', err);
});
