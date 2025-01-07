const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    (() => {
      console.error("OPENAI_API_KEY is missing");
      throw new Error("OPENAI_API_KEY is not configured");
    })(),
});

async function handler(req, res) {
  // Log để debug
  console.log("Request received:", {
    method: req.method,
    body: req.body,
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

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
      console.log("Image generated successfully:", image.data[0].url);

      return res.status(200).json({
        success: true,
        imageUrl: image.data[0].url,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("OpenAI API Error:", error);

      if (error.name === "AbortError") {
        return res.status(408).json({
          success: false,
          error: "Request timeout",
          message:
            "Image generation took too long. Please try with a simpler prompt.",
        });
      }

      return res.status(500).json({
        success: false,
        error: "OpenAI API Error",
        message: error.message,
        code: error.code,
      });
    }
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error",
      message: error.message,
    });
  }
}

module.exports = handler;
