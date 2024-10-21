const express = require("express");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.get("/get",authMiddleware(true), getAllOrdersOfAllUsers);
router.get("/details/:id",authMiddleware(true), getOrderDetailsForAdmin);
router.put("/update/:id",authMiddleware(true), updateOrderStatus);

module.exports = router;
