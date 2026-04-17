require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ANALYZE_GOAL_PROMPT = `You are a goal analysis engine. Given a user's goal, provide:
1. A concise 2-3 sentence summary of the goal
2. One powerful encouraging sentence to motivate the user
3. Exactly 3 realistic pathways to achieve it

Each pathway should represent a different approach to the same goal. Return ONLY valid JSON with no other text.

Schema:
{
  "summary": "string (2-3 sentences explaining the goal clearly)",
  "encouragement": "string (one powerful motivational sentence)",
  "pathways": [
    {
      "title": "string (e.g., 'Independent Artist')",
      "description": "string (one sentence, compelling)",
      "emoji": "string (single emoji)"
    }
  ]
}

Goal: {goal}`;

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

const ROADMAP_DAY_PROMPT = `You are a roadmap generator. Given a user's goal and context, generate a detailed 1-day roadmap split into 3 periods.

Each period (Morning, Afternoon, Evening) should have:
- A clear theme
- 2-3 concrete, output-oriented tasks
- Task durations (e.g., "30 min", "1 hour")
- Task type ("explore", "create", "build", "learn", "setup")

Focus on ACTION. Tasks should produce tangible output.

Return ONLY valid JSON with no other text.

Schema:
{
  "roadmap": [
    {
      "period": 1,
      "label": "Morning|Afternoon|Evening",
      "theme": "string (e.g., 'Foundation & Setup')",
      "tasks": [
        {
          "task": "string (specific action)",
          "duration": "string (e.g., '30 min')",
          "type": "string (explore|create|build|learn|setup)"
        }
      ]
    }
  ]
}

Goal: {goal}
{braindumpSection}`;

const ROADMAP_WEEK_PROMPT = `You are a roadmap generator. Given a user's goal and context, generate a detailed 7-day roadmap.

Each day should have:
- A clear theme
- 2-3 concrete, output-oriented tasks
- Task durations (e.g., "45 min", "1-2 hours")
- Task type ("explore", "create", "build", "learn", "setup")

Focus on ACTION not LEARNING. Tasks should produce tangible output.

Return ONLY valid JSON with no other text.

Schema:
{
  "roadmap": [
    {
      "period": 1,
      "label": "Day 1",
      "theme": "string (e.g., 'Foundation & Setup')",
      "tasks": [
        {
          "task": "string (specific action)",
          "duration": "string (e.g., '45 min')",
          "type": "string (explore|create|build|learn|setup)"
        }
      ]
    }
  ]
}

Goal: {goal}
{braindumpSection}`;

const ROADMAP_MONTH_PROMPT = `You are a roadmap generator. Given a user's goal and context, generate a detailed 4-week roadmap.

Each week should have:
- A clear theme
- 4-6 concrete, output-oriented tasks (scope: multi-day tasks)
- Task durations (e.g., "1-3 days", "3-5 days")
- Task type ("explore", "create", "build", "learn", "setup")

Focus on substantial progress. Tasks should produce significant output.

Return ONLY valid JSON with no other text.

Schema:
{
  "roadmap": [
    {
      "period": 1,
      "label": "Week 1",
      "theme": "string (e.g., 'Foundation & Setup')",
      "tasks": [
        {
          "task": "string (specific action)",
          "duration": "string (e.g., '1-3 days')",
          "type": "string (explore|create|build|learn|setup)"
        }
      ]
    }
  ]
}

Goal: {goal}
{braindumpSection}`;

const ROADMAP_YEAR_PROMPT = `You are a roadmap generator. Given a user's goal and context, generate a detailed 12-month roadmap.

Each month should have:
- A clear theme
- 3-5 concrete, output-oriented milestones (scope: weeks of work)
- Task durations (e.g., "2 weeks", "1 month")
- Task type ("explore", "create", "build", "learn", "setup")

Focus on meaningful milestones that compound toward the goal.

Return ONLY valid JSON with no other text.

Schema:
{
  "roadmap": [
    {
      "period": 1,
      "label": "Month 1",
      "theme": "string (e.g., 'Foundation & Setup')",
      "tasks": [
        {
          "task": "string (specific milestone)",
          "duration": "string (e.g., '2 weeks')",
          "type": "string (explore|create|build|learn|setup)"
        }
      ]
    }
  ]
}

Goal: {goal}
{braindumpSection}`;

app.post('/api/analyze-goal', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || goal.trim().length === 0) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    const prompt = ANALYZE_GOAL_PROMPT.replace('{goal}', goal);

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
    console.error('Goal analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze goal' });
  }
});

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
    const { goal, braindump = '', duration = 'week' } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    const braindumpSection = braindump ? `Context:\n${braindump}` : '';

    const promptMap = {
      day: ROADMAP_DAY_PROMPT,
      week: ROADMAP_WEEK_PROMPT,
      month: ROADMAP_MONTH_PROMPT,
      year: ROADMAP_YEAR_PROMPT,
    };

    const maxTokensMap = {
      day: 1024,
      week: 2048,
      month: 3000,
      year: 3000,
    };

    const promptTemplate = promptMap[duration] || ROADMAP_WEEK_PROMPT;
    const maxTokens = maxTokensMap[duration] || 2048;

    const prompt = promptTemplate
      .replace('{goal}', goal)
      .replace('{braindumpSection}', braindumpSection);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
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
