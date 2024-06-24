const mysql = require('mysql2/promise');


 
// const envO = {
//   host: "172.20.1.97",
//   user: "msn_impulse",
//   password: "m5N1mpul53*"  
// }

const envO = {
  host: "195.179.238.1",
  user: "u466684088_daniel_trejo",
  password: "4Jl[bdxI0#",
  database : 'u466684088_imp_internal',
}


async function connItahi() {
  return await mysql.createConnection({
    host: envO.host,
    user: envO.user,
    password: envO.password,
    database: envO.database,
    // port : 3306

  });
}

 

module.exports = { connItahi };



