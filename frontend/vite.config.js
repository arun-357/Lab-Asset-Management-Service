import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    // helpful for code that expects process.env
    "process.env": {},
  },
});
