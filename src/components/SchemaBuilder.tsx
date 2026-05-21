import React, { useState } from "react";
import { SQLTable, SQLColumn } from "../types";
import { INITIAL_MOCK_TABLES, DATA_TYPES } from "../presets";
import { Plus, Trash2, Database, Code, Copy, Check, MessageSquareCode, Sparkles, HelpCircle } from "lucide-react";

interface SchemaBuilderProps {
  onSendPromptToChat: (prompt: string) => void;
}

export default function SchemaBuilder({ onSendPromptToChat }: SchemaBuilderProps) {
  const [tables, setTables] = useState<SQLTable[]>(INITIAL_MOCK_TABLES);
  const [selectedDialect, setSelectedDialect] = useState<"sqlserver" | "postgres" | "mysql">("sqlserver");
  const [copied, setCopied] = useState(false);

  // Table operations
  const addTable = () => {
    const tableId = `tbl-${Date.now()}`;
    const newTable: SQLTable = {
      id: tableId,
      tableName: `nueva_tabla_${tables.length + 1}`,
      columns: [
        {
          id: `col-${Date.now()}-1`,
          name: "id",
          type: "INT",
          nullable: false,
          isPrimaryKey: true,
          isForeignKey: false,
          description: "Llave primaria incremental"
        }
      ]
    };
    setTables([...tables, newTable]);
  };

  const removeTable = (tableId: string) => {
    setTables(tables.filter((t) => t.id !== tableId));
  };

  const updateTableName = (tableId: string, newName: string) => {
    setTables(
      tables.map((t) => {
        if (t.id === tableId) {
          return { ...t, tableName: newName.toLowerCase().replace(/[^a-z0-9_]/g, "") };
        }
        return t;
      })
    );
  };

  // Column operations
  const addColumn = (tableId: string) => {
    setTables(
      tables.map((t) => {
        if (t.id === tableId) {
          const colId = `col-${Date.now()}`;
          const newColumn: SQLColumn = {
            id: colId,
            name: `campo_${t.columns.length + 1}`,
            type: "VARCHAR(50)",
            nullable: true,
            isPrimaryKey: false,
            isForeignKey: false,
            description: ""
          };
          return { ...t, columns: [...t.columns, newColumn] };
        }
        return t;
      })
    );
  };

  const removeColumn = (tableId: string, columnId: string) => {
    setTables(
      tables.map((t) => {
        if (t.id === tableId) {
          return { ...t, columns: t.columns.filter((c) => c.id !== columnId) };
        }
        return t;
      })
    );
  };

  const updateColumn = (tableId: string, columnId: string, updatedFields: Partial<SQLColumn>) => {
    setTables(
      tables.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            columns: t.columns.map((c) => {
              if (c.id === columnId) {
                let fresh = { ...c, ...updatedFields };
                // Fix logical overlaps
                if (updatedFields.isPrimaryKey) {
                  fresh.nullable = false;
                  fresh.isForeignKey = false;
                }
                return fresh;
              }
              return c;
            })
          };
        }
        return t;
      })
    );
  };

  // Generate perfect dialect SQL DDL Script
  const generateSQL = (): string => {
    let output = "";
    
    if (selectedDialect === "sqlserver") {
      output += `-- ==========================================================\n`;
      output += `-- SCRIPT GENERADO PARA MICROSOFT SQL SERVER (T-SQL)\n`;
      output += `-- Generado el: ${new Date().toLocaleDateString()}\n`;
      output += `-- ==========================================================\n\n`;
    } else if (selectedDialect === "postgres") {
      output += `-- ==========================================================\n`;
      output += `-- SCRIPT GENERADO PARA POSTGRESQL\n`;
      output += `-- ==========================================================\n\n`;
    } else {
      output += `-- ==========================================================\n`;
      output += `-- SCRIPT GENERADO PARA MYSQL\n`;
      output += `-- ==========================================================\n\n`;
    }

    tables.forEach((table) => {
      output += `CREATE TABLE [${table.tableName}] (\n`;
      if (selectedDialect === "postgres") {
        output = output.replace(`CREATE TABLE [${table.tableName}]`, `CREATE TABLE "${table.tableName}"`);
      } else if (selectedDialect === "mysql") {
        output = output.replace(`CREATE TABLE [${table.tableName}]`, `CREATE TABLE \`${table.tableName}\``);
      }

      const colLines = table.columns.map((col) => {
        let line = "  ";
        // Enclose names depending on dialect
        if (selectedDialect === "sqlserver") {
          line += `[${col.name}]`;
        } else if (selectedDialect === "postgres") {
          line += `"${col.name}"`;
        } else {
          line += `\`${col.name}\``;
        }

        // Adjust incremental primary key types according to dialect
        let colType = col.type;
        if (col.isPrimaryKey) {
          if (selectedDialect === "sqlserver" && colType === "INT") {
            colType = "INT IDENTITY(1,1)";
          } else if (selectedDialect === "postgres" && colType === "INT") {
            colType = "SERIAL";
          } else if (selectedDialect === "mysql" && colType === "INT") {
            colType = "INT AUTO_INCREMENT";
          }
        }

        line += ` ${colType}`;

        if (col.isPrimaryKey) {
          line += " PRIMARY KEY";
        } else {
          line += col.nullable ? " NULL" : " NOT NULL";
        }

        if (col.description && selectedDialect === "sqlserver") {
          // comments as line annotations
          line += ` -- ${col.description}`;
        }
        return line;
      });

      // Add relationships / foreign keys constraints inside table or alter table statements
      table.columns.forEach((col) => {
        if (col.isForeignKey && col.foreignTable) {
          let fkName = `FK_${table.tableName}_${col.foreignTable}`;
          if (selectedDialect === "sqlserver") {
            colLines.push(`  CONSTRAINT [${fkName}] FOREIGN KEY ([${col.name}]) REFERENCES [${col.foreignTable}] ([id])`);
          } else if (selectedDialect === "postgres") {
            colLines.push(`  CONSTRAINT "${fkName}" FOREIGN KEY ("${col.name}") REFERENCES "${col.foreignTable}" ("id")`);
          } else {
            colLines.push(`  CONSTRAINT \`${fkName}\` FOREIGN KEY (\`${col.name}\`) REFERENCES \`${col.foreignTable}\` (\`id\`)`);
          }
        }
      });

      output += colLines.join(",\n");
      output += `\n);\n`;

      // SQL Server comments metadata
      if (selectedDialect === "sqlserver") {
        table.columns.forEach((col) => {
          if (col.description) {
            output += `\nEXEC sys.sp_addextendedproperty \n`;
            output += `  @name = N'MS_Description', @value = N'${col.description}',\n`;
            output += `  @level0type = N'SCHEMA', @level0name = N'dbo',\n`;
            output += `  @level1type = N'TABLE', @level1name = N'${table.tableName}',\n`;
            output += `  @level2type = N'COLUMN', @level2name = N'${col.name}';\n`;
          }
        });
      }
      output += `\n`;
    });

    // Auto-generate some indexes for performance optimization
    output += `-- ==========================================================\n`;
    output += `-- ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN\n`;
    output += `-- ==========================================================\n`;
    tables.forEach((table) => {
      table.columns.forEach((col) => {
        if (col.isForeignKey) {
          if (selectedDialect === "sqlserver") {
            output += `CREATE NONCLUSTERED INDEX [IX_${table.tableName}_${col.name}] ON [${table.tableName}] ([${col.name}]);\n`;
          } else if (selectedDialect === "postgres") {
            output += `CREATE INDEX "IX_${table.tableName}_${col.name}" ON "${table.tableName}" ("${col.name}");\n`;
          } else {
            output += `CREATE INDEX \`IX_${table.tableName}_${col.name}\` ON \`${table.tableName}\` (\`${col.name}\`);\n`;
          }
        }
      });
    });

    return output;
  };

  const handleCopySQL = () => {
    const code = generateSQL();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendToAgent = (actionType: "explain" | "seed" | "optimize") => {
    const schema = generateSQL();
    let promptText = "";
    if (actionType === "explain") {
      promptText = `Hola, podrías explicar a detalle esta estructura de base de datos SQL? Cuál es el objetivo de las relaciones y qué mejores prácticas de diseño arquitectónico ves aquí:\n\n\`\`\`sql\n${schema}\n\`\`\``;
    } else if (actionType === "seed") {
      promptText = `Por favor, escribe un script de carga de datos semilla (DML con sentencias INSERT INTO) coherentes y realistas para poblar mis tablas SQL. Asegúrate de respetar el orden de las llaves foráneas para evitar errores de integridad referencial:\n\n\`\`\`sql\n${schema}\n\`\`\``;
    } else {
      promptText = `Hola experto, podrías sugerir cómo optimizar esta base de datos a nivel de SQL Server o Postgres? Analiza si falta algún índice compuesto, particionamiento, o consejos para queries de alto volumen basados en este diseño:\n\n\`\`\`sql\n${schema}\n\`\`\``;
    }
    onSendPromptToChat(promptText);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full text-slate-100 p-1">
      {/* Visual Editor (Left 7 Cols) */}
      <div className="xl:col-span-7 flex flex-col space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-primary" />
              Diseñador de Tablas Relacional Visual
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Agrega tablas y columnas interactivamente para generar DDL compatible para tu base de datos.
            </p>
          </div>
          <button
            onClick={addTable}
            className="px-3 py-1.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Tabla</span>
          </button>
        </div>

        {tables.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <Database className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-400">No hay tablas en el esquema actual.</p>
            <button
              onClick={addTable}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-semibold transition"
            >
              Comenzar a diseñar
            </button>
          </div>
        ) : (
          tables.map((table) => (
            <div
              key={table.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700/80 transition-colors"
            >
              {/* Header de la tabla */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    value={table.tableName}
                    onChange={(e) => updateTableName(table.id, e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-48"
                    placeholder="nombre_tabla"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({table.columns.length} {table.columns.length === 1 ? "campo" : "campos"})
                  </span>
                </div>
                <button
                  onClick={() => removeTable(table.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                  title="Eliminar tabla"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Columnas de la tabla */}
              <div className="p-4 space-y-3">
                <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 px-1 uppercase font-mono tracking-wider">
                  <div className="col-span-3">Nombre del Campo</div>
                  <div className="col-span-3">Tipo de Dato</div>
                  <div className="col-span-2 text-center">Nulo</div>
                  <div className="col-span-1 text-center">PK</div>
                  <div className="col-span-2">Relación (FK)</div>
                  <div className="col-span-1">Acción</div>
                </div>

                <div className="space-y-2">
                  {table.columns.map((col) => (
                    <div
                      key={col.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-950/40 p-2 rounded-lg border border-slate-800/60"
                    >
                      {/* Campo Name */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => updateColumn(table.id, col.id, { name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                          className="w-full bg-slate-900 rounded border border-slate-800 px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                          placeholder="id_columna"
                        />
                      </div>

                      {/* Campo Type */}
                      <div className="col-span-3">
                        <select
                          value={col.type}
                          onChange={(e) => updateColumn(table.id, col.id, { type: e.target.value })}
                          className="w-full bg-slate-900 rounded border border-slate-800 px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                          {DATA_TYPES.map((dt) => (
                            <option key={dt} value={dt}>
                              {dt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Nullable */}
                      <div className="col-span-2 text-center flex items-center justify-center">
                        <label className="flex items-center space-x-1 cursor-pointer md:justify-center">
                          <input
                            type="checkbox"
                            checked={col.nullable}
                            disabled={col.isPrimaryKey}
                            onChange={(e) => updateColumn(table.id, col.id, { nullable: e.target.checked })}
                            className="bg-slate-900 border-slate-800 rounded text-brand-primary focus:ring-opacity-0 focus:outline-none cursor-pointer h-3.5 w-3.5"
                          />
                          <span className="md:hidden text-xs text-slate-400">Permitir Nulo</span>
                        </label>
                      </div>

                      {/* Primary Key Check */}
                      <div className="col-span-1 text-center flex items-center justify-center">
                        <label className="flex items-center space-x-1 cursor-pointer md:justify-center">
                          <input
                            type="checkbox"
                            checked={col.isPrimaryKey}
                            onChange={(e) => updateColumn(table.id, col.id, { isPrimaryKey: e.target.checked })}
                            className="bg-slate-900 border-slate-800 rounded text-amber-500 focus:ring-opacity-0 focus:outline-none cursor-pointer h-3.5 w-3.5"
                          />
                          <span className="md:hidden text-xs text-slate-400">Primary Key</span>
                        </label>
                      </div>

                      {/* Foreign Key Relations */}
                      <div className="col-span-2 flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={col.isForeignKey}
                          disabled={col.isPrimaryKey}
                          onChange={(e) => updateColumn(table.id, col.id, { isForeignKey: e.target.checked })}
                          className="bg-slate-900 border-slate-800 rounded text-cyan-500 focus:ring-opacity-0 focus:outline-none cursor-pointer h-3.5 w-3.5"
                        />
                        {col.isForeignKey ? (
                          <select
                            value={col.foreignTable || ""}
                            onChange={(e) => updateColumn(table.id, col.id, { foreignTable: e.target.value })}
                            className="bg-slate-900 rounded border border-slate-800 px-1 py-0.5 text-[10px] text-slate-300 w-full focus:outline-none"
                          >
                            <option value="">-- Tabla --</option>
                            {tables
                              .filter((t) => t.id !== table.id)
                              .map((t) => (
                                <option key={t.id} value={t.tableName}>
                                  {t.tableName}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono italic">No FK</span>
                        )}
                      </div>

                      {/* Delete col */}
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => removeColumn(table.id, col.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800/50 transition-colors"
                          title="Eliminar columna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addColumn(table.id)}
                  className="mt-2 text-xs text-brand-primary hover:text-brand-hover hover:underline font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Columna (Campo)</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Code DDL Generator (Right 5 Cols) */}
      <div className="xl:col-span-5 flex flex-col space-y-4 max-h-[calc(100vh-210px)] bg-slate-900 rounded-xl border border-slate-800 p-4">
        {/* Dialect Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 tracking-wider font-mono">DIALECTO SQL</span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedDialect("sqlserver")}
              className={`px-2.5 py-1 text-[10px] font-mono rounded font-semibold transition ${
                selectedDialect === "sqlserver" ? "bg-cyan-500/15 text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              SQL Server
            </button>
            <button
              onClick={() => setSelectedDialect("postgres")}
              className={`px-2.5 py-1 text-[10px] font-mono rounded font-semibold transition ${
                selectedDialect === "postgres" ? "bg-purple-500/15 text-purple-400" : "text-slate-400 hover:text-white"
              }`}
            >
              PostgreSQL
            </button>
            <button
              onClick={() => setSelectedDialect("mysql")}
              className={`px-2.5 py-1 text-[10px] font-mono rounded font-semibold transition ${
                selectedDialect === "mysql" ? "bg-amber-500/15 text-amber-500" : "text-slate-400 hover:text-white"
              }`}
            >
              MySQL
            </button>
          </div>
        </div>

        {/* Real-time DDL Code area */}
        <div className="flex-1 bg-slate-950 rounded-lg p-3 overflow-y-auto border border-slate-800/80 relative">
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed select-text whitespace-pre-wrap">
            {generateSQL()}
          </pre>

          {/* Copy action on code hover */}
          <button
            onClick={handleCopySQL}
            className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
              copied
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]"
                : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 p-1.5"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px]">{copied ? "¡Copiado!" : "Copiar DDL"}</span>
          </button>
        </div>

        {/* Send prompt DDL to AI controls */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Consultar al Agente Experto con este Esquema</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Envía instantáneamente este diseño a nuestro experto en Inteligencia Artificial para recibir análisis estratégico.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 font-sans">
            <button
              onClick={() => sendToAgent("explain")}
              className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-200 rounded-lg transition-all flex flex-col items-center justify-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Explicar Diseño</span>
            </button>
            <button
              onClick={() => sendToAgent("optimize")}
              className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-200 rounded-lg transition-all flex flex-col items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Optimizar</span>
            </button>
            <button
              onClick={() => sendToAgent("seed")}
              className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-200 rounded-lg transition-all flex flex-col items-center justify-center gap-1"
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-yellow-400" />
              <span>Generar Mocks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
