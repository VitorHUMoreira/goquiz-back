const mongoose = require("mongoose");

async function connect() {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      "Conectado com sucesso ao banco de dados:",
      dbConnection.connection.name
    );
  } catch (error) {
    console.log("Ocorreu um erro ao se conectar com o banco de dados", error);
  }
}

module.exports = connect;
