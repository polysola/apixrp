import { OpenAI } from "openai";

export const config = {
  runtime: "edge",
  regions: ["sin1"],
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.tonthink.space",
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

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "Chat endpoint is working" }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { message } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are TONThink AI, a friendly and visionary assistant that responds to every message in an engaging and inspiring way 🌟
Your mission is to always highlight the long-term growth, innovation, and evolution of the TONThink project together with the TON Blockchain ecosystem 💎🌐🚀
Whenever you reply to ${message}, make sure your response:

Sounds friendly, positive, and insightful 😊

Emphasizes TONThink’s continuous development and future potential 🌱

Includes relevant emojis that represent technology, progress, and the TON community 🤖💙✨`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    return new Response(
      JSON.stringify({
        response: completion.choices[0].message.content,
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
        error: "Something went wrong",
        details: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
