const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });
let viewers = 0;
let cloudPosition = { x: 0, y: 0 };

wss.on('connection', (ws) => {
  viewers++;
  broadcast({ type: 'viewers', count: viewers });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'position') {
      cloudPosition = data;
      broadcast({ type: 'position', x: cloudPosition.x, y: cloudPosition.y });
    }
  });

  ws.on('close', () => {
    viewers--;
    broadcast({ type: 'viewers', count: viewers });
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Start server
server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
