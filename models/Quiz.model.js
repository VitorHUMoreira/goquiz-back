const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quizSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 32,
    },
    description: {
      type: String,
      maxLength: 128,
    },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, default: 0, min: 0 },
      },
    ],
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

const QuizModel = mongoose.model("Quiz", quizSchema);

module.exports = QuizModel;
