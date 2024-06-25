const ftp = require('ftp');
const {accionsMysql} = require('../model/modelMysql')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function handleFTPCommand(ws, command) {
  let client = ws.client || new ftp(); 

  try {
    switch (command.type) {
      case 'connect':
        if (ws.client) {
          ws.send(JSON.stringify({ status: 'error', message: 'Already connected' }));
          return;
        }       
        
        await accionsMysql.log(command.user,`Conectado a ftp: ${command.host}`)       

        client.on('ready', () => {
          console.log('FTP client ready');
          
          ws.send(JSON.stringify({ status: 'success', method: 'connected' }));
        });

        client.on('error', (error) => {
          console.error('FTP error:', error);
          ws.send(JSON.stringify({ status: 'error', message: error.message }));
        }); 
        const ftpOptions = {
          host: command.host,
          port: command.port,
          secure: true, 
          user: command.user,
          password: command.password
        };
        client.connect(ftpOptions);

        ws.client = client; 
        break;

      case 'disconnect':
        if (!ws.client) {
          ws.send(JSON.stringify({ status: 'error', message: 'Not connected' }));
          return;
        }

        await accionsMysql.log(command.user,`Desconectado del ftp`)
        console.log('Disconnecting');
        ws.client.end();
        ws.client = null; 

        ws.send(JSON.stringify({ status: 'disconnected' }));
        ws.close();
        break;

      case 'list':
        if (!ws.client) {
          ws.send(JSON.stringify({ status: 'error', message: 'Not connected' }));
          return;
        }

        const path = command.path || '/';
        
        accionsMysql.log(command.user,`Navego a ${path}`)

        ws.client.list(path, (err, list) => {
          if (err) {
            ws.send(JSON.stringify({ status: 'error', method: 'list', message: err.message }));
          } else {
            ws.send(JSON.stringify({ status: 'success', method: 'list', objData: list }));
          }
        });
        break;

      case 'get':
        
        let remoteFilePath = `${command.path}/${command.file}`;
        accionsMysql.log(command.user,`Descargo: ${remoteFilePath}`)
        
        ws.client.get(remoteFilePath, (err, stream) => {
          if (err) {
            ws.send(JSON.stringify({ status: 'error', method: 'get', message: err.message }));
            return;
          }

          let data = [];
          stream.on('data', (chunk) => {
            data.push(chunk);
          });

          stream.on('end', () => {
            const fileData = Buffer.concat(data);
            const base64FileData = fileData.toString('base64');
            const fileName = remoteFilePath.split('/').pop();
            ws.send(JSON.stringify({
              status: 'success',
              method: 'get',
              fileName: fileName,
              fileData: base64FileData
            }));
          });

          stream.on('error', (streamErr) => {
            ws.send(JSON.stringify({ status: 'error', method: 'get', message: streamErr.message }));
          });
        });
        break;


      default:
        console.log('Unknown command type:', command.type);
        ws.send(JSON.stringify({ status: 'error', message: 'Unknown command type' }));
        break;
    }
  } catch (error) {
    console.log(error);
    ws.send(JSON.stringify({ status: 'error', message: error.message }));
  }
}

module.exports = { handleFTPCommand };
