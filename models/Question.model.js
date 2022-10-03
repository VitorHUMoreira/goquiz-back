const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  header: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 32,
  },
  alternatives: [
    {
      type: String,
      minLength: 1,
      maxLength: 32,
    },
  ],
  answer: { type: String, minLength: 1, maxLength: 32 },
});

const QuestionModel = mongoose.model("Question", questionSchema);

module.exports = QuestionModel;
