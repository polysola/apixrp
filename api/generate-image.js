const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Set shorter timeout for Vercel Hobby plan (max 10s)
  const TIMEOUT_DURATION = 9000; // 9 seconds

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      const image = await openai.images.generate(
        {
          model: "dall-e-2", // Using DALL-E 2 for faster generation
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "url",
        },
        {
          signal: controller.signal,
          timeout: TIMEOUT_DURATION,
        }
      );

      clearTimeout(timeoutId);

      return res.status(200).json({
        success: true,
        imageUrl: image.data[0].url,
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        return res.status(504).json({
          success: false,
          error: "Request timeout",
          message: "Please try again or use a simpler prompt",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error details:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate image",
      message: error.message,
    });
  }
}

module.exports = handler;
