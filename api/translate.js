export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { text, targetLang } = req.body;
  const API_KEY = process.env.API_KEY; 
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a professional translator for a global forum. Only output the translated text, nothing else. Do not wrap in quotes." },
          { role: "user", content: `Translate the following text into language code '${targetLang}':\n\n${text}` }
        ],
        temperature: 0.1
      })
    });
    const data = await response.json();
    res.status(200).json({ translatedText: data.choices[0].message.content.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Translation API failed' });
  }
}