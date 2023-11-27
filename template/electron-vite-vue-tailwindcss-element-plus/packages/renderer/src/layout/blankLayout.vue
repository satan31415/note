<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getElementPlusLocale } from '../i18n';

const { locale } = useI18n({ useScope: 'global' });
const langByLocale = computed(() => getElementPlusLocale(locale.value as string));


</script>
<template>

  <el-config-provider :locale="langByLocale">
    <router-view/>
  </el-config-provider>

</template>


