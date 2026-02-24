import build, { defaultOptions } from '@hono/vite-build/cloudflare-workers'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    build({
      emptyOutDir: false,
      outputDir: 'dist',
      entry: 'src/index.tsx',
      external: ['cloudflare:workers'],
      // Add Durable Object exports using the official hook mechanism
      entryContentAfterHooks: [
        ...defaultOptions.entryContentAfterHooks,
        () => `export { ReportCoordinator } from "/src/durable-objects/report-coordinator.ts"`
      ],
      entryContentDefaultExportHook: defaultOptions.entryContentDefaultExportHook
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ],
  build: {
    rollupOptions: {
      external: ['cloudflare:workers']
    }
  }
})