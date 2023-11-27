import { RouteRecordRaw } from 'vue-router';
import Index from '../pages/index.vue';
import ElementPlus from '../pages/elementPlus/index.vue';
import IndexLayout from '../layout/indexLayout.vue';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/index',
    component: IndexLayout,
    children: [
      {
        path: '/index',
        component: Index,
      },
      {
        path: '/elementPlus',
        component: ElementPlus,
      },
    ],
  },
];


export default routes;
