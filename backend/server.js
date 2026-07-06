// import express from "express";
// import authRoutes from "./routes/auth.route.js";
// import productRoutes from "./routes/product.route.js";
// import cartRoutes from "./routes/cart.route.js";
// import couponRoutes from "./routes/coupon.route.js";
// import paymentsRoutes from "./routes/payment.route.js";
// import analyticsRoutes from "./routes/analytics.route.js";
// import { connectDB } from "./lib/db.js";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import userRoutes from './routes/user.route.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(express.json({ limit: "10mb" }));
// app.use(cookieParser())

// app.use("/api/auth", authRoutes)
// app.use("/api/products", productRoutes)
// app.use("/api/cart", cartRoutes)
// app.use("/api/coupons", couponRoutes)
// app.use("/api/payments", paymentsRoutes)
// app.use("/api/analytics", analyticsRoutes)
// app.use("/api/users", userRoutes); // this is new

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     connectDB();
// });

import path from "path";

import express from "express";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentsRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from './routes/user.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/payments", paymentsRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/users", userRoutes); // this is new

app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist", "index.html"));
  });
  

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});

