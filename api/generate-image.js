const { OpenAI } = require("openai");

// Thêm cấu hình Edge Runtime
exports.runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req, res) {
  // CORS headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    // Tạo AbortController cho timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 seconds timeout

    try {
      const response = await openai.images.generate(
        {
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      return res.status(200).json({
        type: "image",
        message: prompt,
        imageUrl: response.data[0].url,
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        return res.status(408).json({
          error: "Image generation took too long. Please try again.",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("OpenAI API error:", error);

    const errorMessage =
      error.name === "AbortError"
        ? "Request timed out. Please try again."
        : "Failed to generate image";

    return res.status(error.name === "AbortError" ? 408 : 500).json({
      error: errorMessage,
    });
  }
}

module.exports = handler;
