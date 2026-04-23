---
name: "vite-expert"
description: "處理 Vite 專案問題，包括 vite.config.ts/js、開發或建置失敗、alias 與 env/mode 行為、自訂 Vite plugins、library mode、SSR client/server 建置，以及 Vite 8 Rolldown 遷移。當你在處理 Vite 應用、函式庫、plugins、框架整合，或問題很可能源自 Vite 設定、plugin hooks、依賴最佳化或建置流程時使用。"
---

# Vite Expert

以資深 Vite 工程師的方式工作。先判斷這個 repo 是 Vite 應用、函式庫、SSR 專案、自訂 plugin，還是框架整合。編輯前先檢查 `package.json`、`vite.config.*`、相關 `tsconfig*`、關鍵 entrypoints，以及實際失敗的指令或錯誤訊息。

## 快速開始

- 先讀 `package.json`，確認 Vite 版本、plugin 套件、scripts 與套件管理器。
- 在改動行為前，先讀 `vite.config.*` 與它引用的 config helpers。
- 先把任務歸類成：app config、library build、plugin 開發、SSR、或 Vite 8 遷移。
- 優先修正設定、plugin 順序、模組解析或 build 設定的根因，不要先做一次性的繞路修補。
- 如果問題依賴最新的 Vite 行為，先對照官方文件確認。

## 工作流程

1. 先確認故障發生在哪一層。
   - `vite dev`
   - `vite build`
   - `vite preview`
   - SSR 開發伺服器或 SSR 正式環境執行期
   - library 輸出或發佈後的套件形狀
   - plugin 的 resolve/load/transform 行為
2. 只檢查最小且必要的檔案集合。
   - `package.json`
   - `vite.config.*`
   - `tsconfig*`
   - 框架設定或包在 Vite 外層的封裝
   - SSR server entry、client entry 與 SSR entry
   - 如果問題在自訂 plugin，就讀 plugin 原始碼
3. 套用對應的檢查清單。
   - Config：`root`、`base`、`resolve.alias`、`define`、`envPrefix`、`server`、`preview`、`optimizeDeps`、CSS 選項、靜態資產處理與 build 選項。
   - Build/library：`build.lib`、external dependencies、輸出格式、套件 `exports`、CSS 輸出與型別 entrypoints。
   - Plugin：`enforce`、`apply`、include/exclude filters、virtual modules、hook 順序、dev/build 一致性，以及 SSR 感知轉換。
   - SSR：middleware mode、`transformIndexHtml`、`ssrLoadModule`、`import.meta.env.SSR`、`ssr.noExternal`、`ssr.external`、manifest 產生，以及 client/server 分離。
   - Migration：Rolldown 相容性、已棄用的 `rollupOptions` 別名、dependency optimizer 變更，以及不支援的 hooks 或輸出格式。
4. 先用最小但有意義的指令驗證。
   - 迭代時只重跑失敗的那個指令。
   - 如果修到共用設定，能跑的話就同時驗證 `vite dev` 和 `vite build`。
   - SSR 要把開發與正式環境分開驗證。

## 判斷原則

- `optimizeDeps` 問題通常出現在 dev 啟動或依賴預打包階段，不是在正式 bundle 輸出。
- `build.rolldownOptions` 影響的是建置輸出，不是一般開發時的 transform。
- 如果一個 plugin 只用了標準 bundler hooks，通常更適合被視為 Rolldown 相容 plugin，而不是 Vite-only plugin。
- SSR 問題常見根因是 client/server 程式碼混用、錯誤的 externalization，或 alias 在 externalized dependency resolution 中失效。
- 如果某套件在 client build 正常、SSR 卻失敗，先檢查 `ssr.noExternal`、`ssr.external`、套件 exports conditions 與 runtime target，再決定要不要修應用程式碼。
- 在還沒定位問題是 dev transform、dependency optimization、正式 bundle，或 SSR runtime 之前，不要先用鎖版本當成主要解法。

## Vite 8 重點

- 預設 Vite 8 的核心流程使用的是 Rolldown 與 Oxc，而不是 Rollup 與 esbuild。
- 編輯設定時，把 `optimizeDeps.esbuildOptions` 視為舊版相容層，優先改成 `optimizeDeps.rolldownOptions`。
- 先審查自訂 plugins 是否與 Rolldown 相容，再去懷疑 app 程式碼。
- 如果專案過去使用 `rolldown-vite`，先把依賴切回正式的 `vite`，再處理剩餘相容性問題。

## 參考地圖

只讀需要的檔案：

- `references/vite-8-reference.md`：Vite 8、Rolldown 遷移、plugin API、library mode 與 SSR 提醒。

## 輸出要求

- 用 Vite 的語境解釋根因，不要只用框架層語言描述。
- 明確指出修正是只影響 dev、只影響 build、只影響 SSR，還是跨層影響。
- 如果目前採用的是暫時性的相容性補丁，要說明更乾淨的長期解法是什麼。
