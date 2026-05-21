import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Database,
  Github,
  Sparkles,
  Code2,
  Cpu,
  Trash2,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Smartphone,
  Zap,
  Layers,
  HelpCircle,
  Copy,
  Check,
  Terminal,
  RefreshCw
} from "lucide-react";
import { Message, CodeTab } from "./types";
import { TECH_PRESETS, PRESET_CATEGORIES } from "./presets";
import MarkdownParser from "./components/MarkdownParser";
import SchemaBuilder from "./components/SchemaBuilder";
import GitGuide from "./components/GitGuide";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "¡Hola! Soy **Lyneitor**, tu agente personal y consultor experto en ingeniería de software, arquitectura de sistemas y administración de bases de datos (SQL, SQL Server, PostgreSQL, MySQL).\n\nConsúltame sobre:\n- 📊 Escribir queries de alto rendimiento u optimizar procedimientos almacenados.\n- 🎨 Diseñar interfaces responsivas modernas con HTML/CSS/Tailwind o maquetados para aplicaciones móviles (Flutter/React Native).\n- 💻 Depurar errores complejos en lenguajes como TypeScript, C#, Python, Rust o Java.\n\n_Puedes usar una de las plantillas de código rápido o presionar el botón de la Guía de Vercel para ver cómo desplegar a producción._",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<CodeTab>("chat");
  const [selectedModel, setSelectedModel] = useState<"gemini-3.5-flash" | "gemini-3.1-pro-preview">("gemini-3.5-flash");
  const [activePresetCategory, setActivePresetCategory] = useState<string>("Bases de Datos");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || userInput).trim();
    if (!promptText) return;

    if (!textToSend) {
      setUserInput("");
    }

    const newUserMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update conversation feed
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Build conversation history format for the express secure proxy
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          history: historyPayload,
          model: selectedModel
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al conectar con el servidor.");
      }

      const data = await res.json();
      
      const newAIMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, newAIMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-err`,
        role: "model",
        text: `⚠️ **Error de Comunicación:** ${err.message || "No pudimos comunicarnos con el agente experto en el servidor."}\n\nPor favor, verifica que las variables de entorno de tu API Key estén correctamente configuradas.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (prompt: string) => {
    setActiveTab("chat");
    handleSendMessage(prompt);
  };

  const handleClearHistory = () => {
    if (confirm("¿Estás seguro de que deseas limpiar el historial de la conversación?")) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          text: "Historial limpiado. ¿En qué nuevo reto tecnológico te puedo ayudar hoy, Ingeniero?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handlePromptFromSchema = (prompt: string) => {
    setActiveTab("chat");
    handleSendMessage(prompt);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case "Database":
        return <Database className="w-3.5 h-3.5 text-cyan-400" />;
      case "Zap":
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case "Layout":
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case "Smartphone":
        return <Smartphone className="w-3.5 h-3.5 text-rose-400" />;
      case "Code":
        return <Code2 className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Upper Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Code2 className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-white tracking-tight sm:text-base">Lyneitor AI Agent</h1>
                <span className="hidden sm:inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                  Soporte SQL Server + Completo
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Agente Experto de Código y Consultas a BD</p>
            </div>
          </div>

          {/* Model selection and controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-transparent text-[11px] font-mono text-slate-300 font-bold focus:outline-none cursor-pointer hover:text-white transition"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Super Rápido)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Pensamiento Avanzado)</option>
              </select>
            </div>

            {/* Terminal indicator */}
            <div className="hidden md:flex items-center space-x-1.5 text-slate-400 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400">PROD_ENV_ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Workdesk */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Control Panel / Dock (4 columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-5 h-[calc(100vh-120px)] lg:max-h-[calc(100vh-120px)] overflow-y-auto">
          
          {/* Main workspace navigation tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono block px-2.5 mb-2.5 uppercase">
              Módulos de Trabajo
            </span>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("chat")}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "chat"
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Conversación de Código</span>
                </div>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab("playground")}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "playground"
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Database className="w-4 h-4" />
                  <span>Diseñador Visual de BD</span>
                </div>
                <span className="text-[9px] font-bold font-mono bg-cyan-400/20 text-cyan-400 px-1.5 py-0.5 rounded uppercase">
                  SQL Server
                </span>
              </button>

              <button
                onClick={() => setActiveTab("gitguide")}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === "gitguide"
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Github className="w-4 h-4" />
                  <span>Guía GitHub & Vercel</span>
                </div>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            </div>
          </div>

          {/* Quick Presets Prompt Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono block uppercase">
                Plantillas y Prompts Rápidos
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Selecciona una tarea programada para que el agente empiece a trabajar.
              </p>
            </div>

            {/* Categories tab */}
            <div className="flex space-x-1 bg-slate-950 p-0.5 rounded-lg overflow-x-auto border border-slate-800">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActivePresetCategory(cat)}
                  className={`px-2 py-1 text-[10px] font-semibold whitespace-nowrap rounded-md cursor-pointer transition ${
                    activePresetCategory === cat
                      ? "bg-slate-800 text-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {TECH_PRESETS.filter((p) => p.category === activePresetCategory).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.prompt)}
                  className="w-full text-left p-2.5 bg-slate-950/70 hover:bg-slate-950 hover:border-slate-700/80 border border-slate-800/80 rounded-lg transition-all group flex items-start space-x-2"
                >
                  <div className="p-1 rounded bg-slate-900 mt-0.5 group-hover:bg-slate-850 flex-shrink-0 transition">
                    {getPresetIcon(preset.iconName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-bold text-slate-200 truncate group-hover:text-cyan-400 transition">
                      {preset.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Vercel Configuration Check List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hidden lg:block text-[11px]">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono block uppercase">
              Verificación de Exportación
            </span>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Copiar y probar códigos con formato</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Configurar <code className="text-pink-400 font-mono text-[10px]">.env</code> en local</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Emparejar con GitHub y publicar en Vercel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output View Deck (8 columns) */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-120px)] lg:max-h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl">
          
          <AnimatePresence mode="wait">
            {/* Chat Tab View */}
            {activeTab === "chat" && (
              <motion.div
                key="chat-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* Chat feed top metadata bar */}
                <div className="px-5 py-3.5 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-semibold text-white">Consultor de Ingeniería de Software activo</span>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-slate-500 hover:text-rose-400 font-semibold font-mono flex items-center gap-1.5 border border-slate-850 px-2.5 py-1 rounded-lg hover:border-rose-500/10 hover:bg-rose-500/5 transition"
                    title="Limpiar la conversación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Borrar Historial</span>
                  </button>
                </div>

                {/* Messages Panel Container */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-3`}
                    >
                      {msg.role === "model" && (
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <Cpu className="w-4 h-4 text-indigo-400" />
                        </div>
                      )}
                      
                      <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-md ${
                          msg.role === "user"
                            ? "bg-brand-primary text-white rounded-br-none"
                            : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                        }`}>
                          <MarkdownParser content={msg.text} />
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator Loading bar */}
                  {isLoading && (
                    <div className="flex justify-start items-start gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
                      </div>
                      <div className="flex flex-col max-w-[85%]">
                        <div className="px-4.5 py-3.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl rounded-bl-none flex items-center space-x-3">
                          <div className="flex space-x-1.5 items-center select-none py-1">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono italic">Lyneitor analizando requerimiento...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Lower Prompt Inputs area */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center space-x-2 bg-slate-950 rounded-xl border border-slate-800 p-2.5 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all duration-200"
                  >
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Pregunta sobre bases de datos, TypeScript, optimización de queries SQL Server..."
                      className="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-slate-200 focus:outline-none placeholder-slate-500 focus:ring-0 min-w-0"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !userInput.trim()}
                      className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                        userInput.trim() && !isLoading
                          ? "bg-brand-primary text-white hover:bg-brand-hover shadow-md"
                          : "bg-slate-900 border border-slate-850 text-slate-600"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Database Playground Tab View */}
            {activeTab === "playground" && (
              <motion.div
                key="playground-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col h-full overflow-hidden p-6"
              >
                <SchemaBuilder onSendPromptToChat={handlePromptFromSchema} />
              </motion.div>
            )}

            {/* Git & Vercel Publishing Guide View */}
            {activeTab === "gitguide" && (
              <motion.div
                key="gitguide-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col h-full overflow-hidden p-6"
              >
                <GitGuide />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
