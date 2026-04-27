# TwoDo 專案樣式規則

## 樣式分層

- `src/assets/scss/tailwind.scss`
  - 只放 Tailwind imports/directives。
- `src/assets/scss/main.scss`
  - 全域 reset 與 app-wide 基礎行為。
  - 第三方套件共用 normalization。
  - 不放 page-only 或 component-only 樣式。
- `src/assets/scss/_color-variables.scss`
  - 命名顏色變數與語意主題變數。
  - 優先使用 `--app-surface`、`--app-text`、`--app-accent` 這類語意命名。
- `src/assets/scss/_theme-tokens.scss`
  - 只放真的需要全域作用域的語意 token。
  - 不要重加 `--app-space-16`、`--app-type-15` 這類 primitive spacing/type token。
- Vue SFC template
  - 預設放元件與頁面的 layout、spacing、size、typography 與視覺 utility。

## 提升規則

1. 一次性的頁面或元件樣式留在 Vue template。
2. 單一元素有動態狀態時，用 `:class` array 或 computed class。
3. 同一元件內重複的模式，考慮 local helper 或小型子元件。
4. 跨無關功能重複的模式，考慮共享 Vue component。
5. 只有真正 app-wide 的樣式才提升到全域 SCSS。

## Tailwind 值規則

- spacing 與 size 使用實際 px arbitrary utilities：
  - `px-[20px]`、`gap-[16px]`、`h-[44px]`、`min-h-[80px]`、`top-[24px]`。
- 不使用 Tailwind spacing scale 縮寫：
  - 不要 `px-5`、`gap-4`、`h-11`、`min-h-20`、`p-10`。
- 字級使用實際值：
  - `text-[15px]`、`leading-[24px]`。
- 結構 utility 可以保留：
  - `flex`、`grid`、`relative`、`absolute`、`items-center`、`justify-between`、`rounded-full`。

## 顏色規則

- 共享顏色定義在 `_color-variables.scss`。
- template 直接引用語意變數：
  - `text-[var(--app-text)]`
  - `bg-[var(--app-surface)]`
  - `border-[var(--app-border)]`
- 除非是明確局部且短期的值，否則避免重複 raw hex。

## 避免事項

- 把 page-specific class 加到 `main.scss`。
- 重新引入舊的 `src/assets/css/*` 檔案。
- 把一次性設計值加到 `tailwind.config.js`。
- 在同一個 class list 重複或衝突 utility。
- 用全域 tag selector 處理元件專屬變更。
