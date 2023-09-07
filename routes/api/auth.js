const express = require("express");

const ctrl = require("../../controllers/auth");

const { validate, authenticate, upload } = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();

router.post("/register", validate(schemas.regLogSchema), ctrl.register);

router.get("/verify/:verificationToken", ctrl.verify);

router.post(
  "/verify",
  validate(schemas.verificationEmailSchema),
  ctrl.resendVerification
);

router.post("/login", validate(schemas.regLogSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

router.get("/current", authenticate, ctrl.current);

router.patch("/", authenticate, ctrl.updateSub);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

module.exports = router;
