const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  nick: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  passwordHash: { type: String, required: true },
  // colocar usuario sem conta e com conta
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  emailConfirm: { type: Boolean, default: false },
  // quizzes
});

const UserModel = mongoose.model("User", userSchema);

module.exports = ClientModel;
