const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Tạo AbortController để xử lý timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 giây

    try {
      const image = await openai.images.generate(
        {
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        },
        {
          signal: controller.signal, // Thêm signal cho request
        }
      );

      // Clear timeout khi thành công
      clearTimeout(timeoutId);

      return res.status(200).json({
        success: true,
        imageUrl: image.data[0].url,
      });
    } catch (error) {
      // Clear timeout khi có lỗi
      clearTimeout(timeoutId);

      // Kiểm tra nếu là lỗi timeout
      if (error.name === "AbortError") {
        return res.status(408).json({
          success: false,
          error: "Request timeout",
          message:
            "Image generation took too long. Please try with a simpler prompt.",
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
