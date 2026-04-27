---
name: twodo-style-engineer
description: 資深 CSS、SCSS 與 Tailwind 實作指引，專用於 TwoDo 這個 Vue 專案。當 Codex 需要調整或重構畫面、元件、表單、驗證流程、行動版版面、主題色、SCSS token、Tailwind utility、全域樣式邊界，或需要把樣式從 CSS/SCSS 移到 Vue template 時使用。特別適用於「不要寫全域樣式」、「把 Tailwind 寫在 template」、「spacing/size 要寫實際 px」、「整理顏色變數」、「檢查重複 Tailwind class」等請求。
---

# TwoDo 樣式工程師

## 目前架構

- 全域樣式集中在 `src/assets/scss/`。
- `src/assets/scss/main.scss` 只放 app-wide reset、文件基礎行為，以及真正共用的 primitive。
- `src/assets/scss/tailwind.scss` 負責 Tailwind layer imports/directives。
- `src/assets/scss/_color-variables.scss` 負責命名顏色 CSS variables 與主題色對應。
- `src/assets/scss/_theme-tokens.scss` 只能放真的需要全域共享的語意 token，不能再變成 spacing/font-size primitive 的集中檔。
- 元件自己的 layout 與視覺樣式，預設直接寫在 Vue template 的 Tailwind class。
- 除非框架整合需要，不要再往 `tailwind.config.js` 加專案一次性樣式值；優先用 CSS variables 搭配 arbitrary utilities。

## 預設流程

1. 修改前先讀相關 Vue SFC 與 SCSS 檔案。
2. 先判斷樣式是全域還是局部：
   - 全域：reset、body/root 行為、主題變數、共享 CSS variables，或跨無關畫面都會用到的小型 primitive。
   - 局部：頁面版面、卡片組合、間距、尺寸、字級、按鈕、欄位、狀態，以及單一元件視覺。
3. 局部樣式優先寫在 template 的 Tailwind utilities。
4. 顏色與主題值先用 SCSS 變數命名，再在 template 透過 `text-[var(--app-text)]` 這類寫法引用。
5. 修改後檢查亂碼文字、重複 utility class，以及應改成 px 的 Tailwind scale spacing。
6. 只要改到 Vue template、Tailwind class、SCSS import 或 build config，就跑 `npm run build`。

## Tailwind 規則

- spacing 與 size 要寫實際 px arbitrary utilities：
  - 使用 `px-[20px]`、`gap-[16px]`、`h-[44px]`、`min-h-[80px]`、`mt-[12px]`。
  - 不使用 Tailwind scale 縮寫，例如 `px-5`、`gap-4`、`h-11`、`min-h-20`、`p-10`。
- 字級要寫實際值：
  - 使用 `text-[15px]`、`leading-[24px]`。
  - 不使用 `text-sm`、`text-lg` 或 Tailwind config 的自訂字級別名。
- 顏色優先使用語意 CSS variables：
  - 使用 `text-[var(--app-text)]`、`bg-[var(--app-surface)]`、`border-[var(--app-border)]`。
  - 顏色需要共享時，在 `_color-variables.scss` 定義或重新命名。
- 非 spacing 的結構 utility 可以保留：
  - `flex`、`grid`、`items-center`、`justify-between`、`relative`、`absolute`、`overflow-hidden`、`font-bold`、`rounded-full`、responsive variants、state variants。
- 同一個 `class` 不要出現重複或互相衝突的 utility：
  - 不要 `px-[16px] ... px-[12px]`。
  - 不要 `text-[var(--a)] ... text-[var(--b)]`，除非其中一個有 `hover:` 這類 variant。
- 一般元件樣式優先用 template class，不要先寫 `<style scoped>`。
- 只有 selector、pseudo-element、第三方內部結構、keyframes 或複雜狀態讓 template 太難讀時，才用 `<style scoped lang="scss">`。

## SCSS 規則

- `_color-variables.scss` 是命名顏色變數的 source of truth。
- `_theme-tokens.scss` 只放無法合理留在元件中的語意全域 token。
- 不要重新加入 `--app-space-16`、`--app-type-15` 這類 primitive spacing/type 變數；直接在 template 寫 px。
- `main.scss` 可以放：
  - document/body/root setup
  - 真的全域的 safe-area shell 行為
  - shared base typography behavior
  - 第三方套件的全域 normalization
- `main.scss` 不應放 page-specific class，例如單一頁面的 card、local button、local panel 或 screen-only layout。

## Vue Template 規則

- 優先用明確 class list，讓元件在 template 內就能讀懂。
- class list 很長但仍然是在描述單一元素時，可以保留在 template。
- 同一個元件內重複很長的 class list 時，考慮 local computed class string 或小型子元件。
- 同一套視覺模式跨無關功能重複時，優先考慮共享 Vue component，再考慮全域 CSS。
- 謹慎保留中文文案。遇到亂碼時，優先用 `git show HEAD:<file>` 找回原文；找不到就用清楚的繁體中文重寫。

## 常用檢查

樣式遷移後可以使用：

```powershell
rg --pcre2 "(?<![\w\-\[])(?:min-|max-)?(?:h|w)-\d+(?:\.5)?|(?<![\w\-\[])(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl|gap|space-x|space-y)-\d+(?:\.5)?" -n src
rg "app-space-|app-type-|safe-(top|right|bottom|left)" -n src
rg "�|撌|銝|雿|摰|靽|隤|蝞|璅|暺|冽|撠|霈|蝝" -n src/components src/views src/App.vue
```

檢查靜態重複 class 時，可以用小腳本掃每個 `class="..."`，用空白切開後回報重複 token。

## 審查清單

- spacing/size 沒有殘留舊 Tailwind scale。
- 沒有重新加入 primitive spacing/type CSS variables。
- 顏色變數具備語意命名。
- `main.scss` 只包含全域或真正共享樣式。
- 元件專屬樣式留在 Vue template 或 scoped SCSS。
- class list 沒有重複或衝突 utility。
- 沒有亂碼文案。
- `npm run build` 通過。
