const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  header: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 128,
  },
  alternatives: [
    {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 128,
    },
  ],
  answer: { type: String, required: true, minLength: 1, maxLength: 32 },
});

const QuestionModel = mongoose.model("Question", questionSchema);

module.exports = QuestionModel;
