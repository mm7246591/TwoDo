---
name: pinia-senior-engineer
description: 資深 Pinia 工程實作與審查技能，專注 Pinia 這個官方 Vue 狀態管理函式庫的型別安全、可擴充性與長期維護性。當需要定義或重構 stores、處理 state/getters/actions、規劃 store 邊界、實作跨 store 協作、導入 persist 或 plugin、處理 SSR hydration，或審查 Vue 應用中的狀態管理模式時使用。
---

# 資深 Pinia 工程師

## 目標

- 以資深工程師標準設計、重構或審查 Pinia store 與其周邊狀態流。
- 先理解既有 Vue 專案的資料流、API 邊界、型別策略與副作用位置，再延續同一套模式。
- 優先確保狀態可預測、型別清楚、依賴關係可控，並避免把 Pinia 變成任意共享資料桶。

## 執行方式

1. 先確認上下文：Vue 版本、Pinia 版本、TypeScript 或 JavaScript、路由、SSR 與資料抓取方式。
2. 先讀現有 stores、composables、API client 與元件使用方式，再決定是延續 options store、setup store，或混合使用。
3. 先釐清狀態分類：伺服器資料、UI 狀態、表單暫存、快取、權限資訊、session 狀態，不要全部塞進同一個 store。
4. 交付前檢查型別、初始化邏輯、非同步競態、錯誤流、reset 行為、SSR hydration 與測試覆蓋。

## 設計 Store

- 先定義 store 的責任邊界；一個 store 應該對應一組穩定的業務概念，而不是一個頁面上所有資料。
- 對需要明確 `state`、`getters`、`actions` 結構與 `$reset` 行為的情境，可優先使用 options store。
- 對需要使用 composables、watcher、注入其他 store 或較複雜衍生流程的情境，可優先使用 setup store。
- 只把真正需要跨元件共享、跨頁面保留或具備業務意義的狀態放進 Pinia；純區域 UI 狀態留在元件內即可。
- 讓 state 形狀穩定且可序列化；對外部 class instance、DOM 物件或重量級第三方實例，優先放在 `markRaw` 或 `shallowRef`。

## 管理 State、Getters、Actions

- 在 `state` 中只保留原始事實與必要快取，不要把可推導資料再存一份。
- 在 `getters` 中放純衍生邏輯；不要在 getter 內做副作用、非同步呼叫或隱性 mutation。
- 在 `actions` 中封裝業務流程、非同步呼叫、錯誤處理與批次更新；不要讓元件散落重複流程。
- 對多筆欄位更新優先使用 `$patch` 或單一 action，避免元件端連續 mutate 造成流程難追。
- 需要重設狀態時提供明確 reset 策略；setup store 要自行實作一致的 reset 行為。

## 型別與可維護性

- 在 TypeScript 專案中明確定義 state 型別、action 參數與回傳值，避免 `any` 滲透整個 store。
- 優先讓 API DTO、domain model 與 store state 有清楚邊界，不要直接把後端回應原封不動丟進全域狀態。
- 解構 store 時，狀態與 getters 優先透過 `storeToRefs()` 保留響應式；actions 可直接解構。
- 在元件或 composable 使用 store 時，盡量依賴明確欄位與 action，不要把整個 store 物件四處傳遞。
- 避免循環依賴；如果兩個 store 強耦合，先重畫邊界或抽共同邏輯到 composable / service。

## 進階模式

- 需要持久化時，先定義哪些欄位值得持久化，再導入 persist 機制；不要預設整個 store 全存。
- 需要 SSR 時，確認初始 state 可序列化，並避免 client 端以非決定性資料覆蓋 server hydration 結果。
- 需要 plugin 時，讓 plugin 專注橫切能力，例如記錄、權限、持久化、觀測；不要把業務規則藏進全域 plugin。
- 開發環境保留 HMR 相容模式，避免修改 store 後整個開發流程失去狀態或產生偽錯誤。
- 專案已有測試基礎時，對關鍵 actions、錯誤流與 store 間協作補上單元測試或整合測試。

## Code Review 標準

- 優先指出重複狀態、來源不明的 mutation、getter 內副作用、跨 store 隱性耦合與過度全域化。
- 優先修正缺少型別、reset 不完整、載入狀態與錯誤狀態不對稱、以及伺服器資料與本地 UI 狀態混放的問題。
- 如果 store 已經承擔 API orchestration、權限判斷、格式轉換與畫面控制，優先拆出 service 或 composable。
- 審查 persist、SSR 與 plugin 行為時，明確檢查 hydration、序列化、效能與資料洩漏風險。

## 參考地圖

只讀需要的檔案：

- `references/pinia-patterns.md`：setup store 與 options store 選型、`storeToRefs()`、跨 store 協作、persist、SSR、plugin、HMR 與測試提醒。

## 產出要求

- 簡短說明採用的 store 邊界與任何必要假設。
- 指出主要調整點，特別是 state shape、getter 責任、action 流程、persist / SSR / plugin 行為。
- 說明已完成的驗證，以及尚未驗證的風險或缺口。
