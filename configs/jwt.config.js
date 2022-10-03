const jwt = require("jsonwebtoken");

function generateToken(user) {
  const { _id, nick, email } = user;

  const signature = process.env.TOKEN_SIGN_SECRET;
  const expiration = "8h";

  return jwt.sign({ _id, nick, email }, signature, {
    expiresIn: expiration,
  });
}

module.exports = generateToken;
