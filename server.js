require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const PATHWAY_PROMPT = `You are a pathway generation engine. Given a user's goal, generate exactly 3 realistic pathways to achieve it.

Each pathway should represent a different approach to the same goal. Return ONLY valid JSON with no other text.

Schema:
{
  "pathways": [
    {
      "title": "string (e.g., 'Independent Artist')",
      "description": "string (one sentence, compelling)",
      "emoji": "string (single emoji)"
    }
  ]
}

Goal: {goal}`;

const ROADMAP_PROMPT = `You are a roadmap generator. Given a user's goal and their chosen pathway, generate a detailed 7-day roadmap.

Each day should have:
- A clear theme
- 2-3 concrete, output-oriented tasks (not consumption-based)
- Task durations (e.g., "30 min", "1 hour")
- Task type ("explore", "create", "build", "learn", "setup")

Focus on ACTION not LEARNING. Tasks should produce tangible output (record, write, code, build, prototype).

Return ONLY valid JSON with no other text.

Schema:
{
  "roadmap": [
    {
      "day": 1,
      "theme": "string (e.g., 'Foundation & Setup')",
      "tasks": [
        {
          "task": "string (specific action, not vague)",
          "duration": "string (e.g., '45 min')",
          "type": "string (explore|create|build|learn|setup)"
        }
      ]
    }
  ]
}

Goal: {goal}
Pathway: {pathway}`;

app.post('/api/pathways', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || goal.trim().length === 0) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    const prompt = PATHWAY_PROMPT.replace('{goal}', goal);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (error) {
    console.error('Pathway generation error:', error);
    res.status(500).json({ error: 'Failed to generate pathways' });
  }
});

app.post('/api/roadmap', async (req, res) => {
  try {
    const { goal, pathway } = req.body;
    if (!goal || !pathway) {
      return res.status(400).json({ error: 'Goal and pathway are required' });
    }

    const prompt = ROADMAP_PROMPT
      .replace('{goal}', goal)
      .replace('{pathway}', pathway);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

// Support both local development and Vercel deployment
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
