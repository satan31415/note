<template>
  <div class="p-[20px]">
    <v-md-editor v-model="text" height="400px"></v-md-editor>
    <div class="mt-[20px] flex justify-end">
      <el-button type="danger">删除</el-button>
      <el-button>更新</el-button>
      <el-button type="primary">保存成新模版</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const text = ref('![content](https://api.onedrive.com/v1.0/shares/s!AmRYeUQXQNkEpiP_xrovcayqMtm_/root/content)');

</script>
<style scoped lang="scss">

</style>