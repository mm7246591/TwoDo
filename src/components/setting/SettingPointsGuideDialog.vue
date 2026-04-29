<script setup lang="ts">
import { Dialog } from "vant";

const VantDialog = Dialog.Component;
const isOpen = defineModel<boolean>("show", { required: true });
</script>

<template>
  <VantDialog
    v-model:show="isOpen"
    class-name="points-guide-dialog"
    confirm-button-text="關閉"
    title="點數機制說明"
    teleport="body"
  >
    <div class="grid gap-[14px] px-[22px] pb-[22px] pt-[18px] text-left">
      <p
        class="m-[0px] text-[15px] font-[500] leading-[24px] tracking-[0] text-[var(--app-text)]"
      >
        完成任務後，可以獲得任務設定的點數。
      </p>

      <ul class="grid list-none gap-[12px] m-[0px] p-[0px]">
        <li
          class="grid gap-[4px] border-l-[3px] border-l-[var(--app-accent)] pl-[14px]"
        >
          <strong
            class="text-[15px] font-[700] leading-[22px] tracking-[0] text-[var(--app-text-strong)]"
          >
            個人任務
          </strong>
          <span
            class="text-[14px] leading-[22px] tracking-[0] text-[var(--app-text-muted)]"
          >
            任務完成後，由建立任務的人確認；確認後點數會加到被指派者身上。
          </span>
        </li>

        <li
          class="grid gap-[4px] border-l-[3px] border-l-[var(--app-accent)] pl-[14px]"
        >
          <strong
            class="text-[15px] font-[700] leading-[22px] tracking-[0] text-[var(--app-text-strong)]"
          >
            共同任務
          </strong>
          <span
            class="text-[14px] leading-[22px] tracking-[0] text-[var(--app-text-muted)]"
          >
            雙方都標記完成後會進入待確認；雙方都確認後，兩個人都會獲得該任務點數。
          </span>
        </li>

        <li
          class="grid gap-[4px] border-l-[3px] border-l-[var(--app-accent)] pl-[14px]"
        >
          <strong
            class="text-[15px] font-[700] leading-[22px] tracking-[0] text-[var(--app-text-strong)]"
          >
            兌換獎勵
          </strong>
          <span
            class="text-[14px] leading-[22px] tracking-[0] text-[var(--app-text-muted)]"
          >
            只能兌換對方建立且已啟用的獎勵；兌換時會扣除獎勵設定的點數，點數不足時不能兌換。
          </span>
        </li>

        <li
          class="grid gap-[4px] border-l-[3px] border-l-[var(--app-accent)] pl-[14px]"
        >
          <strong
            class="text-[15px] font-[700] leading-[22px] tracking-[0] text-[var(--app-text-strong)]"
          >
            點數紀錄
          </strong>
          <span
            class="text-[14px] leading-[22px] tracking-[0] text-[var(--app-text-muted)]"
          >
            所有加點與扣點都會寫入紀錄，方便之後查看來源。
          </span>
        </li>
      </ul>
    </div>
  </VantDialog>
</template>

<style scoped lang="scss">
:global(.points-guide-dialog .van-dialog__header) {
  color: var(--app-text-strong);
  font-size: 18px;
  line-height: 26px;
}

:global(.points-guide-dialog .van-dialog__content) {
  max-height: 62vh;
  overflow-y: auto;
}

:global(.points-guide-dialog .van-dialog__confirm) {
  color: var(--app-accent-strong);
  font-weight: 700;
  background: var(--app-surface-strong);
}

:global(.points-guide-dialog .van-dialog__confirm:active) {
  color: var(--app-accent-strong);
  background: var(--app-surface-strong);
}

:global(.points-guide-dialog .van-dialog__confirm::before) {
  display: none;
}
</style>

<spec lang="md">
## 1. 說明

- 顯示設定頁的點數機制說明彈窗，協助使用者理解任務完成、共同任務、獎勵兌換與點數紀錄規則。

## 2. 功能需求

- 1. 父層開啟彈窗時，顯示標題與條列式點數說明。
- 2. 使用者點擊「關閉」後，彈窗關閉並同步更新父層顯示狀態。
- 3. 關閉按鈕在點擊狀態下需維持穩定文字與背景顏色，避免顏色閃爍造成誤解。

## 3. 對接口

- defineModel：show，用於控制彈窗顯示或關閉。
- props：無。
- emit：由 defineModel 同步 show 狀態。

## 4. 實作方式

- 使用 Vant 3 的 Dialog.Component 作為彈窗容器。
- 說明內容放在 template 內，以條列區塊呈現。
- 彈窗內容樣式使用 TailwindCSS 類別。
- Vant Dialog 內部標題、內容捲動與關閉按鈕狀態使用 scoped style 的全域選擇器覆寫。
</spec>
