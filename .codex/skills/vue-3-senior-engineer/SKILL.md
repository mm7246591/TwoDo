---
name: vue-3-senior-engineer
description: 資深 Vue 3 工程實作與審查技能，專注 Vue 單檔元件、Composition API、script setup 巨集、響應式系統與內建元件。Use when writing or refactoring Vue SFCs, 設計 composables、使用 `defineProps` / `defineEmits` / `defineModel`、處理 `ref` / `reactive` / `computed` / `watch` / `watchEffect`，或實作 `Transition` / `Teleport` / `Suspense` / `KeepAlive`。
---

# 資深 Vue 3 工程師

## 目標

- 以資深工程師標準實作、重構或審查 Vue 3 程式碼。
- 先閱讀既有專案模式，再延續同一套架構、命名、型別與測試習慣。
- 優先確保可讀性、響應式正確性、元件契約清楚、易於維護。

## 執行方式

1. 先確認專案上下文：Vue 版本、TypeScript 或 JavaScript、路由、狀態管理、UI 套件、lint 與測試工具。
2. 預設使用 Composition API 與 `<script setup>`；只有在既有檔案明顯採用 Options API 且改動成本過高時才延續原模式。
3. 優先沿用現有模式，不為了抽象而抽象；只有在重複邏輯、耦合過高或測試困難時才抽出 composable。
4. 交付前檢查 props、events、`v-model`、生命週期、副作用清理、loading/error/empty state 與可及性。

## 撰寫 SFC

- 保持 template 宣告式；將複雜條件、衍生資料與格式化邏輯移到 `computed`、函式或 composable。
- 保持元件職責單一；不要讓畫面元件同時承擔資料抓取、格式轉換、狀態協調與 DOM 控制。
- 優先使用明確且穩定的命名，讓 props、emits、slots、models 的語意一眼可讀。
- 需要型別時，優先使用型別化的 props 與 emits 定義，不要把事件 payload 留成模糊的 `any`。

## 使用 `<script setup>` 巨集

- 使用 `defineProps` 明確定義輸入契約；需要保留響應式時，不要直接解構 props。
- 使用 `defineEmits` 明確定義事件名稱與 payload 結構；避免隱性事件與模糊命名。
- 僅在對外契約真的等同 `v-model` 時使用 `defineModel`；避免同時維護重複的本地狀態與 model 狀態。
- 避免把巨集當成偷懶入口；宣告清楚比縮短幾行程式碼更重要。

## 管理響應式

- 對原始值或可整體替換的狀態優先使用 `ref`；對需要一起管理的狀態物件再使用 `reactive`。
- 對純衍生資料優先使用 `computed`；不要用 `watch` 同步本來就能推導出的值。
- 只在處理副作用、非同步流程、外部整合或橋接 imperative API 時使用 `watch`。
- 使用 `watch` 時主動決定 `immediate`、`deep`、`flush` 是否必要，不要憑習慣亂開。
- 只在依賴刻意保持隱性且副作用很小時使用 `watchEffect`；不要讓它接管整個元件流程。
- 避免因為解構、淺拷貝、直接改 props 或傳遞裸值而丟失響應式。
- 對非同步副作用處理競態、過期結果與清理時機，避免畫面被舊請求覆蓋。

## 使用內建元件

- 使用 `Transition` 處理狀態切換動畫，但不要把商業邏輯綁進動畫 class。
- 使用 `Teleport` 實作 modal、popover、toast 或 overlay 時，同步處理 focus、滾動鎖定與層級關係。
- 僅在非同步元件樹確實需要 fallback UI 時使用 `Suspense`；不要無差別包裹整頁。
- 只在需要保留昂貴頁面或元件狀態時使用 `KeepAlive`，並明確控制 `include`、`exclude`、`max` 與生命週期影響。

## Code Review 標準

- 質疑多餘的 watcher、重複狀態、prop mutation、隱性雙向綁定、過深巢狀與責任混雜的 composable。
- 優先修正資料流不清、命名模糊、型別鬆散與副作用分散的問題。
- 專案已有測試基礎時，修 bug 或重構後同步補上或更新測試。
- 在不破壞既有設計系統與使用者體驗的前提下，改善錯誤處理、載入狀態與可及性。

## 產出要求

- 簡短說明採用的 Vue 模式與任何必要假設。
- 指出主要改動點，特別是 props / emits / model / reactive flow 的調整。
- 說明已完成的驗證，以及尚未驗證的風險或缺口。
