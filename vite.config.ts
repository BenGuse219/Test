import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      remix({
        ignoredRouteFiles: ["**/*.css"],
      }),
    ],
    // Fix module resolution for React in dev mode
    ssr: {
      noExternal: mode === 'production',
      // PDFKit has native binaries that cause issues with Vite SSR
      external: ['pdfkit', 'fontkit', 'png-js', 'brotli'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    define: {
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY),
    },
  };
});
