export enum ClientEnvVar {
  BACKEND_URL = "VITE_BACKEND_URL",
  FIREBASE_API_KEY = "VITE_FIREBASE_API_KEY",
  FIREBASE_AUTH_DOMAIN = "VITE_FIREBASE_AUTH_DOMAIN",
  FIREBASE_PROJECT_ID = "VITE_FIREBASE_PROJECT_ID",
  DEFAULT_THEME = "VITE_DEFAULT_THEME",
}

export const DEFAULT_CLIENT_ENV = {
  BACKEND_URL: "http://localhost:4000",
  DEFAULT_THEME: "aurora",
} as const;

const readEnv = (key: ClientEnvVar) => import.meta.env[key];

export const clientEnv = Object.freeze({
  backendUrl:
    readEnv(ClientEnvVar.BACKEND_URL) || DEFAULT_CLIENT_ENV.BACKEND_URL,
  defaultTheme:
    readEnv(ClientEnvVar.DEFAULT_THEME) || DEFAULT_CLIENT_ENV.DEFAULT_THEME,
  firebase: {
    apiKey: readEnv(ClientEnvVar.FIREBASE_API_KEY),
    authDomain: readEnv(ClientEnvVar.FIREBASE_AUTH_DOMAIN),
    projectId: readEnv(ClientEnvVar.FIREBASE_PROJECT_ID),
  },
});
