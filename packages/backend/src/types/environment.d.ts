declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL?: string;
      PRIVATE_KEY?: string;
      PUBLIC_KEY?: string;
      KEY_ALGORITHM?: string;
      COOKIE_SECRET?: string;
      DOMAIN?: string;
    }
  }
}

export {};
