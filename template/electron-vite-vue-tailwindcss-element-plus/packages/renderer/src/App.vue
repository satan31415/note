<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { ipcRenderer } from 'electron';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { getElementPlusLocale } from './i18n';

const { locale } = useI18n({ useScope: 'global' });
const langByLocale = computed(() => getElementPlusLocale(locale.value as string));

const mainWindowListener = () => {
  console.log('渲染线程启动监听主线程');
  // 监听主线程信号
  ipcRenderer.on('mainWindowToRendererTestMessage', (event, data) => {
    console.log(event);
    console.log(data);

    ElMessage({
      message: data,
      type: 'success',
    });
  });
};

onMounted(() => {
  mainWindowListener();
});


</script>

<template>

  <!-- 这里不能有页头页脚，页头页脚在其他布局文件中-->
  <el-config-provider :locale="langByLocale">
    <router-view/>
  </el-config-provider>

</template>


