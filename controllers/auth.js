const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const gravatar = require("gravatar");
const jimp = require("jimp");
const { nanoid } = require("nanoid");

const { User } = require("../models/user");
const { ctrlWrapper, HttpError, sendEmail } = require("../utils");

const { SECRET_WORD, BASE_URL } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;

  const isUserInDb = await User.findOne({ email });

  if (isUserInDb) {
    throw HttpError(409, "Email in use");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const avatarURL = gravatar.url(email);

  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });

  const emailOptions = {
    to: email,
    subject: "REGISTRATION VERIFICATION",
    html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}">Verify your email</a>`,
  };

  await sendEmail(emailOptions);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const isUserInDb = await User.findOne({ verificationToken });

  if (!isUserInDb) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(isUserInDb._id, {
    verificationToken: null,
    verify: true,
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerificationToken = async (req, res) => {
  const { email } = req.body;

  const isUserInDb = await User.findOne({ email });

  if (!isUserInDb) {
    throw HttpError(404, "User not found");
  }

  if (isUserInDb.verify) {
    throw HttpError(401, "Verification has already been passed");
  }

  const emailOptions = {
    to: email,
    subject: "REGISTRATION VERIFICATION",
    html: `<a href="${BASE_URL}/api/users/verify/${isUserInDb.verificationToken}">Verify your email</a>`,
  };

  await sendEmail(emailOptions);
  res.json({
    message: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const isUserInDb = await User.findOne({ email });

  if (!isUserInDb) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!isUserInDb.verify) {
    throw HttpError(401, "User email not verified");
  }

  const isPasswordCorrect = bcrypt.compareSync(password, isUserInDb.password);

  if (!isPasswordCorrect) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: isUserInDb._id,
  };

  const token = jwt.sign(payload, SECRET_WORD, { expiresIn: "1h" });

  await User.findByIdAndUpdate(isUserInDb._id, { token });
  res.json({
    token,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};

const current = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const updateSub = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;

  await User.findByIdAndUpdate(_id, { subscription }, { new: true });
  res.json({ subscription });
};

const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "Bad Request");
  }

  const { _id } = req.user;
  const { path: tempPath, originalname } = req.file;
  const fileName = `${_id}_${originalname}`;
  const avatarURL = path.join("avatars", fileName);
  const newPath = path.join(__dirname, "../", "public", "avatars", fileName);

  const picture = await jimp.read(tempPath);
  picture.resize(250, 250).write(tempPath);

  await fs.rename(tempPath, newPath);

  await User.findByIdAndUpdate(_id, { avatarURL }, { new: true });

  res.status(200).json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  verify: ctrlWrapper(verify),
  resendVerificationToken: ctrlWrapper(resendVerificationToken),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateSub: ctrlWrapper(updateSub),
  updateAvatar: ctrlWrapper(updateAvatar),
};
