const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const saltRounds = 10;

const generateToken = require("../configs/jwt.config");

const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const UserModel = require("../models/User.model");
const QuizModel = require("../models/Quiz.model");
const QuestionModel = require("../models/Question.model");

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
    const { nick, email, password } = req.body;

    if (!(password.length <= 24 && password.length >= 5)) {
      return res
        .status(400)
        .json({ message: "Senha deve ter entre 5 e 24 caracteres" });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: passwordHash,
    });

    delete newUser._doc.passwordHash;

    const mailOptions = {
      from: '"❗❓ GoQuiz" <goquiz@hotmail.com>',
      to: email,
      subject: "Verifique seu e-mail do GoQuiz",
      html: `  <div style="font-family: sans-serif; text-align: center;">
      <h1>GoQuiz</h1>
      <h3 style="margin: 20px;">Verificação de e-mail<h3>
          <p style="font-size: 12px; margin: 20px;">Bem vindo ao GoQuiz, <span style="color: green;">${nick}</span>, divirta-se criando e jogando quiz.</p>
          <p style="font-size: 12px; margin: 20px;">Proteja sua conta GoQuiz verificando seu e-mail.</p>
          <p style="font-size: 16px; margin: 20px;">Acesse o link abaixo para confirmar sua conta.</p>
          <p style="color: white; background-color: green; font-size: 16px; font-weight: bolder; margin: 20px; cursor: pointer; border: 1px solid black; padding: 4px;">http://localhost:4000/users/activate-account/${newUser._id}</p>
    </div>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/activate-account/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.send("Erro na ativação da conta");
    }

    await UserModel.findByIdAndUpdate(userId, {
      emailConfirm: true,
    });

    res.send(
      `<h1>E-mail verificado com sucesso</h1> <h3>Voltar para home</h3>`
    );
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

router.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    if (!loggedInUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const user = await UserModel.findById(loggedInUser._id, {
      passwordHash: 0,
    })
      .populate("favorites")
      .populate("quizzes");

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    const editedUser = await UserModel.findByIdAndUpdate(
      loggedInUser._id,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    delete editedUser._doc.passwordHash;
    return res.status(200).json(editedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const userId = req.currentUser._id;

    const deletedUser = await UserModel.findByIdAndDelete(userId);
    delete deletedUser._doc.passwordHash;

    const quizzesFromUser = await QuizModel.find({ author: userId });

    quizzesFromUser.forEach(async (quiz) => {
      quiz.questions.forEach(async (question) => {
        await QuestionModel.findByIdAndDelete(question._id);
      });
    });

    const deletedQuizzes = await QuizModel.deleteMany({ author: userId });

    return res.status(200).json({
      deletedUser: deletedUser,
      deletedQuizzes: deletedQuizzes,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/all", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const allUsers = await UserModel.find({}, { passwordHash: 0 });
    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/user/:userId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId, {
      passwordHash: 0,
    })
      .populate("favorites")
      .populate("quizzes");

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/addFav/:quizId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.currentUser._id;

    const addFav = await UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { favorites: quizId },
      },
      { new: true }
    );

    delete addFav._doc.passwordHash;

    return res.status(200).json(addFav);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put(
  "/removeFav/:quizId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    0;
    try {
      const { quizId } = req.params;
      const userId = req.currentUser._id;

      const removeFav = await UserModel.findByIdAndUpdate(
        userId,
        {
          $pull: { favorites: quizId },
        },
        { new: true }
      );

      delete removeFav._doc.passwordHash;

      return res.status(200).json(removeFav);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

module.exports = router;
