/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI client successfully initialized server-side.");
  } else {
    console.warn("GEMINI_API_KEY is not defined or is a placeholder. Falling back to local heuristics.");
  }
} catch (err) {
  console.error("Error initializing GoogleGenAI client:", err);
}

// Fallback Portuguese reframes in case Gemini is not configured or fails
const localWisdomResponses = [
  "Dê a si mesmo a permissão de pausar. O que quer que esteja afligindo você agora, pode esperar por alguns minutos de respiração calma.",
  "As preocupações são como nuvens passando pelo céu da sua consciência. Deixe-as passar, sem se agarrar a elas. Você é o céu calmo e imutável.",
  "Cada etapa do processo é um aprendizado. Você é resiliente e tem capacidade total de solucionar as demandas que surgirem, no tempo certo.",
  "Permita-se soltar o controle do amanhã. O único momento real que existe para agir e sentir paz é o momento presente."
];

const generateFallbackReframe = (text: string): string => {
  const lowText = text.toLowerCase();
  if (lowText.includes('trabalho') || lowText.includes('prazo') || lowText.includes('projeto') || lowText.includes('entregar')) {
    return "Um passo de cada vez. Divida seu projeto em pequenas tarefas e dê o seu melhor, entendendo que o descanso também faz parte da produtividade.";
  }
  if (lowText.includes('dinheiro') || lowText.includes('pagar') || lowText.includes('conta') || lowText.includes('finanças')) {
    return "Planeje o que é visível hoje e lide com cada decisão financeira de cabeça fria. A ansiedade não resolve as contas, mas a quietude mental traz clareza.";
  }
  if (lowText.includes('saúde') || lowText.includes('corpo') || lowText.includes('doença') || lowText.includes('dor')) {
    return "Trate seu corpo com compaixão e paciência hoje. Permita-se fazer descansos leves e focar no que você pode nutrir e proteger neste momento.";
  }
  if (lowText.includes('discussão') || lowText.includes('brigou') || lowText.includes('alguém') || lowText.includes('amigo') || lowText.includes('família')) {
    return "As relações humanas têm altos e baixos. Respire fundo, cultive empatia e separe seu valor interno do calor de um momento conflituoso.";
  }
  return "Reconheça essa preocupação, mas lembre-se de que ela não define você. Ao soltar o peso no triturador, você cria espaço para a clareza se estabelecer.";
};

// --- API routes ---

app.post("/api/reframe", async (req, res) => {
  try {
    const { worries } = req.body;

    if (!Array.isArray(worries) || worries.length === 0) {
      return res.status(400).json({
        success: false,
        error: "É necessário enviar uma lista de preocupações ('worries') válidas."
      });
    }

    // Process each worry text
    const processedWorries = worries.map(w => (typeof w === 'string' ? w : String(w)).trim()).filter(Boolean);

    if (processedWorries.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma preocupação textual válida foi fornecida."
      });
    }

    // Option A: Call Google Gemini if available
    if (ai) {
      try {
        const promptText = `Aqui estão as preocupações que o usuário acaba de destruir visualmente no aplicativo:
${processedWorries.map((w, idx) => `${idx + 1}. "${w}"`).join('\n')}

Por favor, analise essas preocupações e aja como um sábio terapeuta de mindfulness. Devolva um objeto JSON contendo:
1. Um array 'reframes' contendo objetos com propriedades 'original' (o texto original da preocupação) e 'mantra' (uma pílula de sabedoria calorosa e realista em português, de no máximo 2 frases curtas, que reformula positivamente ou traz aceitação para esse estresse).
2. Um campo 'wisdomText' com uma breve mensagem geral de encorajamento ou mindfulness em português, de no máximo 2 parágrafos amigáveis.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptText,
          config: {
            systemInstruction: "Você é o Triturador de Carga Mental, um conselheiro sábio de mindfulness em português que ajuda a desconstruir, acalmar e ressignificar preocupações diárias de forma compassiva e realista.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reframes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      mantra: { type: Type.STRING, description: "Uma pílula de sabedoria ou mantra consolador, realista e gentil." },
                    },
                    required: ["original", "mantra"],
                  },
                },
                wisdomText: { type: Type.STRING, description: "Mensagem unificada de encorajamento e meditação de até 2 parágrafos." },
              },
              required: ["reframes", "wisdomText"],
            }
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsedData = JSON.parse(textOutput.trim());
          return res.json({
            success: true,
            reframes: parsedData.reframes,
            wisdomText: parsedData.wisdomText
          });
        }
      } catch (geminiError) {
        console.error("Gemini Generation failed, falling back to local heuristics:", geminiError);
      }
    }

    // Option B: Fallback to local heuristic reframe values safely
    const reframes = processedWorries.map((w) => ({
      original: w,
      mantra: generateFallbackReframe(w)
    }));

    const randomWisdom = localWisdomResponses[Math.floor(Math.random() * localWisdomResponses.length)];
    const wisdomText = `Você triturou com sucesso suas cargas mentais! Siga o ritmo da respiração para encontrar seu centro energético. ${randomWisdom}`;

    return res.json({
      success: true,
      reframes,
      wisdomText
    });

  } catch (error: any) {
    console.error("Critical server error in /api/reframe:", error);
    return res.status(500).json({
      success: false,
      error: "Ocorreu um erro ao processar as preocupações mentais."
    });
  }
});

// Serve frontend assets
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Triturador de Carga Mental running at http://localhost:${PORT}`);
  });
}

setupServer();
