const { handleFTPCommand } = require('./ftpHandler');

function handleWebSocketConnection(ws,req) {
  console.log('Usuario conectado')
  ws.on('message', async function incoming(accions) {
    const ip = req.socket.remoteAddress;
    const command = JSON.parse(accions);
    console.log(`Received command: ${command.type} - ${ip}`);
    await handleFTPCommand(ws, command);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

module.exports = { handleWebSocketConnection };