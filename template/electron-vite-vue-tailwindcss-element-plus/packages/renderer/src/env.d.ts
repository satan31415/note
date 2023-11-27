/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}


// 为自定义的环境变量增加 TypeScript 的智能提示 start
interface ImportMetaEnv {
  readonly VITE_GLOB_TEST_ENV_MESSAGE: string;
  readonly VITE_GLOB_APP_TITLE: string;
  readonly VITE_GLOB_APP_S1: string;
  readonly VITE_GLOB_APP_NAME: string;
  readonly VITE_GLOB_REQUEST_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// 为自定义的环境变量增加 TypeScript 的智能提示 end
