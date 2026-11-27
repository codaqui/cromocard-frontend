interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface Window {
  __ENV__?: {
    API_URL?: string;
    WS_URL?: string;
    GOOGLE_CLIENT_ID?: string;
  };
}
