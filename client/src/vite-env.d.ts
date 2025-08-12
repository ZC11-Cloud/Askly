/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  // 这里可以继续加其他 VITE_ 开头的环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
