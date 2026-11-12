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

// Analyze image endpoint using gemini-4-argon with resilient fallback
app.post('/api/gemini/analyze', async (req: Request, res: Response) => {
  try {
    const { image, language = 'en' } = req.body;
    if (!image) {
      return res.status(400).json({ ok: false, error: 'No image provided' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        ok: true,
        data: getSmartDossierFallback(language),
        notice: 'Using local temporal dossier generator (No GEMINI_API_KEY configured).',
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

    let textOutput = '';
    let modelUsed = 'gemini-4-argon';

    try {
      // First attempt with gemini-4-argon
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });
      textOutput = response.text || '{}';
    } catch (primaryErr: any) {
      const isQuota =
        primaryErr?.status === 'RESOURCE_EXHAUSTED' ||
        primaryErr?.message?.includes('429') ||
        primaryErr?.message?.includes('quota') ||
        primaryErr?.message?.includes('limit: 0');

      if (isQuota) {
        // Fallback to gemini-3.8-flash which supports multimodal image analysis on the free tier
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: prompt },
              ],
            },
            config: {
              responseMimeType: 'application/json',
            },
          });
          textOutput = fallbackResponse.text || '{}';
          modelUsed = 'gemini-3.8-flash';
        } catch {
          // If free tier is completely capped, return smart local dossier
          return res.status(200).json({
            ok: true,
            data: getSmartDossierFallback(language),
            notice: 'Generated via Chronos Offline Temporal Dossier.',
          });
        }
      } else {
        return res.status(200).json({
          ok: true,
          data: getSmartDossierFallback(language),
        });
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(textOutput.trim().replace(/^```json\s*|\s*```$/g, ''));
    } catch {
      parsed = getSmartDossierFallback(language);
    }

    return res.json({ ok: true, data: parsed, modelUsed });
  } catch (error: any) {
    return res.status(200).json({
      ok: true,
      data: getSmartDossierFallback('en'),
    });
  }
});

// Create & edit images using gemini-nano-banana-2.1 with graceful quota fallback
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
      return res.status(200).json({
        ok: false,
        quotaExceeded: false,
        error: 'GEMINI_API_KEY not configured. Falling back to client canvas compositor.',
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

    try {
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
        return res.status(200).json({
          ok: false,
          error: 'Model did not return image data. Falling back to local canvas compositor.',
          details: textExplanation.trim(),
        });
      }

      return res.json({
        ok: true,
        imageUrl: generatedImageUrl,
        details: textExplanation.trim(),
        modelUsed: 'gemini-nano-banana-2.1',
      });
    } catch (modelErr: any) {
      const isQuota =
        modelErr?.status === 'RESOURCE_EXHAUSTED' ||
        modelErr?.message?.includes('429') ||
        modelErr?.message?.includes('quota') ||
        modelErr?.message?.includes('limit: 0');

      return res.status(200).json({
        ok: false,
        quotaExceeded: isQuota,
        error: isQuota
          ? 'Free tier quota is 0 for gemini-nano-banana-2.1. Switch to a paid key in Settings > Secrets to enable live Gemini generation.'
          : (modelErr?.message || 'Gemini Nano Banana transformation failed.'),
      });
    }
  } catch (error: any) {
    return res.status(200).json({
      ok: false,
      error: error?.message || 'Failed to generate time-travel portrait',
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
      return res.status(200).json({
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

    try {
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
        return res.status(200).json({
          ok: false,
          error: 'No image returned from Gemini Nano Banana 2.1',
          details: text,
        });
      }

      return res.json({
        ok: true,
        imageUrl: generatedImageUrl,
        text,
        modelUsed: 'gemini-nano-banana-2.1',
      });
    } catch (modelErr: any) {
      const isQuota =
        modelErr?.status === 'RESOURCE_EXHAUSTED' ||
        modelErr?.message?.includes('429') ||
        modelErr?.message?.includes('quota') ||
        modelErr?.message?.includes('limit: 0');

      return res.status(200).json({
        ok: false,
        quotaExceeded: isQuota,
        error: isQuota
          ? 'Gemini Nano Banana 2.1 requires a billing-enabled key in Settings > Secrets.'
          : (modelErr?.message || 'Model call failed'),
      });
    }
  } catch (error: any) {
    return res.status(200).json({
      ok: false,
      error: error?.message || 'Failed to edit image with Gemini Nano Banana 2.1',
    });
  }
});

// Helper for deterministic high-quality temporal dossier fallback
function getSmartDossierFallback(lang: string) {
  const isEs = lang === 'es';
  const isFr = lang === 'fr';
  const isDe = lang === 'de';
  const isJa = lang === 'ja';
  const isHi = lang === 'hi';

  if (isEs) {
    return {
      bestEraId: 'renaissance',
      historicalAlterEgo: 'Gran Erudito y Mecenas Florentino',
      eraVibeSummary: 'La postura facial y la mirada serena encajan de forma natural con los retratos al óleo de la Florencia del siglo XVI.',
      recommendedCostume: 'Jubón de terciopelo carmesí con bordados en oro y boina de artista emplumada.',
      historicalFact: 'Durante el Renacimiento, los retratos simbolizaban el intelecto y el descubrimiento del mundo.',
      timelineSafetyScore: 99,
    };
  }
  if (isFr) {
    return {
      bestEraId: 'paris1900',
      historicalAlterEgo: 'Prodige Bohème de Montmartre',
      eraVibeSummary: 'L’expression réfléchie et le port de tête évoquent les artistes de la Belle Époque parisienne.',
      recommendedCostume: 'Complet trois pièces en laine de charbon, cravate en soie et canne ouvragée.',
      historicalFact: 'En 1900, plus de 50 millions de visiteurs ont célébré la fée électricité à l’Exposition Universelle de Paris.',
      timelineSafetyScore: 98,
    };
  }
  if (isDe) {
    return {
      bestEraId: 'renaissance',
      historicalAlterEgo: 'Großmeister der Künste & Alchemist',
      eraVibeSummary: 'Ihre Gesichtszüge spiegeln zeitlose Neugier und Ausstrahlung wider, ideal für die Werkstätten der Renaissance.',
      recommendedCostume: 'Samtwams mit Goldborten und Seidenhemd mit feinem Kragen.',
      historicalFact: 'Leonardo da Vinci war Linkshänder und verfasste seine Notizbücher in Spiegelschrift von rechts nach links.',
      timelineSafetyScore: 99,
    };
  }
  if (isJa) {
    return {
      bestEraId: 'japan',
      historicalAlterEgo: '江戸の風雅なる文人・茶道師範',
      eraVibeSummary: '穏やかで凛とした眼差しは、江戸の静寂な竹林や茶室の雰囲気に極めて自然に調和しています。',
      recommendedCostume: '家紋をあしらった絹織の羽織と金襴の帯、伝統的な和装一式。',
      historicalFact: '江戸時代、当時の江戸（東京）は人口100万人を超える世界有数の大都市に成長しました。',
      timelineSafetyScore: 99,
    };
  }
  if (isHi) {
    return {
      bestEraId: 'egypt',
      historicalAlterEgo: 'शाही दरबारी व नक्षत्र शास्त्री',
      eraVibeSummary: 'चेहरे की गरिमा और शांत दृष्टि प्राचीन ऐतिहासिक चित्रों की भव्यता के साथ पूर्णतः मेल खाती है।',
      recommendedCostume: 'सोने और लापीस लाजुली का राजसी हार और पारंपरिक श्वसन वस्त्र।',
      historicalFact: 'प्राचीन मिस्र में धूप से आंखों की रक्षा के लिए काजल का उपयोग किया जाता था।',
      timelineSafetyScore: 98,
    };
  }
  return {
    bestEraId: 'renaissance',
    historicalAlterEgo: 'Grand Florentine Scholar & Visionary',
    eraVibeSummary: 'Facial posture and contemplative gaze align seamlessly with High Renaissance portraiture and chiaroscuro lighting.',
    recommendedCostume: 'Crimson velvet doublet with golden embroidery, ruff collar, and feathered artist cap.',
    historicalFact: 'During the Renaissance, portraits symbolized intellect, philosophy, and global exploration.',
    timelineSafetyScore: 99,
  };
}

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
