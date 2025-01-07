const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    // Set timeout to 50 seconds (Vercel max is 60s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    try {
      const image = await openai.images.generate(
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
        success: true,
        imageUrl: image.data[0].url,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Error:", error);

    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "Request timeout",
        message:
          "Image generation took too long. Please try with a simpler prompt.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to generate image",
      message: error.message,
    });
  }
}

module.exports = handler;
