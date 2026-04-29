---
name: tsdoc-manager
description: 在完成程式碼修改後，若本回合有變更 `.ts` 檔，或變更 Vue 單檔元件內的 `script lang="ts"` 區塊，就使用此 skill 補寫與更新 TSDoc。適用於 composable、Pinia store、api、utils 與 Vue SFC script 內的 TypeScript 型別、變數、函式與模組摘要，並用 TSDoc 取代寬鬆的 JSDoc 寫法，同時避免和 `vue-spec-manager` 重複描述元件用途。
---

# TSDoc Manager

維護 TypeScript 與 Vue SFC `script lang="ts"` 區塊的 TSDoc，確保程式碼、型別與文件一致，且不把 TypeScript 註解寫回 JSDoc 舊風格。

## 核心定位

- 將 TSDoc 視為 TypeScript 的文件標準；將 JSDoc 視為較通用的 JavaScript 註解生態。
- 讓 TypeScript 型別負責型別資訊，讓 TSDoc 負責用途、行為、邊界、副作用與回傳語意。
- 與 `vue-spec-manager` 分工：
  - `.vue` 的元件用途、對外接口與可見行為由 `<spec lang="md">` 說明。
  - `script lang="ts"` 內的狀態、函式、型別、資料轉換與業務邏輯由 TSDoc 說明。

## JSDoc 與 TSDoc 差異

- 將 JSDoc 理解為通用註解慣例；將 TSDoc 理解為針對 TypeScript 文件註解的標準化規格。
- 優先使用 TSDoc 常用標籤：`@param`、`@returns`、`@remarks`、`@example`、`@see`、`@throws`、`@deprecated`、`@typeParam`。
- 不要把 JSDoc 型別語法帶進來：
  - 不要寫 `@param {string} id`
  - 不要寫 `@returns {Promise<void>}`
  - 不要寫 `Array.<T>` 或 `Object.<string, number>`
- 將型別留在 TypeScript 簽章；在註解中說明輸入限制、回傳意義、例外條件與副作用。
- 若現有註解是 JSDoc 風格，直接改為本 repo 使用的 TSDoc 風格，不要混用。

## 觸發時機

1. 完成程式碼修改後，檢查本回合是否動到 `.ts` 檔。
2. 檢查本回合是否動到含 `script lang="ts"` 的 `.vue`，且 script 區塊有實際變更。
3. 只要符合任一條件，就在回覆前補齊或更新 TSDoc。
4. 若本回合只改 `template`、`style`、純 JSON 或純常數資料，且沒有 TS 邏輯變更，不要硬加 TSDoc。

## 工作流程

1. 根據 diff 找出本回合實際改動的 `.ts` 檔與 `.vue` script 範圍。
2. 讀取既有 TSDoc 與對應型別、函式簽章，確認是否過期或缺漏。
3. 依檔案種類補寫：
   - `.vue` `script lang="ts"`：
     - 不寫檔案開頭的元件用途摘要。
     - 針對 script 內新增或修改的 `interface`、`type`、狀態 `const`、`computed`、映射資料、事件處理函式、資料轉換函式補 TSDoc。
   - `.ts`：
     - 在檔案開頭加上模組摘要，說明 composable、store、api、utils 或其他模組的責任。
     - 針對 exported 與本回合新增或修改的重要函式、變數、`interface`、`type`、`enum` 補 TSDoc。
4. 檢查註解是否與名稱、參數、回傳值、例外與副作用一致。
5. 避免把程式碼逐句翻譯成註解，只保留對開發者真的有用的訊息。

## 撰寫規則

- 摘要第一行用一句話說明用途，使用現在式。
- 需要更多背景時才加 `@remarks`。
- 函式有參數時使用 `@param`；只寫參數用途、限制與語意，不重複型別。
- 有回傳值時使用 `@returns`；說明回傳結果代表什麼。
- 只有真的會拋錯時才寫 `@throws`。
- 泛型參數需要補充語意時才寫 `@typeParam`。
- 非顯而易見的使用方式才寫 `@example`。
- 介面、型別別名、列舉、常數映射、狀態 ref、computed、store action、composable 對外 API 都要寫出用途。
- 不要為函式內部的一次性區域變數、迴圈索引或立即可懂的暫存值硬寫 TSDoc。
- 不要描述樣式、模板外觀或 `<spec lang="md">` 已經覆蓋的元件用途。

## 檔案類型規則

### Vue SFC

- 將註解集中在 `script lang="ts"` 內的型別與邏輯。
- 不要在 `<script setup>` 開頭重寫「此元件是做什麼的」。
- 若有 `defineProps`、`defineEmits`、`defineModel` 搭配輔助函式或轉換邏輯，優先說明其行為邊界與資料意義。
- 若本回合只更新 spec 或 template，不補 TSDoc。

### Composable

- 檔案開頭摘要要說明 composable 管理的流程、輸入來源與輸出 API。
- 回傳給外部使用的狀態、computed、操作函式要有 TSDoc。
- 若某函式依賴特定 store action 或外部流程，可在 `@remarks` 補充前置條件。

### Pinia Store

- 檔案開頭摘要要說明 store 管理的資料域與主要責任。
- state、getters 或 computed、actions、資料映射 helper 都要補 TSDoc。
- 若某 action 會觸發 API、同步多個 state 或改寫流程節點，要明確說明副作用。

### API / Utils

- 檔案開頭摘要要說明模組責任與適用場景。
- 每個 exported helper 都要說明輸入、回傳、轉換規則與錯誤條件。
- 純常數表若會被外部引用，也要說明資料用途。

## 交付檢查

- 確認沒有出現 JSDoc 型別大括號寫法。
- 確認註解沒有與實作矛盾。
- 確認 `.vue` 沒有把元件用途重複寫進 script TSDoc。
- 需要具體樣板時，讀取 `references/tsdoc-patterns.md`。
