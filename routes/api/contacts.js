const express = require("express");

const router = express.Router();

const ctrl = require("../../controllers/contacts");
const { validate, isValidId, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/contact");

router.get("/", authenticate, ctrl.getAll);

router.get("/:contactId", authenticate, isValidId, ctrl.getById);

router.post("/", authenticate, validate(schemas.addSchema), ctrl.add);

router.delete("/:contactId", authenticate, isValidId, ctrl.remove);

router.put(
  "/:contactId",
  authenticate,
  isValidId,
  validate(schemas.addSchema),
  ctrl.updateById
);

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  validate(schemas.updateFavorite),
  ctrl.updateById
);

module.exports = router;
