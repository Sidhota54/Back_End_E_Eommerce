const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImages
} = require("../../controllers/common/feature-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/add",authMiddleware(true), addFeatureImage);
router.delete("/delete/:id",authMiddleware(true),deleteFeatureImages);
router.get("/get", getFeatureImages);

module.exports = router;
