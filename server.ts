import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();

// Increase JSON payload limit to handle base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to initialize GoogleGenAI with required User-Agent
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hasApiKey: hasKey,
    models: {
      imageGeneration: 'gemini-nano-banana-2.1',
      imageAnalysis: 'gemini-4-argon',
      textTasks: 'gemini-3.8-flash',
    },
    version: '1.0.0',
    app: 'Chronos: Time-Travel Photo Booth',
  });
});

// Analyze image endpoint using gemini-4-argon
app.post('/api/gemini/analyze', async (req: Request, res: Response) => {
  try {
    const { image, language = 'en' } = req.body;
    if (!image) {
      return res.status(400).json({ ok: false, error: 'No image provided' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        ok: false,
        error: 'GEMINI_API_KEY is not configured on the server. Falling back to local offline analysis.',
      });
    }

    // Extract mime type and base64 string
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const base64Data = match ? match[2] : image.replace(/^data:image\/[a-z]+;base64,/, '');

    const ai = getGenAIClient();

    const prompt = `You are the master chronologist of the Time-Travel Photo Booth. Analyze this portrait photo for historical time-travel suitability.
Respond in ${language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : language === 'ja' ? 'Japanese' : language === 'hi' ? 'Hindi' : 'English'}.
Provide an entertaining, immersive "Temporal Travel Dossier" formatted as JSON with the following exact keys:
{
  "bestEraId": "one of: 'egypt', 'renaissance', 'japan', '1920s', 'wildwest', 'space', 'victorian', 'medieval'",
  "historicalAlterEgo": "A grand historical title (e.g., 'Chief Scribe of Karnak', 'Venetian Alchemist & Scholar', 'Edo Master Calligrapher', 'Harlem Jazz Prodigy', 'Frontier Pathfinder')",
  "eraVibeSummary": "2-3 sentences explaining why their facial expression, gaze, or hair naturally fits this era",
  "recommendedCostume": "Detailed description of garments, jewelry, headgear, or props",
  "historicalFact": "An interesting historical tidbit from that era",
  "timelineSafetyScore": 98
}
Return ONLY valid raw JSON without markdown code fences or backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(textOutput.trim().replace(/^```json\s*|\s*```$/g, ''));
    } catch {
      parsed = {
        bestEraId: 'renaissance',
        historicalAlterEgo: 'Grand Scholar & Visionary',
        eraVibeSummary: 'The portrait exudes timeless poise and curiosity, fitting a patron of the arts.',
        recommendedCostume: 'Velvet doublet with gold embroidered cuffs and feathered beret.',
        historicalFact: 'During the Renaissance, portraits symbolized intellect and worldly discovery.',
        timelineSafetyScore: 99,
      };
    }

    return res.json({ ok: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze:', error);
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Failed to analyze portrait with Gemini 4 Argon',
    });
  }
});

// Create & edit images using gemini-nano-banana-2.1
app.post('/api/gemini/transform', async (req: Request, res: Response) => {
  try {
    const {
      image,
      eraTitle,
      eraPrompt,
      customPrompt,
      aspectRatio = '1:1',
      resolution = '1K',
    } = req.body;

    if (!image && !customPrompt) {
      return res.status(400).json({ ok: false, error: 'Provide either an input photo or a prompt' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        ok: false,
        error: 'GEMINI_API_KEY is not configured on the server. Falling back to high-fidelity client canvas compositor.',
      });
    }

    const ai = getGenAIClient();

    const parts: any[] = [];

    if (image) {
      const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      const mimeType = match ? match[1] : 'image/jpeg';
      const base64Data = match ? match[2] : image.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    }

    const fullPrompt = [
      'Create an authentic historical portrait photo booth photograph.',
      `Target historical scene: ${eraTitle || 'Historical Era'}.`,
      eraPrompt ? `Era specifics: ${eraPrompt}.` : '',
      customPrompt ? `User customization: ${customPrompt}.` : '',
      'Seamlessly keep the face, facial features, and expression of the person in the input photo, blending their face naturally onto the historical figure in authentic period attire, period lighting, artistic textures, and period-accurate scenery.',
      'High photographic quality, photorealistic period atmosphere, cinematic lighting, sharp detail.',
    ]
      .filter(Boolean)
      .join(' ');

    parts.push({ text: fullPrompt });

    // Validate aspect ratio
    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
    const chosenAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';
    const chosenResolution = ['1K', '2K', '4K'].includes(resolution) ? resolution : '1K';

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: chosenAspectRatio as any,
          imageSize: chosenResolution as any,
        },
      },
    });

    let generatedImageUrl = '';
    let textExplanation = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textExplanation += part.text + ' ';
      }
    }

    if (!generatedImageUrl) {
      return res.status(502).json({
        ok: false,
        error: 'Gemini model did not return image data. Check prompt or quota.',
        details: textExplanation.trim(),
      });
    }

    return res.json({
      ok: true,
      imageUrl: generatedImageUrl,
      details: textExplanation.trim(),
      modelUsed: 'gemini-nano-banana-2.1',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/transform:', error);
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Failed to generate time-travel portrait with Gemini Nano Banana 2.1',
    });
  }
});

// Custom prompt image generation & editing using gemini-nano-banana-2.1
app.post('/api/gemini/prompt-edit', async (req: Request, res: Response) => {
  try {
    const { prompt, sourceImage, aspectRatio = '1:1', resolution = '1K' } = req.body;
    if (!prompt) {
      return res.status(400).json({ ok: false, error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        ok: false,
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const ai = getGenAIClient();
    const parts: any[] = [];

    if (sourceImage) {
      const match = sourceImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      const mimeType = match ? match[1] : 'image/jpeg';
      const base64Data = match ? match[2] : sourceImage.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: resolution as any,
        },
      },
    });

    let generatedImageUrl = '';
    let text = '';
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        text += part.text;
      }
    }

    if (!generatedImageUrl) {
      return res.status(502).json({
        ok: false,
        error: 'No image generated',
        details: text,
      });
    }

    return res.json({
      ok: true,
      imageUrl: generatedImageUrl,
      text,
      modelUsed: 'gemini-nano-banana-2.1',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/prompt-edit:', error);
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Failed to edit image with Gemini Nano Banana 2.1',
    });
  }
});

// Vite middleware in dev / Static files in production
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Chronos Server] Time-Travel Photo Booth running on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
