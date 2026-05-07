---
name: vue-spec-manager
description: 在新增、修改、重構或刪除 Vue 3 單檔元件（.vue）時，負責新增或更新檔案最底部的 spec lang="md" 區塊（SDD 規格書），並同步反映 props、emit、defineModel 與使用者可驗證的可見行為；同時遵守 spec 格式限制（條列為主、建議 15–30 行、避免在 spec 內出現含尖括號的型別語法）。
---

# Vue Spec Manager

管理 Vue 元件中的 `<spec lang="md">` 區塊（SDD 規格書），確保每次變更元件時「程式碼、型別、文件」一致。

## 核心規則

- 若元件無 spec 區塊，於檔案最底部（`<template>`、`<script>`、`<style>` 之後）新增。
- 若元件已有 spec 區塊，必須依本次變更同步更新，且以「可驗證行為」為描述重點。
- 建議流程：先更新 spec 內容，再進行元件實作（Spec-first）。

## 工作流程

1. 定位或新增 `<spec lang="md">` 區塊。
2. 對照本次變更範圍，更新 spec：
   - props（kebab-case）：列出關鍵 props 與用途。
   - emit：以「事件(參數)：用途」描述。
   - defineModel：列出模型名稱與用途。
   - 功能需求：以使用者視角描述「觸發 → 可見行為 → 狀態/事件」。
3. 檢查 spec 與程式碼是否一致（名稱、參數、行為與邊界）。

## SDD 規格書撰寫規則

- 精簡、可讀、以條列為主；避免段落與贅述。
- 只描述目的、對接口與可驗證的行為；不寫實作與樣式細節。
- 置於 `.vue` 檔最底部；修改元件前先更新 spec（SDD 流程）。
- 建議 15–30 行，最多不超過 40–50 行；超過應檢討拆分元件（遵循 ATOM 原則）。
- 只在 `.vue` 檔案中撰寫 `<spec lang="md">`；其餘檔案以 TSDoc 格式維護文件。

### 文字與語法注意事項

- 避免在 `<spec lang="md">` 內書寫含尖括號的型別語法（例如泛型或 Record 樣式），以免被 Vite/編譯器誤判為未閉合的 HTML 標籤並報錯。
- 若需描述資料結構，請用純文字描述（例如「selectedMap：key 為 property_type_id，value 為 option_id 或 null」）。

## spec 結構（建議）

- #### 1. 說明：1–2 行描述元件目的與應用場景。
- #### 2. 功能需求：主流程用 1) 2) 3) 描述「觸發 → 可見行為 → 狀態/事件」。
- #### 3. 對接口：props、emit、defineModel。
- #### 4. 實作方式（可選）
- #### 5. 模版結構（可選）
- #### 6. css 描述（可選）

## spec 範本

```md
<spec lang="md">
#### 1. 說明
- 1–2 行描述元件目的與應用場景。

#### 2. 功能需求
- 1) 觸發 → 可見行為 → 狀態/事件

#### 3. 對接口
- props：
- emit：
- defineModel：
</spec>
```
