const router = require('express').Router();
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/ai/palette  — generate palette from text prompt
router.post('/palette', protect, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'prompt is required' });

    // Check AI usage limit
    const user = await User.findById(req.user.id);
    if (!user.canUseAI()) {
      return res.status(403).json({ message: 'AI generation limit reached. Upgrade to Pro for 100/month.' });
    }

    const systemPrompt = `You are a professional color palette designer.
When given a theme, mood, or description, respond with ONLY a valid JSON object like this:
{
  "name": "Palette Name",
  "description": "Short description of the palette mood",
  "colors": [
    { "hex": "#1A1A2E", "name": "Deep Navy", "role": "Background" },
    { "hex": "#16213E", "name": "Dark Blue", "role": "Surface" },
    { "hex": "#0F3460", "name": "Royal Blue", "role": "Primary" },
    { "hex": "#E94560", "name": "Crimson", "role": "Accent" },
    { "hex": "#F5F5F5", "name": "Snow White", "role": "Text" }
  ],
  "tags": ["dark", "moody", "elegant"]
}
Rules:
- Always return exactly 5 colors
- Hex codes must be valid 6-digit hex (e.g. #1A2B3C)
- Colors should work harmoniously together
- Roles should be one of: Background, Surface, Primary, Secondary, Accent, Text
- Respond ONLY with the JSON, no extra text`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a color palette for: ${prompt}` },
      ],
      temperature: 0.85,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content?.trim();

    // Extract JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ message: 'AI returned invalid response' });

    const palette = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!palette.colors || palette.colors.length < 3) {
      return res.status(500).json({ message: 'AI returned incomplete palette' });
    }

    // Increment usage
    user.aiGenerations = (user.aiGenerations || 0) + 1;
    await user.save();

    res.json({ palette, usage: { used: user.aiGenerations, limit: user.canUseAI() ? 'ok' : 'limit' } });

  } catch (err) {
    console.error('AI palette error:', err.message);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned invalid JSON' });
    }
    res.status(500).json({ message: 'AI service error', detail: err.message });
  }
});

// POST /api/ai/chat  — general color advice chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'messages required' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are CheckColors AI, an expert color consultant.
You help designers choose colors, understand color theory, and create beautiful palettes.
Keep answers concise and practical. When mentioning specific colors, always include their hex codes.
If asked to generate a palette, suggest 4-6 colors with their hex codes and names.`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content;
    res.json({ reply });

  } catch (err) {
    res.status(500).json({ message: 'AI service error', detail: err.message });
  }
});

module.exports = router;
