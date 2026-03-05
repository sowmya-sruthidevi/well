const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

async function getBotResponse(topic, transcript, personality){

  const history = (transcript || [])
    .map(t => `${t.role === "user" ? "User" : t.name}: ${t.content}`)
    .join("\n");

  const prompt = `
Topic: ${topic}

Personality: ${personality}

Discussion so far:
${history}

Respond with a short argument.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content;
}

module.exports = { getBotResponse };