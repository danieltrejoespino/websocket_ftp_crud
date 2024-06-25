const https = require('https');
const WebSocket = require('ws');
const { handleWebSocketConnection } = require('./src/controller/websocketHandler');
const fs = require('fs');


const agent = new https.Agent({ rejectUnauthorized: false });
const server = https.createServer({
  cert: fs.readFileSync('./src/cert/server.cert'),
  key: fs.readFileSync('./src/cert/server.key'), 
  agent: agent
});

const wss = new WebSocket.Server({ server });

wss.on('connection', handleWebSocketConnection);

server.listen(3002, () => {
  console.log('WebSocket server started on wss://172.20.1.97:3002');
});












