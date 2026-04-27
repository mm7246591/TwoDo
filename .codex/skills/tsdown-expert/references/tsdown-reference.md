# tsdown 參考

當任務涉及 `tsdown`、JS/TS 函式庫打包、`.d.ts` 產生、多格式輸出、package exports、自訂 plugins 或 `tsup` 遷移時，讀這份檔案。若使用者要求最新資訊，或症狀明顯與版本相關，重新核對官方文件。

## 官方文件

- 首頁：`https://tsdown.dev/`
- Getting Started：`https://tsdown.dev/guide/getting-started`
- Config File：`https://tsdown.dev/options/config-file`
- Entry：`https://tsdown.dev/options/entry`
- Declaration Files：`https://tsdown.dev/options/dts`
- Output Format：`https://tsdown.dev/options/output-format`
- Package Exports：`https://tsdown.dev/options/package-exports`
- Package Validation：`https://tsdown.dev/options/lint`
- Migrate from tsup：`https://tsdown.dev/guide/migrate-from-tsup`
- Rolldown Options：`https://tsdown.dev/advanced/rolldown-options`

## 已由官方文件確認的核心事實

- `tsdown` 是由 Rolldown 與 Oxc 驅動的 TypeScript / JavaScript 函式庫打包工具。
- 它主打函式庫建置，不是通用 web app bundler。
- 官方明確強調與 `tsup` 主要選項與能力相容，並提供平滑遷移路徑。
- `tsdown` 支援 Rollup、Rolldown、unplugin plugins，以及部分 Vite plugins。

## 基本建置模型

- 建議以 `tsdown.config.*` 管理設定；複雜專案不要只靠 CLI 參數。
- 設定檔可使用：
  - `tsdown.config.ts`
  - `tsdown.config.mts`
  - `tsdown.config.cts`
  - `tsdown.config.js`
  - `tsdown.config.mjs`
  - `tsdown.config.cjs`
  - `tsdown.config.json`
  - `tsdown.config`
- 也可以把設定寫在 `package.json` 的 `tsdown` 欄位。
- 設定檔可以回傳單一設定，或回傳設定陣列以一次建多組輸出。

## entry 檢查點

- `entry` 可用字串、陣列或物件形式。
- 支援多入口與 glob patterns。
- 物件形式可透過 key 別名控制輸出檔名。
- 使用 glob 時可搭配 negation patterns 排除不該打包的檔案。
- 如果輸出檔名、結構或 entry 數量不對，先回頭看 `entry` 定義，而不是先改後處理腳本。

## 型別宣告 `.d.ts`

- `.d.ts` 對 TypeScript library 很重要。
- `tsdown` 透過 `rolldown-plugin-dts` 產生並打包 declaration files。
- 要正常產生 `.d.ts`，專案內必須安裝 `typescript`。
- 如果 `package.json` 已有 `types` 或 `typings` 欄位，tsdown 會預設啟用 declaration generation。
- 也可以用 CLI `--dts` 或在設定中寫 `dts: true` 明確開啟。
- 遇到 dts 問題時，先檢查：
  - `typescript` 是否安裝
  - `dts` 是否啟用
  - `types` / `typings` 是否與輸出路徑一致

## 輸出格式

- 預設輸出格式是 `esm`。
- 支援的格式包括：
  - `esm`
  - `cjs`
  - `iife`
  - `umd`
- 可以一次指定多個格式，例如同時輸出 `esm` 與 `cjs`。
- 不同 format 可以在設定檔中個別覆寫選項，例如不同 `target`。
- 多格式問題不要只看產物檔案，還要同時檢查 package 欄位與消費端載入方式。

## package exports 與發佈欄位

- `tsdown` 提供實驗性功能，可自動推斷並更新 `package.json` 的：
  - `exports`
  - `main`
  - `module`
  - `types`
- 用 `exports: true` 即可啟用。
- 官方提醒：發佈前要人工檢查自動生成欄位，或搭配 publint 驗證。
- 若要輸出所有檔案而不只 entry，可考慮 `exports.all`。

## package 驗證

- `tsdown` 可整合 publint 與 attw（Are the types wrong?）。
- publint 會檢查 `exports`、`main`、`module`、`types` 等欄位是否與實際輸出一致。
- attw 偏向型別正確性與 package 型別體驗檢查。
- 當 library 可以 build 但消費端有載入或型別問題時，應補跑這兩類驗證，而不是只看 bundler 成功。

## tsup 遷移重點

### 遷移命令

- 官方提供專用遷移命令：
  - `npx tsdown-migrate`
- monorepo 可對多個目錄或 glob 執行。
- 可用 `--dry-run` 先預覽變更。

### 預設值差異

- `format`
  - tsup：`cjs`
  - tsdown：`esm`
- `clean`
  - tsup：`false`
  - tsdown：`true`
- `dts`
  - tsup：`false`
  - tsdown：若 `package.json` 有 `types` 或 `typings` 會自動開啟
- `target`
  - tsdown 會從 `package.json` 的 `engines.node` 自動讀取

### 選項更名與相容層

- `cjsInterop` -> `cjsDefault`
- `esbuildPlugins` -> `plugins`
- 下列舊選項仍可能可用，但屬相容層並會警告，應盡快遷移：
  - `entryPoints` -> `entry`
  - `publicDir` -> `copy`
  - `bundle: false` -> `unbundle: true`
  - `removeNodeProtocol: true` -> `nodeProtocol: 'strip'`
  - `injectStyle: true` -> `css: { inject: true }`
  - `external: [...]` -> `deps: { neverBundle: [...] }`
  - `noExternal: [...]` -> `deps: { alwaysBundle: [...] }`
  - `skipNodeModulesBundle` -> `deps: { skipNodeModulesBundle: true }`

### 插件系統差異

- `tsdown` 使用 Rolldown plugins，不是 esbuild plugins。
- 如果是 `unplugin`，從 `tsup` 遷移時通常要把 import 從 `/esbuild` 改成 `/rolldown`。

### 不支援或行為不同

- `splitting: false`：無法關閉，code splitting 永遠開啟
- `metafile`：沒有這個選項，可考慮 `devtools: true`
- `swc`：不支援，tsdown 內建走 Oxc
- `experimentalDts`：已被 `dts` 取代
- `legacyOutput`：不支援
- tsup 實驗性 `plugins`：不相容，需改成 Rolldown plugins

### tsdown 新增能力

- `nodeProtocol`
- `workspace`
- `exports: true`
- `publint` / `attw`
- `exe`
- `devtools`
- `hooks`
- `css`

## Rolldown 客製化

- `tsdown` 以 Rolldown 為核心 bundling engine。
- 若內建選項不夠，可透過 Rolldown options 進一步客製，但要先理解覆寫後的副作用。
- 只有在 `tsdown` 自身設定不足以表達需求時，再往 Rolldown options 下探。

## 實務規則

先分清楚你在修哪一層：entry 定義、format、dts、deps、package exports、驗證，還是 `tsup` 遷移殘留。大多數 `tsdown` 問題只要先定位到正確層級，解法就會變得很直接。
