import React from "react";
import CodeBlock from "./CodeBlock";

interface MarkdownParserProps {
  content: string;
}

export default function MarkdownParser({ content }: MarkdownParserProps) {
  if (!content) return null;

  // Split content by triple backticks to isolate code blocks
  const parts = content.split("```");

  return (
    <div className="space-y-3 font-sans leading-relaxed text-slate-200">
      {parts.map((part, index) => {
        const isCodeBlock = index % 2 === 1;

        if (isCodeBlock) {
          // The first line of a code block is typically the language
          const lines = part.split("\n");
          const language = lines[0].trim() || "txt";
          const code = lines.slice(1).join("\n");

          return <CodeBlock key={index} code={code} language={language} />;
        } else {
          // Render plain text with basic markdown formatting (paragraphs, lists, inline code)
          return (
            <div key={index} className="space-y-2.5">
              {part.split("\n\n").map((paragraph, pIdx) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Handle bullet lists
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("1. ")) {
                  const listLines = trimmed.split("\n");
                  return (
                    <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2 text-slate-300">
                      {listLines.map((line, lIdx) => {
                        const cleanLine = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
                        return (
                          <li key={lIdx} className="text-sm">
                            {renderInlineText(cleanLine)}
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                // Handle standard paragraph text
                return (
                  <p key={pIdx} className="text-sm md:text-base text-slate-300 antialiased font-normal leading-relaxed">
                    {renderInlineText(trimmed)}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

// Function to handle custom inline styles: **bold** and `inline code`
function renderInlineText(text: string): React.ReactNode[] {
  // Regex pattern to split bold (**text**) and inline code (`code`)
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-white ml-0.5 mr-0.5">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="font-mono text-cyan-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 text-[13px]">
          {part.slice(1, -1)}
        </code>
      );
    } else {
      return <React.Fragment key={index}>{part}</React.Fragment>;
    }
  });
}
