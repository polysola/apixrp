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

    // Giảm timeout xuống 25 giây để tránh Vercel timeout (30s)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 25000)
    );

    const imagePromise = openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    // Race between the image generation and timeout
    const image = await Promise.race([imagePromise, timeoutPromise]);

    return res.status(200).json({
      success: true,
      imageUrl: image.data[0].url,
    });
  } catch (error) {
    console.error("Error:", error);

    if (error.message === "Request timeout") {
      return res.status(408).json({
        success: false,
        error:
          "Image generation is taking too long. Please try with a simpler prompt.",
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
