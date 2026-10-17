interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEV_ACCESS_TOKEN?: string;
}

interface Window {
  __ENV__?: {
    API_URL?: string;
  };
}
