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
    // Configure CORS for development
    cors: {
      origin: true,
      credentials: true,
    },
    // Add proxy to handle external requests that might cause CORS issues
    proxy: {
      "/api/posthog": {
        target: "https://us.i.posthog.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/posthog/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("PostHog proxy error:", err);
          });
        },
      },
    },
  },
  // Optimize build performance
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
