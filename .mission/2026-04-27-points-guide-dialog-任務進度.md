# 2026-04-27-points-guide-dialog 任務進度

## 狀態摘要
- 最後更新：2026-04-27 17:56
- 目前狀態：已完成
- 下一步：交付子元件改造與驗證結果。

## 變更紀錄
### 2026-04-27 00:00
- 完成：建立本次對話任務與進度紀錄。
- 調整：尚未修改產品程式碼。
- 影響：後續改動會依此紀錄追蹤。
- 下一步：讀取 Vant Dialog 型別與現有樣式入口。

### 2026-04-27 17:49
- 完成：確認 Vant Dialog 支援 `allowHtml`、`className` 與 `messageAlign`；完成點數機制彈窗條列化與專用樣式調整。
- 調整：修改 `src/views/setting/composables/useSettingView.ts` 與 `src/assets/scss/main.scss`。
- 影響：彈窗內容改為分段條列，字級與行距提高，確認按鈕維持既有操作。
- 驗證：`npm run build` 通過；`npm run lint` 因缺少 script 無法執行。
- 下一步：回覆使用者並附上改動原因。

### 2026-04-27 17:49 追加需求
- 完成：確認使用者希望改成子元件，並同步處理關閉按鈕點擊變色問題。
- 調整：任務範圍新增 T5 與 T6。
- 影響：需要修改 `SettingView.vue`、`useSettingView.ts`，並新增點數說明 Dialog 子元件。
- 下一步：先補 `.vue` spec，再實作子元件與狀態控制。

### 2026-04-27 17:56
- 完成：新增 `SettingPointsGuideDialog.vue`，改由 `v-model:show` 控制彈窗；移除 `useSettingView.ts` 中的 `showDialog` HTML 字串。
- 調整：`SettingView.vue` 掛載點數說明彈窗子元件並補上 spec；`useSettingView.ts` 新增彈窗顯示狀態與 TSDoc；`main.scss` 移除舊彈窗專用全域樣式。
- 影響：點數說明內容回到 Vue template，關閉按鈕按下時維持穩定文字與背景顏色。
- 驗證：`npm run build` 通過；`npm run lint` 仍因缺少 script 無法執行。
- 下一步：回覆使用者並附上改動原因。

### 2026-04-27 18:00 頭像轉場評估
- 完成：確認 `AppHeader.vue` 的頭像點擊目前直接 `router.push` 到 `setting`，`App.vue` 的 `<RouterView />` 尚未包頁面層級 transition。
- 調整：本回合僅做可行性與 UX 建議，未修改產品程式碼。
- 影響：若後續實作，建議優先在 `App.vue` 加入 route transition，再用路由 meta 控制設定頁的進出動畫。
- 下一步：等待使用者確認是否要實作頁面轉場。
