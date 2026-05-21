import React, { useState } from "react";
import { Check, Copy, Download, Code, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface CodeBlockProps {
  key?: React.Key;
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const cleanLanguage = (language || "txt").toLowerCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar el código:", err);
    }
  };

  const handleDownload = () => {
    // Generate simple filenames according to language
    let extension = "txt";
    if (cleanLanguage.includes("typescript") || cleanLanguage === "ts") extension = "ts";
    else if (cleanLanguage.includes("javascript") || cleanLanguage === "js") extension = "js";
    else if (cleanLanguage.includes("sql")) extension = "sql";
    else if (cleanLanguage.includes("html")) extension = "html";
    else if (cleanLanguage.includes("css")) extension = "css";
    else if (cleanLanguage.includes("python") || cleanLanguage === "py") extension = "py";
    else if (cleanLanguage.includes("csharp") || cleanLanguage === "cs") extension = "cs";
    else if (cleanLanguage.includes("json")) extension = "json";
    else if (cleanLanguage.includes("dart") || cleanLanguage === "flutter") extension = "dart";

    const fileName = `lyneitor_code_${Date.now()}.${extension}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = code.trim().split("\n");
  const isLong = lines.length > 20;

  // Aesthetic color tags by language
  const getLangBadgeColor = (lang: string) => {
    switch (lang) {
      case "sql":
      case "sql server":
      case "tsql":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "typescript":
      case "tsx":
      case "ts":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "javascript":
      case "jsx":
      case "js":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "c#":
      case "csharp":
      case "cs":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "python":
      case "py":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "html":
      case "css":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "dart":
      case "flutter":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getLangIcon = (lang: string) => {
    if (lang.includes("sql")) {
      return <Terminal className="w-3.5 h-3.5" />;
    }
    return <Code className="w-3.5 h-3.5" />;
  };

  return (
    <div className="my-4 border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-xl max-w-full">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 select-none">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className={`ml-2 px-2 py-0.5 text-xs font-mono rounded border capitalize font-semibold flex items-center gap-1.5 ${getLangBadgeColor(cleanLanguage)}`}>
            {getLangIcon(cleanLanguage)}
            {cleanLanguage}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Collapse toggle */}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title={expanded ? "Colapsar código" : "Expandir código"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-1 text-xs font-medium"
            title="Descargar archivo de código"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar</span>
          </button>

          {/* Code Copy Action */}
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
              copied
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Copiar al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 animate-bounce" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "¡Copiado!" : "Copiar"}</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div
        className={`overflow-x-auto transition-all duration-300 ${
          expanded ? "max-h-[500px]" : "max-h-[85px] relative mask-bottom"
        }`}
      >
        <pre className="p-4 font-mono text-xs text-slate-300 bg-slate-900/50 flex leading-relaxed select-text">
          {/* Line Numbers */}
          <div className="text-slate-600 text-right pr-4 border-r border-slate-800 select-none mr-4 min-w-[2.25rem]">
            {lines.map((_, i) => (
              <div key={i} className="h-5">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code text content */}
          <code className="text-slate-100 block whitespace-pre flex-1 text-left">
            {lines.map((line, i) => (
              <div key={i} className="h-5 hover:bg-slate-800/30 px-1 rounded transition-colors duration-100">
                {line || " "}
              </div>
            ))}
          </code>
        </pre>

        {/* Collapsed shade overlay */}
        {!expanded && isLong && (
          <div
            onClick={() => setExpanded(true)}
            className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-transparent flex items-end justify-center pb-1.5 cursor-pointer hover:from-slate-900"
          >
            <span className="text-[10px] font-mono font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-1 animate-pulse">
              <ChevronDown className="w-3 h-3" /> Ver {lines.length - 3} líneas ocultas
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
