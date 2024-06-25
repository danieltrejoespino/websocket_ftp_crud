const connectButton = document.getElementById('connect')
const disconnectButton = document.getElementById('disconnect')
const user = document.getElementById('user')
const pass = document.getElementById('pass')
const log = document.getElementById('log')

const ftpCrud = document.getElementById('ftpCrud')
const inPath = document.getElementById('inPath')
const returnPath = document.getElementById('returnPath')
const tblFtp = document.getElementById('tblFtp')
const formFileMultiple = document.getElementById('formFileMultiple')
const btnUpload = document.getElementById('btnUpload')

let PATH = ['/']

connectButton.addEventListener('click', (e) => {
  e.preventDefault();
  if (user.value.trim() || pass.value.trim()) {
    openSocket()
  } else {
    // console.log('sin datos');
  }

})

disconnectButton.addEventListener('click', () => {
  socket.close();
});

const openSocket = () => {
  // socket = new WebSocket('ws://172.20.2.57:3002')
  socket = new WebSocket('wss://172.20.1.97:3002')
  socket.addEventListener('open', () => {
    socket.send(
      JSON.stringify({
        type: 'connect',
        host: '172.23.62.185',
        port: 1689,
        user: user.value.trim(),
        password: pass.value.trim()
        // user: 'dtrejo',
        // password: 'P4ssw0rd'
      })
    );
    connectButton.disabled = true
    disconnectButton.disabled = false;
  })

  socket.addEventListener('close', () => {
    eventLog('Desconectado del servidor')
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    ftpCrud.innerHTML = ""
    returnPath.hidden = true
    tblFtp.hidden = true

  });
  socket.addEventListener('error', (error) => {
    eventLog(`Error: ${error.message}`)

  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'connected') {
      eventLog(`Conexion ftp establecida`)
      socket.send(JSON.stringify({ user: user.value.trim(), type: 'list', path: createPath(0, PATH) }))

    } else if (message.method === 'list') {

      listPath(message.objData)

    } else if (message.method === 'get') {     
      eventLog(`Descargando el archivo: ${message.fileName}`)
      const link = document.createElement('a');
      link.href = 'data:application/octet-stream;base64,' + message.fileData;
      link.download = message.fileName;
      link.click();    
      eventLog(`Archivo: ${message.fileName} descargado`)


    } else {
      eventLog(`Metodo desconocido o aun no agregado`)
    }

  }) //message


}

const listPath = (data) => {
  const exepcions = ['.','..']

  ftpCrud.innerHTML = ""
  data.forEach(element => {
    let fileSizeInKB = element.size / 1024;
    let fileType
    let btnAccions = ''
    if (!exepcions.includes(element.name)) {
      if (element.type === 'd') {
        fileType = `
          <i class="fa-regular fa-folder"></i> Carpeta ${element.name}
        `
      } else if (element.type === '-') {
        fileType = ` <i class="fa-regular fa-file"></i> Archivo ${element.name} `
        btnAccions = `
          <button type="button" class="btn btn-outline-primary"
          onclick ="handleClick('${element.name}',1)"
          >
          Descargar
          <i class="fa-solid fa-download"></i>
          </button>   
          `
  
      } else {
        fileType = `
          <i class="fa-regular fa-folder"></i> Otro ${element.name}
        `
      }
      ftpCrud.innerHTML += `
        <tr colspan="2" >        
          <td class="files" ondblclick ="handleOpenFolder('${element.name}')" >${fileType}</td>
          <td class="files" >
          ${btnAccions}
          </td>
          <td>${formatDate(element.date)}</td>
          <td>${formatDate(element.date)}</td>
          <td>${fileSizeInKB} KB</td>
        </tr>    
      `
    }
  });

  returnPath.hidden = false
  tblFtp.hidden = false
}



const handleClick = (data,opcion) => {
  switch (opcion) {
    case 1:
      socket.send(JSON.stringify({
        type: 'get',
        user: user.value.trim(),
        file: data,
        path: createPath(0,PATH)
      }))
      break;
  case 2:
    socket.send(JSON.stringify({
      type: 'delete',
      user: user.value.trim(),
      file: data,
      path: createPath(0,PATH)
    }))
      break;
    default:
      break;
  }
  
};






const handleOpenFolder = (data) => {
  createPath(1,data)
  eventLog(`Mostrando archivos de la ruta: ${data}`)

  socket.send(JSON.stringify(
    {
      type: 'list',
      user: user.value.trim(),
      path: createPath(0,PATH),
    }))

};


returnPath.addEventListener('dblclick', (e) => {
  createPath(2,0)
  // eventLog(`Mostrando archivos de la ruta: ${data}`)

  socket.send(JSON.stringify(
    {
      type: 'list',
      user: user.value.trim(),
      path: createPath(0,PATH),
    }))
})




const createPath = (option, data) => {
  switch (option) {
    case 1:
      PATH.push(data);
      inPath.value = PATH.join('/')
      return PATH.join('/');
    case 2:
      if (PATH.length != 1) {
        PATH.pop();
      } else {
        alert('Ya estas en la carpeta raiz')
      }

      inPath.value = PATH.join('/')
      return PATH.join('/');
    default:
      inPath.value = PATH.join('/')
      return PATH.join('/')
  }
}


const formatDate = (accessTime) => {
  const fechaAcceso = new Date(accessTime);

  // Obtener los componentes de la fecha y la hora
  const dia = fechaAcceso.getDate().toString().padStart(2, '0');
  const mes = (fechaAcceso.getMonth() + 1).toString().padStart(2, '0'); // Se suma 1 porque los meses van de 0 a 11
  const anio = fechaAcceso.getFullYear();
  const horas = fechaAcceso.getHours().toString().padStart(2, '0');
  const minutos = fechaAcceso.getMinutes().toString().padStart(2, '0');
  const segundos = fechaAcceso.getSeconds().toString().padStart(2, '0');
  const fechaFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  return fechaFormateada
}



const eventLog = (text) => {
  // console.log(text);
  log.textContent += `${text} \n `
}