# TwoDo 專案樣式規則

## 現有樣式層

- `src/assets/css/mobile-base.css`
  - 共享的 mobile shell primitive 與目前 app-wide token 所在位置。
  - 適合放可重用的 `app-*` class。
  - 不適合放只屬於單一頁面的裝飾性樣式。
- `tailwind.config.js`
  - 目前配置很精簡。
  - 除非某個 token 很明確屬於跨多個畫面的共享層，否則維持精簡。
- `src/views/HomeView.vue`
  - 展示 Tailwind 負責版面，搭配共享 `app-*` primitive 的例子。
- `src/views/user/RegisterView.vue`
  - 展示驗證畫面如何結合共享 primitive 與局部畫面 utility 的例子。

## 建議的樣式處理順序

1. 當既有 `app-*` primitive 已經符合需求時，優先重用。
2. 結構與間距優先使用 Tailwind utilities。
3. 局部視覺與局部 token 放進元件內的 scoped CSS 或 SCSS。
4. 只有在重用真的成立後，才提升到 `mobile-base.css`。
5. 只有在 token 廣泛共享且穩定後，才提升到 `tailwind.config.js`。

## 主題策略

- 在引入新色系之前，先以現有 app palette family 為預設。
- 當變更只屬於單一路由或單一元件時，把新色 token 定義在局部。
- 優先使用與用途綁定的語意化 token 名稱：
  - `--screen-accent`
  - `--screen-accent-soft`
  - `--panel-surface`
  - `--panel-border`
  - `--focus-ring`
- 避免把頁面專屬數值加進 `:root`。

## 反模式

- 為單一畫面新增新的 `:root` 變數。
- 為了局部設計需求去新增 `button`、`input`、`a`、`h1` 這類 tag-level 全域樣式。
- 在多個檔案中複製貼上很長的 Tailwind arbitrary 漸層或陰影。
- 在同一個畫面混用多個互不相干的 accent 色。
- 在重用還沒被證明前，就過早建立共享 token。

## 檢查問題

- 什麼是能乾淨解決需求的最小作用範圍？
- 這個變更會不會讓其他畫面出現意料外影響？
- 是否已經有現成的 `app-*` primitive 可以重用？
- 這個需求更適合 local CSS variable，而不是全域 token 嗎？
- template 是否因為太多視覺邏輯都塞在 class 字串裡而變得難以閱讀？
