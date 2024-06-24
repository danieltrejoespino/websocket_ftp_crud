const { connItahi } = require('../dbConfig/mysqlConfig');

const accionsMysql =  {
  conn: async (data) => {

    const connection = await connItahi(); 
    try {
      const [rows] = await connection.query("SELECT 1");
      return true; // Si la consulta es exitosa, devuelve true
    } catch (error) {
      console.error("Error validando la conexión:", error);
      throw new Error("No se pudo establecer la conexión con la base de datos");
    }finally {
      await connection.end(); // Cerrar la conexión
    }

  },
  log: async (user,data) => {
    console.log(data);
    const connection = await connItahi(); 
    try {
      const [rows] = await connection.query(`INSERT INTO TBL_LOG_FTP_SIM (USER_FTP,ACCION_SFTP) VALUES ('${user}','${data}')`);    

      return rows.affectedRows

    } catch (error) {
      console.error("Error validando la conexión:", error);
      throw new Error("No se pudo establecer la conexión con la base de datos");
    }finally {
      await connection.end(); // Cerrar la conexión
    }

  }
};

module.exports = { accionsMysql };