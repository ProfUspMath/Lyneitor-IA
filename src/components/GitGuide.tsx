import React, { useState } from "react";
import { Github, Play, Key, Settings, Server, Check, Copy, ArrowRight, CheckCircle2 } from "lucide-react";

export default function GitGuide() {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const toggleStep = (stepId: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleCopyText = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const terminalInitCommands = `git init
git add .
git commit -m "feat: primer commit del agente experto"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITO_NUEVO.git
git push -u origin main`;

  const dotenvExample = `GEMINI_API_KEY="Tu_Clave_Privada_De_Google_AI_Studio"
NODE_ENV="production"`;

  const vercelJsonExample = `{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  return (
    <div className="max-h-[calc(100vh-210px)] overflow-y-auto pr-1 text-slate-200">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Github className="w-5 h-5 text-purple-400" />
          Guía Interactiva: Exportación a GitHub y Despliegue en Vercel
        </h3>
        <p className="text-xs text-slate-400 mt-2">
          Sigue esta guía secuencial paso a paso para descargar tu repositorio, subir el código fuente de forma segura a un repositorio público/privado de GitHub y desplegarlo en producción con Vercel.
        </p>

        {/* Progress Tracker */}
        <div className="mt-4 bg-slate-950/60 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Progreso de Configuración:</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-36 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all duration-300"
                style={{
                  width: `${(Object.values(completedSteps).filter(Boolean).length / 4) * 100}%`
                }}
              ></div>
            </div>
            <span className="text-xs font-mono font-bold text-brand-primary">
              {Object.values(completedSteps).filter(Boolean).length}/4 Completados
            </span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-6 pb-6">
        {/* Step 1 */}
        <div className={`p-5 rounded-xl border transition-all ${
          completedSteps[1] ? "bg-slate-900/40 border-slate-800" : "bg-slate-900 border-slate-800 hover:border-slate-700"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                completedSteps[1] ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-primary/10 text-brand-primary"
              }`}>
                1
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  Preparar el entorno Local (.env)
                  {completedSteps[1] && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Crea un archivo local llamado <code className="text-cyan-400 font-mono">.env</code> en la raíz del proyecto para alojar tus credenciales privadas.
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleStep(1)}
              className="text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition font-medium"
            >
              {completedSteps[1] ? "Marcar Pendiente" : "Completado"}
            </button>
          </div>

          <div className="mt-4 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] select-none font-mono text-slate-400">
              <span>ARCHIVO .env</span>
              <button
                onClick={() => handleCopyText(dotenvExample, "env")}
                className="flex items-center gap-1 hover:text-white transition"
              >
                {copiedText === "env" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === "env" ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
            <pre className="p-3 font-mono text-[11px] text-slate-300">{dotenvExample}</pre>
          </div>
          <p className="text-[11px] text-amber-400/95 mt-2.5 font-sans leading-relaxed italic">
            ⚠️ ¡ATENCIÓN!: Nunca agregues el archivo <code className="font-mono bg-amber-500/10 px-1 rounded border border-amber-500/20">.env</code> a Git. Verifica que esté listado en tu archivo <code className="font-mono">.gitignore</code> para evitar fugas de tu API Key de Google AI Studio.
          </p>
        </div>

        {/* Step 2 */}
        <div className={`p-5 rounded-xl border transition-all ${
          completedSteps[2] ? "bg-slate-900/40 border-slate-800" : "bg-slate-900 border-slate-800 hover:border-slate-700"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                completedSteps[2] ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-primary/10 text-brand-primary"
              }`}>
                2
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  Inicializar Git y Subir a GitHub
                  {completedSteps[2] && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Ejecuta estos comandos en la consola local del proyecto para enviar el código a tu nuevo repositorio de GitHub.
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleStep(2)}
              className="text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition font-medium"
            >
              {completedSteps[2] ? "Marcar Pendiente" : "Completado"}
            </button>
          </div>

          <div className="mt-4 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] select-none font-mono text-slate-400">
              <span>COMANDOS DE CONSOLA (TERMINAL)</span>
              <button
                onClick={() => handleCopyText(terminalInitCommands, "git")}
                className="flex items-center gap-1 hover:text-white transition"
              >
                {copiedText === "git" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === "git" ? "Copiado" : "Copiar todo"}</span>
              </button>
            </div>
            <pre className="p-3 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">{terminalInitCommands}</pre>
          </div>
        </div>

        {/* Step 3 */}
        <div className={`p-5 rounded-xl border transition-all ${
          completedSteps[3] ? "bg-slate-900/40 border-slate-800" : "bg-slate-900 border-slate-800 hover:border-slate-700"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                completedSteps[3] ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-primary/10 text-brand-primary"
              }`}>
                3
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  Configurar compilación en Vercel
                  {completedSteps[3] && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Para despliegues híbridos SPA en Vercel, agrega este archivo <code className="text-cyan-400 font-mono">vercel.json</code> en el directorio raíz para enrutar los middlewares SPA.
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleStep(3)}
              className="text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition font-medium"
            >
              {completedSteps[3] ? "Marcar Pendiente" : "Completado"}
            </button>
          </div>

          <div className="mt-4 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] select-none font-mono text-slate-400">
              <span>CONFIGURACIÓN vercel.json</span>
              <button
                onClick={() => handleCopyText(vercelJsonExample, "json")}
                className="flex items-center gap-1 hover:text-white transition"
              >
                {copiedText === "json" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === "json" ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
            <pre className="p-3 font-mono text-[11px] text-slate-300">{vercelJsonExample}</pre>
          </div>
        </div>

        {/* Step 4 */}
        <div className={`p-5 rounded-xl border transition-all ${
          completedSteps[4] ? "bg-slate-900/40 border-slate-800" : "bg-slate-900 border-slate-800 hover:border-slate-700"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                completedSteps[4] ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-primary/10 text-brand-primary"
              }`}>
                4
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  Setear Variables de Entorno en Vercel
                  {completedSteps[4] && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  En el panel de su proyecto en Vercel (Settings &gt; Environment Variables), configure su clave:
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleStep(4)}
              className="text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition font-medium"
            >
              {completedSteps[4] ? "Marcar Pendiente" : "Completado"}
            </button>
          </div>

          <div className="mt-4 bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3.5 font-sans">
            <div className="flex items-center justify-between p-2.5 bg-slate-900/70 border border-slate-800/10 rounded-lg text-xs">
              <span className="font-mono text-cyan-400 font-bold">KEY</span>
              <span className="font-mono text-slate-400">VALUE</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg text-xs font-mono">
              <span className="font-bold flex items-center gap-1 text-slate-100">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                GEMINI_API_KEY
              </span>
              <span className="text-slate-500 italic">tu_apy_key_de_ai_studio_aquí</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs leading-relaxed bg-slate-900/40 p-3 rounded-lg">
              <Settings className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>
                Simplemente importa tu repositorio de GitHub directamente a Vercel con un solo click. Vercel detectará que es un proyecto de Vite estructurado y correrá automáticamente <code className="font-mono text-white">npm run build</code>, colocando la SPA en la nube de forma óptima a nivel mundial.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
