import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig(({ isSsrBuild }) => ({
  server: {
    port: 4500
  },
  build: {
    rollupOptions: isSsrBuild
      ? {
        input: "./server/app.ts",
      }
      : undefined,
  },
  plugins: [devtoolsJson(), tailwindcss(), reactRouter(), tsconfigPaths()],
}));
