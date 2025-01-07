const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  maxDuration: 60,
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 50000)
    );

    const image = await Promise.race([
      openai.images.generate({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
      timeoutPromise,
    ]);

    res.json({
      imageUrl: image.data[0].url,
    });
  } catch (error) {
    console.error("Error:", error);
    if (error.message === "Request timeout") {
      res.status(504).json({
        error: "Image generation is taking too long. Please try again.",
      });
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
};
