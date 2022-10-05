const mongoose = require("mongoose");

async function connect() {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      "Successfully connected to the database:",
      dbConnection.connection.name
    );
  } catch (error) {
    console.log("Error connecting to database", error);
  }
}

module.exports = connect;
