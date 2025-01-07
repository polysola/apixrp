const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cấu hình cho Vercel về thời gian tối đa cho serverless function
export const config = {
  maxDuration: 60, // Cho phép function chạy tối đa 60 giây
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Thiết lập timeout ngắn hơn maxDuration một chút để đảm bảo có thể trả về response
  const timeoutDuration = 55000; // 55 giây
  let timeoutId;

  try {
    const { prompt } = req.body;

    const imagePromise = openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    // Tạo promise với timeout
    const result = await Promise.race([
      imagePromise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Vercel timeout"));
        }, timeoutDuration);
      }),
    ]);

    // Xóa timeout nếu thành công
    clearTimeout(timeoutId);

    res.json({
      imageUrl: result.data[0].url,
    });
  } catch (error) {
    // Xóa timeout nếu có lỗi
    if (timeoutId) clearTimeout(timeoutId);

    console.error("Error:", error);
    if (error.message === "Vercel timeout") {
      res.status(504).json({
        error:
          "Image generation is taking too long. Please try with a simpler prompt.",
      });
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
};
