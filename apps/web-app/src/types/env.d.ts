namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_ENV: string;
    NEXT_PUBLIC_WEB_APP_BASE_URL: string;
    NEXT_PUBLIC_BASE_URL: string;
    BASE_URL: string;

    AUTH_URL: string;
    AUTH_SECRET: string;

    BACKEND_API_URL: string;
    NEXT_PUBLIC_API_URL_BACKEND: string;
  }
}
