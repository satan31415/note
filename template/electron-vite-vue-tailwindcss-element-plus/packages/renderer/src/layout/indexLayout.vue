<script setup lang="ts">
import { onMounted, computed, ref, onActivated } from 'vue';
import { useI18n } from 'vue-i18n';
import { getElementPlusLocale } from '../i18n';
import Logo from '../components/logo.vue';
import { electronStoreGetInvokeToMainWindow, electronStoreSetInvokeToMainWindow } from '../utils/ipc-util';
import router from '../router';
import { ElMessage } from 'element-plus/es';

const { locale } = useI18n({ useScope: 'global' });
const langByLocale = computed(() => getElementPlusLocale(locale.value as string));


let loginState = ref(false);

const logoutFn = async () => {
  ElMessage({
    message: '退出成功',
    type: 'success',
  });
  loginState.value = false;
  await electronStoreSetInvokeToMainWindow('loginAccessToken', '');
  await router.push('/login');
};

onMounted(async () => {
  const loginAccessToken = await electronStoreGetInvokeToMainWindow('loginAccessToken');
  console.log('loginAccessToken2=' + loginAccessToken);
  if (loginAccessToken) {
    loginState.value = true;
  } else {
    loginState.value = false;
  }
});


</script>
<template>
  <div class="flex flex-row mx-auto items-center justify-center mb-6 bg-gray-50 shadow p-1">
    <logo class="flex-1"></logo>
  </div>

  <el-config-provider :locale="langByLocale">
    <router-view/>
  </el-config-provider>

</template>


