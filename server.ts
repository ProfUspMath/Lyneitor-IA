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

      // Build contents array supporting robust conversational history
      const rawContents: { role: "user" | "model"; text: string }[] = [];

      // 1. Filter chat errors and map to clean object array
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          if (!msg || typeof msg !== "object") continue;
          const text = String(msg.text || "").trim();
          const role = msg.role === "user" ? "user" : "model";
          
          if (!text || text.includes("⚠️ Error de Comunicación:") || text.includes("Ocurrió un error")) {
            continue;
          }
          rawContents.push({ role, text });
        }
      }

      // Limit history to the 8 most recent messages.
      // This is a crucial production optimization to prevent 504 Gateway/Server Timeouts on Vercel
      // and avoid rate limit (TPM) depletion due to huge payloads of previous code blocks.
      const maxHistoryMessages = 8;
      const historyToProcess = rawContents.slice(-maxHistoryMessages);

      // 2. Resolve consecutive duplicates of the same role (merge texts)
      const alternatedContents: { role: "user" | "model"; text: string }[] = [];
      for (const item of historyToProcess) {
        if (alternatedContents.length > 0 && alternatedContents[alternatedContents.length - 1].role === item.role) {
          alternatedContents[alternatedContents.length - 1].text += "\n\n" + item.text;
        } else {
          alternatedContents.push(item);
        }
      }

      // 3. Ensure conversation starts with 'user' (Gemini requirement)
      while (alternatedContents.length > 0 && alternatedContents[0].role === "model") {
        alternatedContents.shift();
      }

      // 4. Incorporate the current user prompt
      const cleanPrompt = String(prompt || "").trim();
      if (alternatedContents.length > 0 && alternatedContents[alternatedContents.length - 1].role === "user") {
        alternatedContents[alternatedContents.length - 1].text += "\n\n" + cleanPrompt;
      } else {
        alternatedContents.push({ role: "user", text: cleanPrompt });
      }

      // 5. Format to Gemini SDK requirement
      const contents = alternatedContents.map(c => ({
        role: c.role,
        parts: [{ text: c.text }]
      }));

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
      
      const errorStr = error instanceof Error ? error.message : (typeof error === "object" ? JSON.stringify(error) : String(error));
      let friendlyError = "Ocurrió un error al consultar con el agente experto.";
      let friendlyDetails = errorStr;

      const lowerError = errorStr.toLowerCase();
      if (lowerError.includes("429") || lowerError.includes("quota") || lowerError.includes("exhausted") || lowerError.includes("rate limit")) {
        friendlyError = "Límite de cuota excedido (Rate Limit)";
        friendlyDetails = "El servidor gratuito de la API de Gemini tiene un límite de consultas por minuto. Por favor, espera de 30 a 60 segundos antes de enviar tu mensaje. También puedes borrar un historial muy extenso haciendo clic en 'Borrar Historial' arriba a la derecha.";
      } else if (lowerError.includes("timeout") || lowerError.includes("deadline") || lowerError.includes("fetch failed") || lowerError.includes("econnreset")) {
        friendlyError = "Tiempo de espera agotado (Timeout / Network)";
        friendlyDetails = "La red de Gemini tardó demasiado en responder. Trate de reiniciar la conversación mediante 'Borrar Historial' para reducir el volumen de texto, u optimice usando 'Gemini 3.5 Flash' en el selector superior.";
      } else if (lowerError.includes("api key") || lowerError.includes("unauthorized") || lowerError.includes("key_not_found") || lowerError.includes("invalid key")) {
        friendlyError = "API Key no configurada";
        friendlyDetails = "Asegúrese de configurar la variable de entorno GEMINI_API_KEY en 'Settings > Secrets' o en su panel de Vercel.";
      }

      res.status(500).json({
        error: friendlyError,
        details: friendlyDetails,
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
