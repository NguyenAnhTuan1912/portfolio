import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        dir: "../build/public",
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.includes("index.css")) return "assets/style.css";
          return `$assets/${assetInfo.names[0]}`;
        },
      },
    },
  },
  assetsInclude: ["**/*.md"],
});
