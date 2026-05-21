export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export type CategoryType = "General" | "Bases de Datos" | "Diseño Web/Móvil" | "Optimización";

export interface PresetPrompt {
  id: string;
  title: string;
  description: string;
  iconName: string;
  prompt: string;
  category: CategoryType;
}

export interface SQLColumn {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignTable?: string;
  description?: string;
}

export interface SQLTable {
  id: string;
  tableName: string;
  columns: SQLColumn[];
}

export type CodeTab = "chat" | "playground" | "gitguide";
