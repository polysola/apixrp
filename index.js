const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import handlers
const chatHandler = require("./api/chat");
const imageHandler = require("./api/generate-image");

// Routes
app.post("/api/chat", (req, res) => chatHandler(req, res));
app.post("/api/generate-image", (req, res) => imageHandler(req, res));

// Test endpoint
app.get("/api/test", (req, res) => {
  console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
  console.log("Environment:", process.env.NODE_ENV);
  res.json({
    message: "API is working",
    time: new Date().toISOString(),
    hasApiKey: !!process.env.OPENAI_API_KEY,
    env: process.env.NODE_ENV,
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

// Only run server if not in Vercel environment
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
