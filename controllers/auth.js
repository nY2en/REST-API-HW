const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { ctrlWrapper, HttpError } = require("../utils");

const { SECRET_WORD } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;

  const isUserInDb = await User.findOne({ email });

  if (isUserInDb) {
    throw HttpError(409, "Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashedPassword });
  res.status(201).json({
    user: {
      email: newUser.email,
      subscriptrion: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const isUserInDb = await User.findOne({ email });

  if (!isUserInDb) {
    throw HttpError(401, "Email or password is wrong");
  }

  const isPasswordCorrect = await bcrypt.compare(password, isUserInDb.password);

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

  const result = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  res.json(result);
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateSub: ctrlWrapper(updateSub),
};
