const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const UserModel = require("../models/User.model");
const QuizModel = require("../models/Quiz.model");
const QuestionModel = require("../models/Question.model");

router.post("/create/:quizId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { quizId } = req.params;

    const newQuestion = await QuestionModel.create({ ...req.body });

    await QuizModel.findByIdAndUpdate(
      quizId,
      {
        $push: { questions: newQuestion._id },
      },
      { new: true }
    );

    return res.status(201).json(newQuestion);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/all/:quizId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { quizId } = req.params;

    const allQuestions = await QuizModel.findById(quizId, {
      questions: 1,
    }).populate("questions");

    return res.status(200).json(allQuestions);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/edit/:questionId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { questionId } = req.params;

    const editedQuestion = await QuestionModel.findByIdAndUpdate(
      questionId,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json(editedQuestion);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete(
  "/delete/:questionId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { questionId } = req.params;

      const deletedQuestion = await QuestionModel.findByIdAndDelete(questionId);

      await QuizModel.updateOne(
        { questions: { $in: [questionId] } },
        {
          $pull: { questions: questionId },
        }
      );

      return res.status(200).json(deletedQuestion);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

module.exports = router;
