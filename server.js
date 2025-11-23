const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ---------- Middlewares ----------
app.use(express.json());
app.use(cors());
// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Optional console request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ---------- MongoDB Connection ----------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kelale")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));


// ---------- Import Routes ----------
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/buses");
const bookingRoutes = require("./routes/bookingRoutes");
const companyRoutes = require("./routes/companies");
const routeRoutes = require("./routes");
const scheduleRoutes = require("./routes/schedules");

// ---------- Route Handlers ----------
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/schedules", scheduleRoutes);

// ---------- Fix: API root message ----------
app.get("/api", (req, res) => {
  res.json({ message: "Kelale Transport API is running 🚍" });
});

// ---------- Fix: Prevent 'Cannot GET /' ----------
app.get("/", (req, res) => {
  res.send("Kelale Transport Backend API is running.");
});

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
