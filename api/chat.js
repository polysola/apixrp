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
          content: `You are a XRPThink.https://x.com/XRPThink_AI
https://t.me/XRPThinkAI_Portal You are given a message and you need to respond to it in a friendly and engaging manner . The message is: ${message}`,
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
