<template>
  <div class="message" v-if="message">
    <span v-for="line in messageLines" :key="line">
      {{ line }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  message: string;
}>();

const messageLines = computed(() => {
  return props.message.split("\n");
});
</script>

<style lang="scss" scoped>
.message {
  position: absolute;
  top: 260px;
  left: 25px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  span {
    display: inline;
    margin-bottom: 4px;
    background: rgba(0, 0, 0, 0.7);
    white-space: nowrap;
    line-height: 1.1;
  }
}
</style>
