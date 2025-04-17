import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite";

const conditionalPlugins = [];

if (process.env.TEMPO) {
  conditionalPlugins.push("tempo-devtools/dist/babel-plugin");
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [...conditionalPlugins],
      },
    }),
    tempo(), // Add the tempo plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@kitchen-ai/core": path.resolve(__dirname, "./packages/core/src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    // Allow all hosts when running in Tempo
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
