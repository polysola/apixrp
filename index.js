require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "https://www.xrpthink.org",
  "https://www.tonthink.space",
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

// Test route only
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    time: new Date().toISOString(),
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
});

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Welcome to AI API",
    endpoints: {
      chat: "/api/chat",
      generateImage: "/api/generate-image",
      test: "/api/test",
    },
  });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
