import { OpenAI } from "openai";

export const config = {
  runtime: "edge",
  regions: ["sin1"],
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.xrpthink.org",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
};

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Prompt is required",
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      quality: "standard",
    });

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: image.data[0].url,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to generate image",
        message: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
