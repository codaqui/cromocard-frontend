const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleButtonOptions {
  theme: 'outline' | 'filled_blue' | 'filled_black';
  size: 'large' | 'medium' | 'small';
  text: 'signin_with' | 'continue_with';
  shape: 'rectangular' | 'pill';
  locale: string;
  width?: number;
}

export interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptLoading: Promise<GoogleAccountsId> | null = null;

function readGoogleAccountsId(): GoogleAccountsId | undefined {
  return window.google?.accounts.id;
}

function injectScript(): Promise<GoogleAccountsId> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const accountsId = readGoogleAccountsId();
      if (accountsId) resolve(accountsId);
      else reject(new Error('Google Identity Services indisponível'));
    };
    script.onerror = () =>
      reject(new Error('Não foi possível carregar o Google Identity Services'));
    document.head.append(script);
  });
}

export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  const loaded = readGoogleAccountsId();
  if (loaded) return Promise.resolve(loaded);

  scriptLoading ??= injectScript().catch((error: unknown) => {
    scriptLoading = null;
    throw error;
  });
  return scriptLoading;
}
