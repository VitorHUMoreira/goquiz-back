const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const saltRounds = 10;

const generateToken = require("../configs/jwt.config");

const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");

const UserModel = require("../models/User.model");

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "Hotmail",
  auth: {
    secure: false,
    user: "goquiz@hotmail.com",
    pass: process.env.MAIL_PASSWORD,
  },
});

router.post("/sign-up", async (req, res) => {
  try {
    const { password, email } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Senha não atende os requisitos de segurança" });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    console.log(salt);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log(passwordHash);

    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: passwordHash,
    });

    delete newUser._doc.passwordHash;

    const mailOptions = {
      from: '"❗❓ GoQuiz" <goquiz@hotmail.com>',
      to: email,
      subject: "Verifique seu e-mail do GoQuiz",
      html: `  <h2 style="text-align: center;">Verificação de e-mail<h2>

      <a style="margin: 0 auto;" href="http://localhost:4000/users/activate-account/${newUser._id}" target="_blank" rel="noopener noreferrer"><button>Verificar e-mail</button></a>
      <br>
      <p style="font-size: 12px; text-align: center;">Proteja sua conta GoQuiz verificando seu e-mail.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/activate-account/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    const user = await UserModel.findById(idUser);

    if (!user) {
      return res.send("Erro na ativação da conta");
    }

    await UserModel.findByIdAndUpdate(idUser, {
      emailConfirm: true,
    });

    res.send(`<h1>Usuário ativado</h1>`);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor, informe seu email e senha." });
    }

    const user = await UserModel.findOne({ email: email });

    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;
      const token = generateToken(user);
      return res.status(200).json({
        token: token,
        user: user,
      });
    } else {
      return res.status(400).json({ message: "E-mail ou senha incorretos!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

module.exports = router;
