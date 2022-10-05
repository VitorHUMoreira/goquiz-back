const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const UserModel = require("../models/User.model");
const QuizModel = require("../models/Quiz.model");
const QuestionModel = require("../models/Question.model");

router.post("/create", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const authorId = req.currentUser._id;

    const newQuiz = await QuizModel.create({ ...req.body, author: authorId });

    await UserModel.findByIdAndUpdate(
      authorId,
      {
        $push: { quizzes: newQuiz._id },
      },
      { new: true }
    );

    return res.status(201).json(newQuiz);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/all", async (req, res) => {
  try {
    const allQuizzes = await QuizModel.find({})
      .populate("author")
      .populate("questions");

    delete allQuizzes[0].author._doc.passwordHash;

    return res.status(200).json(allQuizzes);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/quiz/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await QuizModel.findById(quizId)
      .populate("author")
      .populate("questions");

    delete quiz.author._doc.passwordHash;

    return res.status(200).json(quiz);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/edit/:quizId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;
    const { quizId } = req.params;

    if (!loggedInUser.quizzes.includes(quizId)) {
      return res.status(400).json({ message: "Quiz not found" });
    }

    const editedQuiz = await QuizModel.findByIdAndUpdate(
      quizId,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json(editedQuiz);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete(
  "/delete/:quizId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const { quizId } = req.params;

      if (!loggedInUser.quizzes.includes(quizId)) {
        return res.status(400).json({ message: "Quiz not found" });
      }

      const deletedQuiz = await QuizModel.findByIdAndDelete(quizId);

      await UserModel.findByIdAndUpdate(deletedQuiz.author, {
        $pull: { quizzes: quizId, favorites: quizId },
      });

      await UserModel.updateMany(
        { favorites: { $in: [quizId] } },
        {
          $pull: { favorites: quizId },
        }
      );

      deletedQuiz.questions.forEach(async (question) => {
        await QuestionModel.findByIdAndDelete(question._id);
      });

      return res.status(200).json(deletedQuiz);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.put("/rating/:quizId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;
    const { quizId } = req.params;
    const userRating = req.body.rating;

    const quiz = await QuizModel.findById(quizId);

    if (quiz.ratings.length !== 0) {
      const arrayRatings = quiz.ratings.filter((rating) => {
        return !rating.user.equals(loggedInUser._id);
      });

      quiz.ratings.forEach(async (rating) => {
        if (rating.user.equals(loggedInUser._id)) {
          await QuizModel.findByIdAndUpdate(
            quizId,
            {
              ratings: [
                ...arrayRatings,
                { user: loggedInUser._id, rating: +userRating },
              ],
            },
            { new: true }
          );
        } else {
          await QuizModel.findByIdAndUpdate(
            quizId,
            {
              $push: {
                ratings: { user: loggedInUser._id, rating: +userRating },
              },
            },
            { new: true }
          );
        }
      });
    } else {
      await QuizModel.findByIdAndUpdate(
        quizId,
        {
          $push: {
            ratings: { user: loggedInUser._id, rating: +userRating },
          },
        },
        { new: true }
      );
    }

    return res.status(200).json();
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

module.exports = router;
