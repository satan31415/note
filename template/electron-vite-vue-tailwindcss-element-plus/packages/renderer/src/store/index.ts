import { createPinia } from 'pinia';
// 如果需要刷新的时候也保存状态到 storage 里面，可以考虑使用这个包
// import piniaPluginPersist from "pinia-plugin-persist";

const store = createPinia();
// store.use(piniaPluginPersist);

// export interface obj {
//   [propname: string]: any;
// }

export default store;
