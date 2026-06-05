// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const isNativeBuild = process.env.VITE_TARGET === "native";

export default defineConfig({
  plugins: [react()],

  // Web/Vercel necesita "/" para que /propiedades/ciudad/quito cargue assets bien.
  // Capacitor/native necesita "./" para funcionar correctamente con file://.
  base: isNativeBuild ? "./" : "/",

  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});