const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quizSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 18,
  },
  description: {
    type: String,
    maxLength: 128,
  },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  rating: { type: String, default: "0" },
  plays: { type: Number, default: 0 },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
});

const QuizModel = mongoose.model("Quiz", quizSchema);

module.exports = QuizModel;
