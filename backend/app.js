require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/categories", categoryRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found." }));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

module.exports = app;
