import { PresetPrompt, SQLTable } from "./types";

export const PRESET_CATEGORIES = [
  "General",
  "Bases de Datos",
  "Diseño Web/Móvil",
  "Optimización"
] as const;

export const TECH_PRESETS: PresetPrompt[] = [
  {
    id: "sql-sp",
    title: "SQL Server: SP Seguro",
    description: "Crea un stored procedure seguro que previene la inyección SQL y maneja transacciones sólidas.",
    iconName: "Database",
    category: "Bases de Datos",
    prompt: "Genera la sintaxis completa de un Procedimiento Almacenado (Stored Procedure) optimizado para Microsoft SQL Server (T-SQL). Debe incluir: 1) Parámetros de entrada validados, 2) Uso de transacciones con TRY...CATCH completo, 3) Control de errores mediante THROW y retorno de códigos, 4) Prevención activa de inyección de código SQL y recomendación de índices en las tablas involucradas."
  },
  {
    id: "sql-opt",
    title: "Optimizar Query SQL",
    description: "Corrige una consulta SQL lenta analizando índices, subconsultas y escaneos de tablas completas.",
    iconName: "Zap",
    category: "Optimización",
    prompt: "Analiza el siguiente escenario de base de datos lenta y propón una versión altamente optimizada: Tengo una consulta con múltiples JOINs pesados, subconsultas en el SELECT y filtros de tipo LIKE '%buscar%'. Explícame detalladamente: 1) Cómo reescribir la query usando JOINs eficientes, 2) Qué índices agrupados (Clustered) y no agrupados (Non-Clustered) debo crear compatibles con SQL Server, 3) Cómo el optimizador de consultas lee la ejecución (Table Scan vs. Index Seek)."
  },
  {
    id: "web-card",
    title: "Diseño Web: Componente Bento Grid",
    description: "Genera código para un layout responsivo estilo Bento Grid utilizando Tailwind CSS y estados de React.",
    iconName: "Layout",
    category: "Diseño Web/Móvil",
    prompt: "Diseña un componente de React y Tailwind CSS que implemente un diseño responsivo de tipo 'Bento Grid'. Debe lucir premium, moderno, con fondo oscuro refinado, esquinas redondeadas detalladas, bordes translúcidos y efectos 'hover' para las secciones de tarjetas de información. El código debe proveer estados simulados para la interacción e incorporar iconos importados desde 'lucide-react' de manera limpia."
  },
  {
    id: "app-flutter",
    title: "Diseño App: Lista Flutter",
    description: "Escribe una estructura limpia de lista con scroll infinito, caching local y transiciones de carga.",
    iconName: "Smartphone",
    category: "Diseño Web/Móvil",
    prompt: "Escribe el código estructurado en Flutter/Dart para una pantalla responsiva de catálogo de productos móvil. La implementación debe incluir: 1) Estructura limpia usando ListView.builder con scroll infinito, 2) Un patrón de arquitectura BLoC o Provider recomendado, 3) Buenas prácticas de UI/UX móvil como Skeleton loaders en los estados de carga y manejo del ciclo de vida."
  },
  {
    id: "err-ts",
    title: "Depuración de Tipos TS",
    description: "Encuentra y soluciona un error complejo de TypeScript con tipos genéricos y uniones discriminadas.",
    iconName: "Code",
    category: "Optimización",
    prompt: "Tengo un error de tipado estricto en TypeScript al intentar mapear una unión discriminada genérica. Explícanos paso a paso: 1) Cuál es el origen principal del error de aserción silenciosa, 2) Cómo estructurar correctamente las interfaces y guards de tipo (Type Guards) personalizados para solucionarlo, y 3) Escribe el código corregido de ejemplo con tipos genéricos seguros de modo que el compilador no arroje ningún error de tipo 'any'."
  },
  {
    id: "sql-norm",
    title: "Normalización de Base de Datos",
    description: "Genera el diseño lógico del esquema (1FN, 2FN, 3FN) para un sistema transaccional complejo.",
    iconName: "Grid",
    category: "Bases de Datos",
    prompt: "Diseña la estructura de base de datos normalizada para un sistema de comercio electrónico clásico que incluya clientes, pedidos, detalles de pedidos, inventario, categorías y métodos de pago. Genera: 1) El modelo lógico normalizado hasta la Tercera Forma Normal (3FN), 2) Todo el código DDL SQL completo para crear las tablas con claves primarias, claves foráneas con cascada apropiada, restricciones (check, unique) y comentarios explicativos."
  }
];

export const INITIAL_MOCK_TABLES: SQLTable[] = [
  {
    id: "tbl-usuarios",
    tableName: "usuarios",
    columns: [
      { id: "col-1", name: "usuario_id", type: "INT", nullable: false, isPrimaryKey: true, isForeignKey: false, description: "Identificador único incremental" },
      { id: "col-2", name: "email", type: "VARCHAR(255)", nullable: false, isPrimaryKey: false, isForeignKey: false, description: "Dirección de correo electrónico única" },
      { id: "col-3", name: "nombre_completo", type: "VARCHAR(150)", nullable: false, isPrimaryKey: false, isForeignKey: false, description: "Nombre real del usuario" },
      { id: "col-4", name: "fecha_registro", type: "DATETIME", nullable: false, isPrimaryKey: false, isForeignKey: false, description: "Timestamp de alta en el sistema" },
      { id: "col-5", name: "rol_id", type: "INT", nullable: false, isPrimaryKey: false, isForeignKey: true, foreignTable: "roles", description: "Llave foránea para la tabla roles" }
    ]
  },
  {
    id: "tbl-pedidos",
    tableName: "pedidos",
    columns: [
      { id: "col-p1", name: "pedido_id", type: "INT", nullable: false, isPrimaryKey: true, isForeignKey: false, description: "Número de orden transaccional" },
      { id: "col-p2", name: "usuario_id", type: "INT", nullable: false, isPrimaryKey: false, isForeignKey: true, foreignTable: "usuarios", description: "Cliente que realizó la compra" },
      { id: "col-p3", name: "monto_total", type: "DECIMAL(10,2)", nullable: false, isPrimaryKey: false, isForeignKey: false, description: "Valor de facturación total del pedido" },
      { id: "col-p4", name: "estado", type: "VARCHAR(50)", nullable: false, isPrimaryKey: false, isForeignKey: false, description: "E.g., Pendiente, Procesado, Enviado" }
    ]
  }
];

export const DATA_TYPES = [
  "INT",
  "BIGINT",
  "VARCHAR(50)",
  "VARCHAR(255)",
  "VARCHAR(MAX)",
  "CHAR(10)",
  "DECIMAL(10,2)",
  "FLOAT",
  "DATETIME",
  "DATE",
  "BOOLEAN",
  "TEXT",
  "UUID",
  "JSON"
];
