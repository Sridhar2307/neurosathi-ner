import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Custom plugin to inject built asset paths directly into dist/sw.js
function pwaAssetsPlugin() {
  return {
    name: 'pwa-assets-plugin',
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist')
        const swPath = path.join(distDir, 'sw.js')
        const assetsDir = path.join(distDir, 'assets')

        if (!fs.existsSync(swPath) || !fs.existsSync(assetsDir)) return

        const assetFiles = fs.readdirSync(assetsDir)
          .filter(f => f.endsWith('.js') || f.endsWith('.css'))
          .map(f => `/assets/${f}`)

        let swContent = fs.readFileSync(swPath, 'utf8')
        const injection = assetFiles.map(a => `  ${JSON.stringify(a)}`).join(',\n')
        
        swContent = swContent.replace(
          '/* INJECT_PROD_ASSETS */',
          injection ? `${injection},` : ''
        )

        fs.writeFileSync(swPath, swContent, 'utf8')
        console.log(`[PWA Plugin] Precached ${assetFiles.length} production bundle assets in dist/sw.js`)
      } catch (err) {
        console.warn('[PWA Plugin] Warning during sw.js asset injection:', err)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwaAssetsPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  }
})
