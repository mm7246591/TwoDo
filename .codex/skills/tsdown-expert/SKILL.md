---
name: "tsdown-expert"
description: "處理以 tsdown 建置 TypeScript 與 JavaScript 函式庫的問題，包括 tsdown.config.*、entry 設定、型別宣告 `.d.ts` 產生、多格式輸出、package exports、自訂 plugins、publint 或 attw 驗證，以及從 tsup 遷移。當你在建置 library、調整輸出格式、產生型別、整理 package.json 發佈欄位，或問題明顯來自 tsdown / Rolldown 打包流程時使用。"
---

# tsdown 專家

以資深 JS/TS 函式庫工程師的方式工作，專注在 `tsdown` 驅動的 library bundling。先判斷任務是單一函式庫、多入口函式庫、monorepo 套件、瀏覽器導向 bundle、Node 套件，還是 `tsup` 遷移，再檢查 `package.json`、`tsdown.config.*`、`tsconfig*`、entry files 與實際失敗的 build 指令。

## 快速開始

- 先讀 `package.json`，確認 `tsdown`、`typescript`、publint、attw 與相關 plugins 是否存在。
- 先讀 `tsdown.config.*` 或 `package.json` 內的 `tsdown` 欄位，再決定要不要改 CLI scripts。
- 先確認專案目標是：
  - 只輸出 ESM
  - 同時輸出 ESM 與 CJS
  - 瀏覽器用的 IIFE 或 UMD
  - 產生 `.d.ts`
  - 自動維護 `exports` / `main` / `module` / `types`
  - 從 `tsup` 遷移
- 優先修正 entry、format、dts、deps、exports 或 package 欄位的根因，不要先用發佈後手動補檔的方式繞過。

## 工作流程

1. 先定位失敗層級。
   - `tsdown` CLI 執行失敗
   - `tsdown.config.*` 設定解析錯誤
   - bundle 輸出不符合預期
   - `.d.ts` 沒產生或內容錯誤
   - `package.json` 欄位與實際輸出不一致
   - `tsup` 遷移後設定仍帶著相容層寫法
2. 檢查最小必要檔案集合。
   - `package.json`
   - `tsdown.config.*`
   - `tsconfig.json` 與相關 `tsconfig*`
   - 入口檔與輸出目錄結構
   - 若有 plugin，檢查 Rolldown 或 unplugin 的 import 與設定
3. 套用對應檢查清單。
   - 基本打包：`entry`、`outDir`、`platform`、`target`、`clean`
   - 型別：`dts`、`typescript` 安裝狀態、`types` / `typings` 欄位
   - 輸出格式：`format`、多格式覆寫、不同環境目標
   - 依賴處理：`deps.neverBundle`、`deps.alwaysBundle`、`deps.onlyBundle`
   - 發佈欄位：`exports`、`main`、`module`、`types`
   - 驗證：publint、attw
   - 遷移：tsup 舊選項、插件系統差異、預設值差異
4. 先用最小可驗證的指令重跑。
   - `tsdown`
   - `tsdown --dts`
   - 指定 `--format`
   - 只驗證單一入口或單一套件
   - 需要時再補跑 publint 或 attw

## 判斷原則

- `tsdown` 是針對 library bundling，不要把 app bundling 的假設直接套進來。
- 如果輸出有問題，先分清楚是 entry 定義錯、format 不符、還是 package 欄位沒有同步。
- `.d.ts` 問題先檢查 `typescript` 是否安裝，以及 `dts` 是否真的被啟用。
- 如果 `package.json` 有 `types` 或 `typings`，tsdown 會預設啟用 declaration generation；不要重複假設它一定是關閉的。
- 若從 `tsup` 遷移後仍出錯，先找舊命名選項是否還存在，再評估是否只是在吃相容層警告。
- 多格式輸出要同時檢查檔名、package exports 與消費端載入方式，不能只看 `dist` 是否有檔案。

## tsup 遷移重點

- 預設值與 `tsup` 不同時，先明確化設定，不要依賴舊工具習慣。
- 舊寫法如 `entryPoints`、`publicDir`、`bundle: false`、`external`、`noExternal` 等，優先改成 tsdown 的正式選項。
- `tsup` 的 esbuild plugin 生態不能直接套進來；優先改成 Rolldown plugin 或 `unplugin` 的 `/rolldown` 入口。
- 若遷移後需要 bundle 分析、exports 自動生成或 package 驗證，優先用 tsdown 內建能力，而不是額外拼接不必要工具。

## 參考地圖

只在需要時讀取：

- `references/tsdown-reference.md`：涵蓋官方文件確認的 tsdown 核心能力、dts、output formats、auto exports、publint/attw 與 tsup 遷移要點。

## 輸出要求

- 用 library bundling 的語境說明問題，不要只說「build 壞了」。
- 明確指出問題在設定、輸出格式、型別產生、發佈欄位，還是 tsup 遷移殘留。
- 如果目前修法只是為了短期相容，補一句更乾淨的長期方案。
