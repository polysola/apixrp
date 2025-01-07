require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "https://www.xrpthink.org",
  "https://xrpthink.org",
  "http://localhost:3000",
  "http://localhost:5173",
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

// Import handlers
const chatHandler = require("./api/chat");
const imageHandler = require("./api/generate-image");

// Routes
app.post("/api/chat", chatHandler);
app.post("/api/generate-image", imageHandler);

app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    time: new Date().toISOString(),
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to APIXRP API",
    endpoints: {
      chat: "/api/chat",
      generateImage: "/api/generate-image",
      test: "/api/test",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed",
    });
  } else {
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
