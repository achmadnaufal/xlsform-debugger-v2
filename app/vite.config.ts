import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode: _mode }) => ({
  base: "/xlsform/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    allowedHosts: ["tools.achmadnaufal.com"],
    proxy: {
      "/xlsform/convert": {
        target: "http://localhost:5050",
        rewrite: (path: string) => path.replace(/^\/xlsform/, ""),
      },
      "/xlsform/export": {
        target: "http://localhost:5050",
        rewrite: (path: string) => path.replace(/^\/xlsform/, ""),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Remap enketo monorepo paths to local node_modules
        importers: [
          {
            findFileUrl(url: string) {
              if (url.startsWith("/packages/enketo-core/node_modules/")) {
                const pkg = url.replace(
                  "/packages/enketo-core/node_modules/",
                  ""
                );
                const resolved = path.resolve(
                  __dirname,
                  "node_modules",
                  pkg
                );
                return new URL(`file://${resolved}`);
              }
              return null;
            },
          },
        ],
        silenceDeprecations: [
          "import",
          "global-builtin",
          "color-functions",
          "slash-div",
        ],
      },
    },
  },
  build: {
    rollupOptions: {
      external: ["leaflet.gridlayer.googlemutant"],
    },
  },
  resolve: {
    alias: {
      "leaflet.gridlayer.googlemutant": path.resolve(
        __dirname,
        "src/stubs/empty.ts"
      ),
      // enketo-core bare specifier aliases (from its browser field)
      "enketo/config": path.resolve(
        __dirname,
        "node_modules/enketo-core/config.js"
      ),
      "enketo/widgets": path.resolve(
        __dirname,
        "node_modules/enketo-core/src/js/widgets.js"
      ),
      "enketo/translator": path.resolve(
        __dirname,
        "node_modules/enketo-core/src/js/fake-translator.js"
      ),
      "enketo/dialog": path.resolve(
        __dirname,
        "node_modules/enketo-core/src/js/fake-dialog.js"
      ),
      "enketo/file-manager": path.resolve(
        __dirname,
        "node_modules/enketo-core/src/js/file-manager.js"
      ),
      "enketo/xpath-evaluator-binding": path.resolve(
        __dirname,
        "node_modules/enketo-core/src/js/xpath-evaluator-binding.js"
      ),
    },
  },
  optimizeDeps: {
    exclude: ["enketo-transformer/web"],
    include: ["enketo-core"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/utils/__tests__/setup.ts"],
    globals: true,
  },
}));
