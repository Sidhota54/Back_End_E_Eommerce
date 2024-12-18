const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({ origin: true, credentials: true }));

// Handle pre-flight requests for all routes
// app.options('*', cors());
// app.use(
//   cors({
//     origin: "*", // Allow all origins
//     methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"], // Allow all common methods
//     allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Expires", "Pragma"], // Allow these headers
//     credentials: true // Optional: Allow credentials if needed
//   })
// );
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "DELETE", "PUT"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "Cache-Control",
//       "Expires",
//       "Pragma",
//     ],
//     credentials: true,
//   })
// );

app.use(cookieParser());
app.use(express.json());
app.get('/',(req, res) => {
    res.status(200).json({ message: "Wellcome to Ecom Backend" })
})
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/common/feature", commonFeatureRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);



app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
