import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxies /api to your backend in dev, so you avoid CORS issues.
    // Change the port to match your backend.
    proxy: { "/api": "http://localhost:5000" },
  },
});
