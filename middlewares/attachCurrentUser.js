const UserModel = require("../models/User.model");

async function attachCurrentUser(req, res, next) {
  try {
    const loggedInUser = req.auth;

    const user = await UserModel.findById(loggedInUser._id, {
      passwordHash: 0,
    });

    if (!user.emailConfirm) {
      return res.status(400).json({ message: "Usuário não ativado" });
    }

    req.currentUser = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
}

module.exports = attachCurrentUser;
