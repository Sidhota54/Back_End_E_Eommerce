const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImages
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.post("/add", addFeatureImage);
router.delete("/delete/:id",deleteFeatureImages)
router.get("/get", getFeatureImages);

module.exports = router;
