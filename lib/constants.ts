export const DOMAIN_TOPICS: Record<string, string[]> = {
  java: ['Collections', 'Loops & Control Flow', 'OOP Concepts', 'Spring Beans / DI', 'Exception Handling'],
  python: ['Data Structures', 'OOP Concepts', 'Functions & Closures', 'Standard Libraries', 'File Handling'],
  react: ['Components & Props', 'Hooks', 'State Management', 'Routing', 'Performance Optimization'],
  ai_ml: ['Supervised Learning', 'Neural Networks', 'Data Preprocessing', 'Model Evaluation', 'NLP Basics'],
  devops: ['Docker & Containers', 'CI/CD Pipelines', 'Kubernetes', 'Linux & Shell', 'Cloud Basics'],
};

export const DOMAIN_ICONS: Record<string, string> = {
  java: '☕',
  python: '🐍',
  react: '⚛️',
  ai_ml: '🤖',
  devops: '🔧',
};

export const DOMAIN_LABELS: Record<string, string> = {
  java: 'Java',
  python: 'Python',
  react: 'React',
  ai_ml: 'AI / ML',
  devops: 'DevOps',
};

export const TOTAL_QUESTIONS = 8;
export const THINK_TIME = 15;
export const ANSWER_TIME = 90;
