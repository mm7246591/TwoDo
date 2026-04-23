# Vue Router 4 實務模式參考

## 目錄

- Route Records 設計
- Navigation Guards 分層
- Params 與 Query 使用原則
- Route 與元件生命週期互動
- Scroll、Meta 與導頁輔助
- Typed Navigation 與模組化
- 測試重點

## Route Records 設計

- 先讓 route records 對應穩定的資訊架構，不要讓路由結構只是檔案目錄的鏡像。
- 對共享 layout、子頁與 wizard 先判斷是否真的需要 nested routes；若只影響畫面局部切換，元件內狀態可能更合適。
- 優先使用命名路由，並讓 `name` 對應清楚的業務語意，而不是 `page1`、`detail-view` 這類弱語意名稱。
- 對 `redirect` 與 `alias`，先確認 canonical URL 是哪一條，再避免分析與收藏行為被拆散。

```ts
const routes: RouteRecordRaw[] = [
  {
    path: '/projects',
    component: ProjectsLayout,
    children: [
      {
        path: '',
        name: 'projects-list',
        component: ProjectsListPage,
      },
      {
        path: ':projectId',
        name: 'project-detail',
        component: ProjectDetailPage,
        props: true,
      },
    ],
  },
]
```

## Navigation Guards 分層

- 把 `beforeEach` 用在跨站點規則，例如登入檢查、初始化權限、分析追蹤與頁面 meta 準備。
- 把 `beforeEnter` 用在某個路由群組的局部前置條件，例如特定模組的 feature flag 或角色檢查。
- 把 `onBeforeRouteLeave` 用在頁面特定的未儲存提醒、請求取消與離開清理。
- 以回傳值為中心思考守衛流程：允許、阻止、或導向別處，不要混雜舊式 `next()` 造成多次結束。

```ts
router.beforeEach(async (to) => {
  const session = useSessionStore()

  if (to.meta.requiresAuth && !session.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }
})
```

## Params 與 Query 使用原則

- 用 params 表示資源識別，例如 `projectId`、`slug`；用 query 表示排序、篩選、分頁與可分享的 UI 狀態。
- 不要把大型、敏感或難以維護的狀態硬塞進 query string。
- 對 query 的字串值主動做 parse 與 normalize，避免每個元件各自解讀 `page`, `tab`, `sort`。
- 若元件以 `props: true` 或自訂 `props` 接 route params，可降低對 `useRoute()` 的直接耦合。

## Route 與元件生命週期互動

- 同一路由記錄下 params 或 query 改變時，元件通常會被重用，不會重新掛載。
- 若資料依賴 `route.params.id`，用明確 watcher 或 `onBeforeRouteUpdate()` 處理更新，而不是只放在 `onMounted()`。
- 導頁造成的非同步請求要能取消、忽略過期回應，或由資料層保證最新結果覆蓋舊結果。
- 離開頁面時若需要保存草稿、解除訂閱或中止請求，放在 `onBeforeRouteLeave()` 或對應清理點。

```ts
const route = useRoute()

watch(
  () => route.params.projectId,
  (projectId) => {
    if (typeof projectId === 'string') {
      projectStore.fetchProject(projectId)
    }
  },
  { immediate: true },
)
```

## Scroll、Meta 與導頁輔助

- `scrollBehavior` 先定義瀏覽器返回、hash 錨點與一般新頁導覽的規則，再落實一致體驗。
- 對 `document.title`、breadcrumb 與 analytics，優先透過 route meta 加上集中式處理，而不是每頁自己改。
- 對導頁 helper，優先封裝成語意函式，例如 `goToProject(projectId)`，避免到處散落 `router.push()` 細節。

## Typed Navigation 與模組化

- TypeScript 專案中，優先收斂 route names 與 helper 的型別，降低 `params` 漏欄位或 key 拼錯的風險。
- router 設定過大時，依功能域拆分模組，但維持一致的 meta 欄位、命名規則與匯出方式。
- 若專案採檔案式路由或外部產生器，先理解生成規則，再決定要在哪一層擴充 meta、guards 與 typed routes。

## 測試重點

- 先測守衛分支：已登入、未登入、權限不足、redirect 參數存在或缺失。
- 先測同一路由重用元件時 params/query 更新能否正確觸發資料同步。
- 對 scroll behavior、page title 與 analytics 這類跨頁副作用，補一層整合測試或最小可驗證流程。
