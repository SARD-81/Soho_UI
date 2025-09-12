/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_LOGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
