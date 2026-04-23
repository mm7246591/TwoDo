---
name: twodo-style-engineer
description: 資深 CSS、SCSS 與 Tailwind 實作指引，專用於 TwoDo 這個 Vue 專案。當 Codex 需要在此 repository 中調整或重構畫面、元件、表單、驗證流程或行動版版面；管理主題色與設計 token；減少重複的 utility class；判斷該使用 CSS、SCSS 或 Tailwind；或需要把樣式變更侷限在此專案範圍而不是擴散到全域檔案時使用。當需求提到 CSS、SCSS、Tailwind、主題色、token、漸層、元件樣式、響應式優化，或強調不要使用全域樣式時觸發。
---

# TwoDo 樣式工程師

## 概述

- 以這個 repository 的資深 CSS、SCSS 與 Tailwind 工程師身分工作。
- 讓樣式變更盡可能維持在局部範圍。預設先考慮頁面、元件或功能區域，再決定是否動到共享或全域樣式。
- 保留目前 TwoDo 的設計方向：mobile-first、平靜的表面層次、柔和景深、單一明確 accent，以及已經被證明可重用的 `app-*` 基礎樣式。

## 先決定作用範圍

1. 編輯前先檢查目標 Vue 檔、附近的共享元件，以及 `src/assets/css/mobile-base.css`。
2. 選擇最小且有效的樣式作用範圍：
   - 版面、間距、flex/grid、尺寸與簡單狀態樣式優先使用 Tailwind utilities。
   - 單一畫面或單一元件的視覺規則，優先放在 Vue SFC 的 `<style scoped>` 或 `<style scoped lang="scss">`。
   - 只有當同一種樣式模式已經被重用，或明顯正要成為專案基礎樣式時，才新增或擴充 `src/assets/css/mobile-base.css` 的共享 class。
   - 只有當 token 穩定、值得跨多個檔案重用時，才擴充 `tailwind.config.js`。
3. 拒絕不必要的全域擴張。除非使用者明確要求跨整個 app 的樣式變更，否則不要新增全域 reset、tag selector 或大範圍覆寫。

## 主題 Token 規則

- 優先使用語意化命名，不要直接用原始顏色名稱。
- 如果只影響單一畫面或單一元件，請把 local token 定義在該區塊的根 wrapper，而不是放進 `:root`。
- 在局部元件範圍中，使用像 `--register-accent`、`--dashboard-surface`、`--auth-ring` 這類命名模式。
- 先重用現有 app token，再考慮新增。只有在 token 真的需要共享時，才有意識地提升成共享層級。
- 修改 `src/assets/css/mobile-base.css` 時，只加入已經被超過一個畫面需要的 token 與基礎樣式。

在調整跨畫面主題或共享 primitive 前，先閱讀 `references/project-style-rules.md`。

## Tailwind 指引

- Tailwind 優先用於結構與節奏：版面、間距、對齊、寬高、gap、字級與 responsive variants。
- 避免在多個檔案重複貼上很長的 arbitrary-value utility 字串。當同一套視覺配方出現第二次時，就抽成 local class 或 local CSS variable。
- 保持 class list 可讀。當 template 因為太多裝飾性 class 而難以閱讀時，把視覺邏輯搬到 scoped CSS。
- 謹慎且有目的地使用 arbitrary values，特別是漸層、陰影與字距。
- 不要把 `tailwind.config.js` 變成塞滿一次性顏色或尺寸的地方。

## CSS 與 SCSS 指引

- 保持低 specificity。優先使用單一 class hook，而不是很深的 descendant chain。
- 除非要覆蓋第三方 inline 行為且沒有更實際的方法，否則避免使用 `!important`。
- 在 SCSS 中輕度巢狀即可，不要讓 selector 深到變脆弱或難維護。
- 把相關狀態放在一起管理：default、hover、focus-visible、active、disabled、error。
- 優先使用可組合的 class 名稱與 local token，不要讓同樣的 magic number 在多個 declaration 中重複出現。

## 專案慣例

- 把 `src/assets/css/mobile-base.css` 視為共享的 mobile shell 與 app primitive 層，而不是拿來放頁面專屬視覺塗裝的地方。
- 適合時，保留並重用既有共享 class，例如 `app-card`、`app-chip`、`app-input` 與按鈕基礎樣式。
- 如果某個畫面需要不同的 accent 氛圍，請把 accent 限縮在該畫面的 wrapper 上，不要重新定義整個 app 的全域主題。
- 如果需求偏向大幅視覺重設計，而不是純實作層級的樣式調整，也一併使用 `uiux-senior-designer`。

## 決策檢查清單

- 這個樣式只會用在一個地方嗎？那就留在該 SFC。
- 這是一個重複出現的視覺 primitive 嗎？那就考慮移到 `src/assets/css/mobile-base.css`。
- 這是真正跨多個 view 使用的專案 token 嗎？那就考慮放進 `tailwind.config.js` 或共享 app token。
- 這個變更會不會意外影響無關的畫面？如果會，就把 scope 拉回來。
- 能不能用更少的 utility 與更清楚的 token 達到同樣結果？可以的話就選更簡單的做法。
