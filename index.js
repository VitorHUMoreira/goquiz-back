const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnection = require("./configs/db.config");
dbConnection();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.REACT_APP_URI }));

const UsersRoute = require("./routes/users.routes");
app.use("/users", UsersRoute);

const QuizzesRoute = require("./routes/quizzes.routes");
app.use("/quizzes", QuizzesRoute);

const UploadImgRoute = require("./routes/uploadImg.routes");
app.use("/", UploadImgRoute);

app.listen(+process.env.PORT, () => {
  console.log("Servidor funcionando na porta:", process.env.PORT);
});
