const express = require("express");

const ctrl = require("../../controllers/auth");

const { validate, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();

router.post("/register", validate(schemas.regLogSchema), ctrl.register);

router.post("/login", validate(schemas.regLogSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

router.post("/current", authenticate, ctrl.current);

router.patch("/users", authenticate, ctrl.updateSub);

module.exports = router;
