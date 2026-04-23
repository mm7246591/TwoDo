# Vite 8 參考

當任務涉及 Vite 8 行為、自訂 plugins、library build、SSR 或 Rolldown 遷移時，讀這份檔案。如果使用者要求最新行為，或問題看起來明顯與版本有關，請重新核對官方 Vite 文件。

## 官方文件

- v7 遷移指南：`https://vite.dev/guide/migration`
- Plugin API：`https://vite.dev/guide/api-plugin.html`
- SSR 指南：`https://vite.dev/guide/ssr.html`
- Build 指南：`https://vite.dev/guide/build`
- 共用設定選項：`https://vite.dev/config/shared-options.html`

## 已由官方文件確認的核心事實

- Vite 8 的核心流程改用 Rolldown 與 Oxc 系工具，而不是 Rollup 與 esbuild。
- dependency optimizer 現在使用 Rolldown。`optimizeDeps.esbuildOptions` 仍會為了相容性自動轉換，但已被棄用，應優先改用 `optimizeDeps.rolldownOptions`。
- `build.rollupOptions` 已被 `build.rolldownOptions` 取代。
- `worker.rollupOptions` 已被 `worker.rolldownOptions` 取代。
- `build.commonjsOptions` 在 Vite 8 中已經沒有作用。
- `resolve.alias[].customResolver` 已棄用；改用自訂 plugin 搭配 `resolveId` 與 `enforce: 'pre'`。

## 遷移排查

當 repo 要升級到 Vite 8 時：

1. 先確認 `package.json` 與 lockfile 中實際安裝的是哪個 Vite 套件與版本。
2. 如果 repo 使用 `rolldown-vite`，先改回正式的 `vite`。
3. 搜尋 `rollupOptions`、`commonjsOptions`、`optimizeDeps.esbuildOptions` 與自訂 plugin hooks。
4. 確認失敗發生在哪裡：
   - dev 階段的 dependency optimization
   - plugin 的 transform/load/resolve
   - 正式 bundle 產生
   - SSR runtime
5. 優先把設定改成 Vite 8 的正式名稱，不要依賴相容性別名。

## Plugin 開發注意事項

- Vite plugins 是在 Rolldown plugin 介面上再加上 Vite 專屬 hooks。
- Dev server 會建立 plugin container，呼叫像 `resolveId`、`load`、`transform` 這類通用 build hooks。
- `moduleParsed` 在 dev 階段不會被呼叫。
- 除了 `closeBundle` 之外，輸出產生相關 hooks 在 dev 階段不會被呼叫。
- 能回傳 partial config 時就用 `config` 回傳；只有合併機制無法表達時才直接 mutate。
- 用 `configResolved` 取得最終解析後的 config，供後續 hooks 使用。
- 如果一個 plugin 只需要標準 bundler hooks，優先維持與 Rolldown 相容的命名與行為。

## Virtual module 提醒

- 內部 virtual ids 在 resolve 後應使用 `\0` 前綴。
- 在 dev 模式下，這些 ids 會被編碼成 `/@id/__x00__...` 給瀏覽器使用，並在進入 plugin hooks 前解碼。
- 如果某個 submodule 是直接從真實檔案衍生而來，且 sourcemap 需要回指原始檔案，就不要使用 `\0`。

## Vite 8 plugin 遷移陷阱

- 如果 `load` 或 `transform` hook 會把非 JS 模組轉成 JavaScript，必要時要回傳 `moduleType: 'js'`。
- 對 JS API 使用者來說，`build()` 現在會丟出 `BundleError`；要查看聚合錯誤時請讀 `.errors`。
- 在 Rolldown 下，一些 Rollup 時代的假設已不再成立：
  - 不能直接指定 `bundle[foo]`；改用 `this.emitFile()`
  - `bundle` 參考在不同 hooks 間的共享方式已不同
  - `structuredClone(bundle)` 可能失敗；先 clone 淺拷貝
  - 原本的 parallel hooks 會以 sequential 方式運作
- Vite 文件特別點出的 Rolldown 缺漏或不支援功能包括：
  - `build.rollupOptions.output.format: 'system'`
  - `build.rollupOptions.output.format: 'amd'`
  - `shouldTransformCachedModule`
  - `resolveImportMeta`
  - `renderDynamicImport`
  - `resolveFileUrl`

## Library mode 檢查點

- library entrypoints 要用 `build.lib`。
- 除非是刻意要打進 bundle，否則像 `react`、`vue` 這類框架依賴通常要 externalize。
- 改完輸出形狀後，重新檢查 `package.json` 的 `exports`、`main`、`module` 與 `types`。
- 如果 CSS 輸出很重要，要確認樣式如何輸出、以及下游應用如何消費。
- 分清楚 demo app 的問題與可發佈 library 輸出的問題。

## SSR 檢查點

- 原生 Vite SSR 是低階 API；先看自訂 server 與各 entrypoints。
- 建議的 dev 設定是使用 middleware mode 並搭配 `appType: 'custom'`。
- 標準 SSR 開發流程會用到：
  - `vite.transformIndexHtml(url, template)`
  - `vite.ssrLoadModule('/src/entry-server.*')`
  - 開發錯誤回報時使用 `vite.ssrFixStacktrace(error)`
- 標準正式環境流程會用到：
  - client build 加上 SSR build
  - `vite build --ssr <entry>`
  - 以 `import('./dist/server/entry-server.js')` 取代 `ssrLoadModule`
- 共用程式碼中，`import.meta.env.SSR` 是標準分支點。
- SSR 預設會把依賴 externalize；如果某些套件必須走 Vite transform，加入 `ssr.noExternal`。
- linked dependencies 預設不會 externalize；如果你要把它們視為外部依賴，使用 `ssr.external`。
- 如果 alias 是把一個套件轉到另一個套件，externalized SSR dependencies 可能需要在套件管理器層 alias 到真正的 `node_modules` 套件。
- 具備 SSR 感知能力的 plugins 應在 `resolveId`、`load` 或 `transform` 檢查 `options?.ssr`。
- 如果需要 preload directives 或框架層資產追蹤，在 client build 使用 `--ssrManifest`。

## 優先檢查的設定熱點

- `resolve.alias`
- `resolve.conditions`
- `resolve.preserveSymlinks`
- `resolve.tsconfigPaths`
- `define`
- `envPrefix`
- `server.fs`
- `optimizeDeps.include` / `exclude`
- `optimizeDeps.rolldownOptions`
- `build.target`
- `build.rolldownOptions`
- `ssr.target`
- `ssr.noExternal`
- `ssr.external`

## 實務規則

永遠先定位失敗層級：config resolution、dependency optimization、source transform、bundle generation，還是 SSR runtime。只要先把失敗放回正確層級，多數 Vite 問題都會明顯變好查。
