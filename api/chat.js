import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // Log method và path
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Thêm health check với GET method
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Chat endpoint is working' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body); // Log request body
    const { message } = req.body;
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-3.5-turbo",
    });

    console.log('OpenAI response:', completion.choices[0]); // Log OpenAI response
    
    res.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Detailed error:', error); // Log detailed error
    res.status(500).json({ 
      error: 'Something went wrong',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}