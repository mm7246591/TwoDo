# 專案規範

## 概要

本專案是以 Vite + Vue 3 + TypeScript + TailwindCSS 所建構的專案。

## 行為準則

- 一律使用繁體中文進行回答。
- 每次開始執行時，都使用`conversation-task-journal` Skills 記錄任務執行的順序與細節。
- 在每次程式碼改動完成之後，都需要使用 `code-change-reason-reporter` Skills 告知使用者改動的內容與原因。
- 在每次程式碼改動完成之後，若本回合有修改 `.ts` 檔，或修改 `.vue` 的 `script lang="ts"` 區塊，必須使用 `tsdoc-manager` Skills 補寫或更新 TSDoc。
- 如果沒有要求，務必不要寫出防禦性代碼。
- Spec-first 原則：修改或新增 `.vue` 前，需先確認是否包含 `<spec lang="md">`；若有，先依現有 spec 了解元件狀況並優先更新 spec，確認需求與介面後再實作；若無，先撰寫並確認具體 spec，經討論定稿後再依 spec 開發。
- 撰寫 Spec 時，遵守 SDD 規格書撰寫規則。

- 一律將型別與程式碼共置，使用 TypeScript 確保型別安全；定義型別時優先使用 interface 而非 type
- 務必使用 interface 定義型別；type 僅能用於純常數或無法以 interface 表達的 union，嚴禁透過 `as` 強制指定型別
- 不要寫測試
- 除非遇到無法解決的複合樣式，否則一律使用 TailwindCSS 類別而非手寫 CSS；
- 顏色的色碼必須參考`src/assets/theme/color-variables.scss`, `src/assets/theme/theme-tokens`
- 一律優先使用具名匯出（named exports），避免預設匯出（default export）
- 文件同步規則：任何改動（包含函式簽章、回傳型別、欄位名稱或行為）都必須同步更新相對應的文件與註解，包含（但不限於）TSDoc、介面/型別註解、使用範例、.vue 的 `<spec lang="md">`。提交前請自我檢查，確保「程式碼、型別、文件」三者一致；不得出現註解與實作不一致的情況。
- 避免在 `<spec lang="md">` 內書寫含尖括號的型別語法（例如泛型或 Record 樣式），以免被 Vite/編譯器誤判為未閉合的 HTML 標籤並報錯。除非需求明確要求，否則在 spec 中以純文字描述資料結構（例如「selectedMap：key 為 property_type_id，value 為 option_id 或 null」），不要出現 `<` 或 `>`。
- composable 不要寫入生命週期

## 快速指令

- `npm run dev`：啟動本機開發伺服器。
- `npm run build`：先跑 `vue-tsc`，再輸出正式版到 `dist/`。
- `npm run preview`：預覽 build 結果。
- `npm run test:unit`：啟動 Vitest。
- `npm run test:unit -- --coverage`：產生文字、HTML、JSON coverage 報表。
- `npm run lint`：以專案的 `eslint.config.mjs` 自動修正可修復問題。

## SDD 規格書撰寫規則

- 精簡、可讀、以條列為主；避免段落與贅述。
- 只描述目的、對接口與可驗證的行為；不寫實作與樣式細節。
- 置於 .vue 檔最底部；修改元件前先更新 spec（SDD 流程）。。
- 建議 15–30 行，最多不超過 40–50 行；超過應檢討拆分元件（遵循 ATOM 原則）
- 優先撰寫 spec 以利於確認需求，確認無誤之後再行開發
- 每次改動程式碼，都應該先更新`<spec lang="md">`區塊，避免造成版本誤差
- 只在 `.vue` 檔案中撰寫 `<spec lang="md">` ，其餘的檔案以 `TSdoc` 格式撰寫
- 可選欄位在與開發者確認後再撰寫

### 文字與語法注意事項（補充）

- 避免在 `<spec lang="md">` 內書寫含尖括號的型別語法（例如泛型或 Record 樣式），以免被 Vite/編譯器誤判為未閉合的 HTML 標籤並報錯。除非需求明確要求，否則在 spec 中以純文字描述資料結構（例如「selectedMap：key 為 property_type_id，value 為 option_id 或 null」），不要出現 `<` 或 `>`。

### 格式結構

#### 1. 說明

- 1–2 行描述元件目的與應用場景。

#### 2. 功能需求

- 描述「使用者操作與輸入/輸出的過程與結果」而非內部實作細節
- 主流程若有先後順序，用 1) 2) 3) 編號描述「觸發 → 可見行為 → 狀態/事件」
- 替代流程（A1/A2…）與例外/邊界（必要時補充）

#### 3. 對接口

- props：以「名稱：用途」方式列出關鍵 props（用 kebab-case 命名，簡短說明）
- emit：以「事件(參數)：用途」描述
- defineModel：列出模型名稱與用途

#### 4. 實作方式(可選)

- 以10-20行的內容進行重點描述

#### 5. 模版結構(可選)

- 描述 `template` 標籤內部的結構

#### 6. css 描述(可選)

- 描述 css 的使用，大部分都是用tailwind，但有些情況必須使用自訂的CSS實際得補充為什麼用
- 列出有用到哪些自訂theme的class
