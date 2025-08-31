import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "app-domain": path.resolve(__dirname, "../../domain/dist"),
    },
  },
});
