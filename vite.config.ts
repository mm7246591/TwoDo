import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'vue-spec-plugin',
      enforce: 'pre', // 在其他外掛程式之前執行
      transform(_code, id) {
        // 只處理 .vue 檔案中的 spec 區塊
        if (/\.vue\?vue&type=spec(?:&|$)/.test(id)) {
          return { code: 'export default {};', map: null };
        }
        return null;
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
