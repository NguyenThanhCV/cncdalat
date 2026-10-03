import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.VITE_PORT);
  const previewPort = Number(env.VITE_PREVIEW_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("VITE_PORT must be set to a valid port in the admin .env file.");
  }
  if (!Number.isInteger(previewPort) || previewPort < 1 || previewPort > 65535) {
    throw new Error("VITE_PREVIEW_PORT must be set to a valid port in the admin .env file.");
  }

  return {
    plugins: [react()],
    server: { host: env.VITE_HOST, port, strictPort: true },
    preview: { host: env.VITE_HOST, port: previewPort, strictPort: true },
  };
});
