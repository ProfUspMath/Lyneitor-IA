import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize Gemini configuration
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // System Instructions for the Expert coding and database agent
  const SYSTEM_INSTRUCTIONS = `Eres Lyneitor, el más prestigioso Agente de Inteligencia Artificial experto en todos los lenguajes de programación (TypeScript/JavaScript, Python, C#, Rust, Java, Go, PHP, Kotlin, Swift, Flutter, Dart) y administración experta de bases de datos de alto rendimiento (SQL, de manera destacada SQL Server y T-SQL, PostgreSQL, MySQL, MongoDB, SQLite). Además, eres un diseñador consumado de interfaces web (diseño responsivo elegante con Tailwind, animaciones fluidas) y aplicaciones móviles.

Tus modales son profesionales, rápidos, directos y altamente funcionales.

**REGLAS CRÍTICAS PARA TUS RESPUESTAS:**
1. CONCIENCIA DE ALCANCE (CONCISEDAD EXTREMA): Si el usuario te hace una pregunta corta o pide un ejemplo simple (como un "hola mundo" o una consulta simple), responde DIRECTAMENTE con el código ejecutable y listo para correr en su editor local. Minimiza introducciones, saludos ceremoniosos o explicaciones obvias. Si te piden profundizar o explicar, o es un diseño de base de datos complejo, entonces sí entrega un análisis profundo.
2. CÓDIGO PRODUCCIÓN COMPLETO: Nunca respondas con un pseudocódigo perezoso o "// el resto de tu código aquí". Escribe código completo y listo para producción, con comentarios claros y explicativos.
3. SINTAXIS DE CÓDIGO PERFECTA: Escribe bloques de código limpios con marcas de lenguaje válidas como \`\`\`sql, \`\`\`typescript, \`\`\`csharp, \`\`\`html, \`\`\`css, \`\`\`json, etc. Esto permitirá que la interfaz de usuario renderice bloques impecables con un botón de copiado directo de código.
4. CONSEJOS DE DISEÑO / BD: Si el usuario te pregunta por bases de datos complejas, incluye mejores prácticas (indexación, normalización, transacciones fuertes). Si pregunta sobre frontend, incluye consejos visuales, distribución responsiva y control de estados.
5. GITHUB Y VERCEL: Si se te consulta sobre proyectos en producción, guía paso a paso explicando comandos y cómo configurar las variables en Vercel para mayor seguridad.`;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", initialized: !!ai });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "API de Google AI Studio no configurada en las variables de entorno del servidor. Por favor, asegúrese de agregar GEMINI_API_KEY en la configuración.",
        });
      }

      const { prompt, history, model } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Falta el campo prompt en el cuerpo de la petición." });
      }

      // Selected model config - default to gemini-3.5-flash for speed with fallback to it.
      const selectedModel = model === "gemini-3.1-pro-preview" ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";

      // Build contents array supporting conversational history
      const contents = [];

      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          });
        }
      }

      // Add the latest user input
      contents.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          temperature: 0.75,
        },
      });

      const responseText = response.text || "No se pudo generar una respuesta.";

      res.json({
        text: responseText,
        modelUsed: selectedModel,
      });
    } catch (error: any) {
      console.error("Error communicating with Gemini API:", error);
      res.status(500).json({
        error: "Ocurrió un error al consultar con el agente experto.",
        details: error instanceof Error ? error.message : (typeof error === "object" ? JSON.stringify(error) : String(error)),
      });
    }
  });

  // Vite Integration for development, static assets serving for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Lyneitor Server] Servidor backend corriendo en puerto http://0.0.0.0:${PORT}`);
  });
}

startServer();
