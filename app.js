const WebSocket = require('ws');
const { handleWebSocketConnection } = require('./src/controller/websocketHandler');

const wss = new WebSocket.Server({ port: 3002 });

wss.on('connection', handleWebSocketConnection);

console.log('WebSocket server started on ws://localhost:3002');