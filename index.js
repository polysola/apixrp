require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
