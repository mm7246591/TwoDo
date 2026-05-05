---
name: firebase-deploy-release
description: 協助 TwoDo 專案打包並上版到 Firebase。當使用者要求「打包上版到 Firebase」、「部署 Firebase」、「deploy hosting/functions」、「上版前檢查」、「發布正式版」或需要執行 Vite build、Firebase Hosting、Cloud Functions 部署流程時使用。
---

# Firebase 打包上版

## 目標

協助 Codex 依 TwoDo 專案現有設定，完成上版前檢查、建置、Firebase 部署與結果回報。此 skill 預設用於 Vite + Vue 3 + TypeScript 專案，並沿用專案內的 `firebase.json`、`.firebaserc` 與 `package.json` 指令。

## 工作原則

- 一律先確認目前 Git 工作樹、Firebase 專案別名與部署範圍，再執行會影響遠端環境的指令。
- 不要替使用者新增、覆蓋或提交功能程式碼；若建置失敗，先回報原因並等待修正需求。
- 不要印出 `.env`、token、service account、Firebase credentials 或任何祕密值。
- 若使用者未明確指定部署範圍，優先部署 `hosting,functions`；若只要求前端上版，部署 `hosting`。
- 若 `.firebaserc` 只有一個明確專案，仍需在回報中列出目標 project id；若有多個專案或別名不清楚，先詢問使用者。
- 正式執行 `firebase deploy` 前，若使用者只要求「檢查」或「準備上版」，停止在建置完成並回報可執行的部署命令。

## 執行流程

### 1. 讀取專案狀態

先執行並摘要結果：

```bash
git status --short --branch
git branch --show-current
sed -n '1,220p' package.json
sed -n '1,220p' firebase.json
sed -n '1,160p' .firebaserc
```

確認重點：

- `package.json` 是否有 `build` 與 `build:functions`。
- `firebase.json` 的 `hosting.public` 是否指向 `dist`。
- `firebase.json` 是否有 functions predeploy；本專案預期 functions source 是 `functions`。
- `.firebaserc` 的目標 project id；本專案目前常見別名為 `dist`，對應 `twodo-3741f`。
- 工作樹是否有未提交變更。若有，詢問是否仍要部署目前工作樹內容；使用者已明確要求立即上版時，仍需在回報中列出風險。

### 2. 檢查 Firebase CLI 與登入狀態

依序執行：

```bash
npx firebase --version
npx firebase projects:list
```

若 `projects:list` 因未登入或權限不足失敗，停止部署並請使用者在本機完成登入或切換帳號：

```bash
npx firebase login
```

不要要求使用者提供 token 或憑證內容。

### 3. 安裝依賴

若 `node_modules` 不存在，先執行：

```bash
npm install
```

若 `functions/node_modules` 不存在，先執行：

```bash
npm --prefix functions install
```

若依賴已存在，通常不要重裝；除非 lockfile 或 package 設定已變更且建置需要。

### 4. 建置檢查

依序執行：

```bash
npm run build
npm run build:functions
```

注意：

- `npm run build` 已包含 `vue-tsc -b && vite build`，可驗證 TypeScript 與輸出 `dist`。
- `firebase.json` 的 functions predeploy 也會跑 functions build；上版前先手動跑一次，方便提早看到錯誤。
- 若任一建置失敗，停止部署，摘要失敗命令與關鍵錯誤，不要跳過驗證硬上版。

### 5. 部署

依使用者需求選擇命令：

```bash
npx firebase deploy --only hosting --project twodo-3741f
npx firebase deploy --only functions --project twodo-3741f
npx firebase deploy --only hosting,functions --project twodo-3741f
```

規則：

- project id 以 `.firebaserc` 實際內容為準，不要硬編碼；上方只是本專案目前範例。
- 若使用者指定 alias，可使用 `--project alias`，但回報時仍列出實際 project id。
- 部署完成後，保留 Firebase CLI 輸出的 Hosting URL、Function 更新摘要與 console URL。
- 若部署失敗，停止後續動作，摘要失敗階段、錯誤訊息與可能的下一步。

### 6. 回報

最終回覆用繁體中文，包含：

- 部署範圍：例如 `hosting`、`functions` 或 `hosting,functions`。
- 目標 Firebase project：列出 project id 與使用的 alias。
- 驗證結果：列出 `npm run build`、`npm run build:functions` 是否通過。
- 部署結果：列出成功 URL、Firebase console URL 或失敗摘要。
- 工作樹狀態：部署前若有未提交變更，說明已用目前工作樹內容部署。

範例：

```md
已完成 Firebase 上版。

- 範圍：`hosting,functions`
- 目標：`twodo-3741f`（alias：`dist`）
- 驗證：`npm run build` 通過；`npm run build:functions` 通過
- 部署：Firebase Hosting URL 已更新，Functions predeploy 與 deploy 均完成
- 備註：部署時工作樹仍有 `.mission/...` 文件變更，未建立 commit
```
