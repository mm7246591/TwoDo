# Pinia 實務模式參考

## 目錄

- Store 型態選擇
- 狀態設計原則
- Getters 與 Actions 分工
- 元件中的使用方式
- 跨 Store 協作
- Persist 與 SSR
- Plugin、訂閱與 HMR
- 測試重點

## Store 型態選擇

- 在需要標準 `state / getters / actions` 結構、內建 `$reset()`、團隊偏好明確宣告時，優先使用 options store。
- 在需要組合 composables、使用 watcher、封裝較複雜衍生流程，或必須更細緻控制回傳內容時，優先使用 setup store。
- 不要因為 setup store 看起來自由就全部改成 setup store；自由度越高，越需要明確邊界與命名。

```ts
export const useSessionStore = defineStore('session', {
  state: () => ({
    user: null as User | null,
    status: 'idle' as 'idle' | 'loading' | 'ready' | 'error',
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
  },
  actions: {
    async fetchMe() {
      this.status = 'loading'
      try {
        this.user = await api.me()
        this.status = 'ready'
      } catch (error) {
        this.status = 'error'
        throw error
      }
    },
  },
})
```

## 狀態設計原則

- 讓 state 代表事實，不要把排序結果、字串格式化結果或可由其他欄位推導出的值重複存入 state。
- 對清單資料優先同時保存 `items` 與查找索引需求，而不是四處即時計算高成本查找。
- 對不可序列化或不希望深層追蹤的物件使用 `markRaw()`、`shallowRef()` 或抽離到 store 外。
- 若狀態來自伺服器快取，先判斷是否應交給 TanStack Query 之類工具，而不是硬塞進 Pinia。

## Getters 與 Actions 分工

- 把純衍生邏輯放在 getters，把流程控制、I/O、批次更新與錯誤處理放在 actions。
- 不要在 getters 中觸發 API、寫入 localStorage、修改別的 store 或改變自身 state。
- 把元件中重複出現的「先檢查狀態再呼叫 API 再更新多個欄位」流程收斂為 action。
- 對 setup store 自行補上 reset helper，避免測試與登出流程殘留舊狀態。

## 元件中的使用方式

- 對 state 與 getters 使用 `storeToRefs()`，避免直接解構後喪失響應式。
- 對 actions 可直接解構，但要避免把整個 store 傳到深層元件造成依賴不透明。

```ts
const sessionStore = useSessionStore()
const { user, isAuthenticated } = storeToRefs(sessionStore)
const { fetchMe } = sessionStore
```

## 跨 Store 協作

- 讓一個 store 依賴另一個 store 的公開 action 或明確欄位，不要直接修改對方內部 state。
- 若兩個 store 互相 import，先判斷是否應抽成第三個 store、service 或 composable。
- 在 action 內取得其他 store 實例時，確保初始化順序與循環依賴風險都可控。

## Persist 與 SSR

- 只持久化值得跨重新整理保留的欄位，例如 token、偏好設定、草稿；不要預設整包持久化。
- 持久化敏感資料前先確認安全性與資料生命週期，不要把高風險資料直接明文寫進 storage。
- SSR 場景中保持初始 state 可序列化，避免使用時間、隨機值或瀏覽器專屬資訊造成 hydration mismatch。
- 需要跳過 hydration 的值時，優先使用 Pinia 官方對應能力，例如 `skipHydrate()`，而不是靠臨時判斷繞過。

## Plugin、訂閱與 HMR

- 用 plugin 處理橫切能力，例如持久化、記錄、權限註冊、監測；不要把頁面特定商業規則塞進 plugin。
- 用 `$subscribe()` 觀察 state 變更時，避免高頻寫入造成效能問題或無限迴圈。
- 用 `$onAction()` 做追蹤或分析時，明確處理成功、失敗與清理邏輯。
- 在 Vite 專案保留 HMR 樣板，避免開發時 store 定義更新後需要整頁重整。

```ts
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSessionStore, import.meta.hot))
}
```

## 測試重點

- 先測關鍵 getters 與 actions 的輸入輸出，再測錯誤流、競態與 reset 行為。
- Store 涉及 API 時，替換 I/O 邊界，不要讓單元測試直接依賴真實網路。
- 若 store 會和 router、其他 stores 或 plugin 協作，補一層整合測試確認互動契約。
