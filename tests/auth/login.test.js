const request = require("supertest");
const app = require("../../app");
require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../../models/user");
const { DB_HOST_TEST } = process.env;

const USER_DATA = {
  email: "12345@gmail.com",
  password: "12345",
};

const RESPONSE = {
  email: "12345@gmail.com",
  subscription: "starter",
};

describe("login user test", () => {
  beforeAll(async () => {
    await mongoose
      .connect(DB_HOST_TEST)
      .then(() => {
        console.log("Database connected successfully");
      })
      .catch((error) => {
        console.log(error);
      });

    await User.deleteMany();
  });

  test("should return user object with 2 fields: email and subscription after registration", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .send(USER_DATA);

    expect(response.body).toStrictEqual({
      user: RESPONSE,
    });
  });

  test("should return status code 200 after login", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "12345@gmail.com",
      password: "12345",
    });

    expect(response.statusCode).toBe(200);
  });

  test("should return token after token", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "12345@gmail.com",
      password: "12345",
    });

    expect(response.body.token).not.toBe("");
  });
});
