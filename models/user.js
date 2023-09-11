const { Schema, model } = require("mongoose");

const Joi = require("joi");

const { HandleMongooseError } = require("../utils");

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: String,
  avatarURL: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

const regLogSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
});

const verificationEmailSchema = Joi.object({
  email: Joi.string().required(),
});

const schemas = { regLogSchema, verificationEmailSchema };

userSchema.post("save", HandleMongooseError);

const User = model("user", userSchema);

module.exports = { User, schemas };
