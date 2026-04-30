require("dotenv").config();

const express = require("express");
const cors = require("cors");


const customerRoutes = require("./routes/customer.routes");

const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());


// 🔹 Routes
app.use("/", customerRoutes);

// 🔹 Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Chat Service",
    timestamp: new Date()
  });
});

// 🔹 Root
app.get("/", (req, res) => {
  res.send("🚀 Chat Service is running...");
});

// 🔹 Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// 🔹 Handle Unhandled Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// 🔹 Start Server
const PORT = process.env.CUSTOMER_SUPPORT_PORT ;

app.listen(PORT, () => {
  console.log(`🚀 Chat Service running on port ${PORT}`);
});