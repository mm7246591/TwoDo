---
name: create-adaptable-composable
description: 建立可作為函式庫使用的 Vue composable，支援 maybe-reactive 輸入（MaybeRef / MaybeRefOrGetter），讓呼叫端可以傳入一般值、ref 或 getter。需在 reactive effects（watch/watchEffect）內使用 toValue()/toRef() 正規化輸入，讓行為保持可預期且具備響應性。當使用者要求建立可適配或可重用 composable 時使用此 Skill。
license: MIT
metadata:
  author: github.com/vuejs-ai
  version: "17.0.0"
compatibility: 需要 Vue 3（含以上）或 Nuxt 3（含以上）專案
---

# 建立可適配的 Composable

可適配 composable 是可重用函式，能同時接受響應式與非響應式輸入。這讓開發者能在不同情境中使用 composable，而不需要擔心輸入本身是否具備響應性。

在 Vue.js 中設計可適配 composable 的步驟：
1. 確認 composable 的目的、API 設計，以及預期輸入/輸出。
2. 找出應具備響應性的輸入參數（MaybeRef / MaybeRefOrGetter）。
3. 在 reactive effects 內使用 `toValue()` 或 `toRef()` 正規化輸入。
4. 使用 Vue 的 reactivity API 實作 composable 的核心邏輯。

## 核心型別概念

### 型別工具

```ts
/**
 * value 或可寫入 ref（value/ref/shallowRef/writable computed）
 */
export type MaybeRef<T = any> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>;

/**
 * MaybeRef<T> + ComputedRef<T> + () => T
 */
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | ComputedRef<T> | (() => T);
```

### 策略與規則

- 唯讀且適合 computed 的輸入：使用 `MaybeRefOrGetter`
- 需要可寫入或雙向輸入：使用 `MaybeRef`
- 參數可能是函式值（callback/predicate/comparator）：不要使用 `MaybeRefOrGetter`，否則可能會誤把它當 getter 呼叫。
- DOM/Element 目標：如果需要 computed/derived 目標，使用 `MaybeRefOrGetter`。

使用 `MaybeRefOrGetter` 或 `MaybeRef` 時：
- 使用 `toRef()` 解析響應式值（例如 watcher source）
- 使用 `toValue()` 解析非響應式值

### 範例

可適配的 `useDocumentTitle` Composable：唯讀 title 參數

```ts
import { watch, toRef } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useDocumentTitle(title: MaybeRefOrGetter<string>) {
  watch(toRef(title), (t) => {
    document.title = t
  }, { immediate: true })
}
```

可適配的 `useCounter` Composable：雙向可寫入 count 參數

```ts
import { watch, toRef } from 'vue'
import type { MaybeRef } from 'vue'

function useCounter(count: MaybeRef<number>) {
  const countRef = toRef(count)
  function add() {
    countRef.value++
  }
  return { add }
}
```
