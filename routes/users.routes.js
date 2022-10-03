const express = require("express");
const router = express.Router();

const UserModel = require("../models/User.model");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const generateToken = require("../configs/jwt.config");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");
const nodemailer = require("nodemailer");

// E-MAIL
// let transporter = nodemailer.createTransport({
//   service: "Hotmail",
//   auth: {
//     secure: false,
//     user: "lab-recipes@hotmail.com",
//     pass: process.env.MAIL_PASSWORD,
//   },
// });

module.exports = router;
