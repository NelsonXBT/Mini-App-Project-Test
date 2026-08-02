export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramWebApp {
  version: string;
  platform: string;

  colorScheme?: string;

  isExpanded: boolean;

  viewportHeight?: number;
  viewportStableHeight?: number;

  initData: string;

  initDataUnsafe?: {
    user?: TelegramUser;
  };

  ready(): void;

  requestFullscreen?(): Promise<void>;

  exitFullscreen?(): Promise<void>;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};