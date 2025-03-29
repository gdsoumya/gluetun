import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 3000, // Specify your desired port here
  },
  base: "", // Empty string for relative paths during build
  plugins: [react()],
});
