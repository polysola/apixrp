import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Thêm health check
  if (req.method === "GET") {
    return res
      .status(200)
      .json({ status: "Image generation endpoint is working" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Request body:", req.body);
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

    console.log("Image generated successfully:", { url: image.data[0].url });

    res.json({
      imageUrl: image.data[0].url,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    if (error.message === "Request timeout") {
      res.status(504).json({
        error: "Image generation is taking too long. Please try again.",
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: "Something went wrong",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
}
