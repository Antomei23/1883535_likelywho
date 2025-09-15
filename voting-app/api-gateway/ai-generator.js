// api-gateway/ai-generator.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// initialize the client with your API key from env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function normalize(q) {
  let s = String(q || "").trim();
  s = s.replace(/^\s*[\d\-\*\)\.]+\s*/,'').trim();
  if (!/^who is the most likely to/i.test(s)) s = `Who is the most likely to ${s.replace(/^to\s+/i,'')}`;
  if (!/[?]$/.test(s)) s = s.replace(/[.!\s]*$/,'') + "?";
  return s[0].toUpperCase() + s.slice(1);
}

async function generateQuestions(topic = "anything", n = 5) {
  const count = Math.max(1, Math.min(20, Number(n)));
  const prompt = `
Generate ${count} distinct "most likely to" questions.
Rules:
- Start with "Who is the most likely to "
- 8–14 words; fun & safe
- If topic is a noun, turn it into a natural verb phrase
Topic: ${topic}
Return a plain list, one per line.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const items = text.split("\n").map(normalize).filter(Boolean);
    return Array.from(new Set(items)).slice(0, count);
  } catch (err) {
    const msg = err?.response?.error?.message || err?.message || "Gemini call failed";
    console.error("Gemini error:", msg);
    throw new Error(msg);
  }
}

module.exports = {
  generateQuestion: async (topic) => (await generateQuestions(topic, 1))[0],
  generateQuestions,
};

