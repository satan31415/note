import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import store from './store/index';
import { errorHandler } from './utils/error';
import i18n from './i18n';


/* region markdown 插件 */
// @ts-ignore
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
// @ts-ignore
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

import hljs from 'highlight.js';
VMdEditor.use(githubTheme, {
    Hljs: hljs,
});

/* endRegion markdown 插件 */

// 自定义样式
import './assets/css/main.css';


// tailwindcss
import './assets/css/tailwind.css';


//全局导入 element-plus 样式，不要 unplugin-vue-components、unplugin-auto-import 按需加载，不然有些 js 里面使用的组件的样式还需要手工处理，很麻烦
// 这个必须放在 tailwindcss 下面，别乱 el-button 样式有冲突，会变成白色
// 不用 ant-design-vue，因为即使放在最下面，和 tailwindcss 样式冲突的问题也很多，所以不推荐使用
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// 更改软件标题
const renderAppName = import.meta.env.VITE_GLOB_APP_NAME;
document.title = renderAppName;

const app = createApp(App);

// 为了避免其他一些组件的对话框的层级太低，这里先预先调低 ElementPlus 的 对话框层级（默认为2000）
app.use(ElementPlus, { zIndex: 500 });
app.use(VMdEditor)
app.use(router);
app.use(store);
app.use(i18n);
errorHandler(app);
app.mount('#app').$nextTick(window.removeLoading);
