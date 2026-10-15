import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cho phép viết JSX trong cả file .js (ví dụ src/index.js) như cấu trúc dự án gốc
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: { loader: { ".js": "jsx" } },
  },
});
