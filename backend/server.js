const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./config/config");

const app = express();
app.use(express.json());

// ✅ CORS Configuration for Production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (config.ALLOWED_ORIGINS.some(allowedOrigin => 
      origin === allowedOrigin || origin.startsWith(allowedOrigin.replace(/\/$/, ""))
    )) {
      return callback(null, true);
    }
    
    console.log(`❌ CORS Error: Origin ${origin} not allowed`);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Handle preflight requests
app.options('*', cors());

// ✅ Debug every incoming request globally
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  console.log(`🌐 Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// ✅ Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // In production, you might want to exit the process
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

connectDB();

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/forms", require("./routes/formRoutes"));

// ✅ Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Backend is running successfully",
    timestamp: new Date().toISOString(),
    frontend_url: config.FRONTEND_URL,
    environment: config.NODE_ENV
  });
});

// ✅ Test CORS endpoint
app.get("/api/test-cors", (req, res) => {
  res.json({ 
    message: "CORS is working properly",
    origin: req.headers.origin || "No origin header",
    timestamp: new Date().toISOString()
  });
});

// ✅ Catch-all for unmatched routes (debugging)
app.use((req, res) => {
  console.log(`❌ Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: "Route not found", 
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ Start server
const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
  console.log(`📧 Email configured: ${config.EMAIL_USER ? 'Yes' : 'No'}`);
});

// ✅ Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});
