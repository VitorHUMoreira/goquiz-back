const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  nick: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: 3,
    maxLength: 18,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
  },
  emailConfirm: { type: Boolean, default: false },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  favorites: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
  quizzes: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
