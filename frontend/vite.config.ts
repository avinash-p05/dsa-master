import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Override when 8080 is taken by another local project, e.g. BACKEND_URL=http://localhost:8090
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

// In development, Vite serves the SPA on :5173 and proxies backend paths to
// Spring Boot on :8080. The Host header is kept (no changeOrigin), so Spring
// builds OAuth redirect URIs for localhost:5173 and cookies stay first-party.
// In production, the built files are served by Spring Boot itself.
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": BACKEND,
      "/oauth2": BACKEND,
      "/login/oauth2": BACKEND,
      "/actuator": BACKEND,
    },
  },
});
