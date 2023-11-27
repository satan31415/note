import { Menu, MenuItem, MenuItemConstructorOptions, ipcMain, dialog, BrowserWindow, shell } from 'electron';
import { type, arch, release } from 'os';
import packageInfo from '../../../package.json';

// getmenu接口
interface menuObj {
  lable: string;
  id: string;
  type: string;
  child: menuObj[] | null;
}

/**
 * 自定义顶部menu会导致默认的几个菜单消失 (如view,window等..)
 * 如需添加,设置sunmenu[x].role = xxx 即可
 * 详情参考https://www.electronjs.org/zh/docs/latest/api/menu#示例
 */

/**
 * app加载完成时添加ipc通讯监听:
 * 当渲染进程发来索取app顶部菜单请求时,返回菜单数组用于生成windows上左上角菜单栏
 * 当渲染进程自定义菜单项被点击时,通过传入的menuItemId获取对应的菜单项,并调用click事件
 */
export function onAppMenu() {
  // 渲染进程索取菜单时,如果是windows,返回菜单,如果是macos,返回null
  ipcMain.handle('getAppMenu', (): menuObj[] | null =>
    process.platform == 'darwin' ? null : getmenu(),
  );
  // ipcMain.handle("getAppMenu", (): menuObj[] | null => getmenu());
  ipcMain.on('MenuClick', (event, menuItemId: string) => {
    const menuItem = Menu.getApplicationMenu()?.getMenuItemById(menuItemId);
    menuItem?.click();
  });
}

/**
 * @description 创建app菜单
 */
export function createAppMenu() {
  const AppMenu: (MenuItemConstructorOptions | MenuItem)[] = [
    // 在mac上,第一个自定义menuItem的label会被应用名覆盖
    //此label会被package.json打包配置中的 `build.productName = ‘后台管理’` 覆盖
    {
      id: '1', label: 'App', submenu: [
        {
          id: '1-1', label: '关于', accelerator: 'shift + CmdOrCtrl + P',
          click() {
            dialog.showMessageBox({
              title: '关于',
              type: 'info',
              message: 'uptmr-electron-Vue框架',
              detail: `版本信息：${packageInfo.version}\n引擎版本：${process.versions.v8}\n当前系统：${type()} ${arch()} ${release()}`,
              noLink: true,
              buttons: ['关闭', '查看官网'],
            }).then(res => {
              // console.log(res.response)
              if (res.response === 0) {
                // 表示第1个按钮下标
                // 这里什么都不操作，点击按钮就会关闭弹窗
              } else if (res.response === 1) {
                // 表示第2个按钮下标
                shell.openExternal('https://www.uptmr.com');
              } else {
                console.log(res.response);
              }
            });
          },
        },
      ],
    },
    {
      id: '2',
      label: '开发测试',
      submenu: [
        {
          id: '2-1',
          label: '测试',
          submenu: [
            {
              id: '2-1-1',
              label: '测试-1',
              submenu: [
                { id: '2-1-4-1', label: '测试-1-1' },
                { id: '2-1-4-1', label: '测试-1-2' },
              ],
            },
            { id: '2-1-2', label: '测试-2' },
            { id: '2-1-3', label: '测试-3' },
            {
              id: '2-1-4',
              label: '测试-4',
              submenu: [
                { id: '2-1-4-1', label: '测试-4-1' },
                { id: '2-1-4-1', label: '测试-4-2' },
              ],
            },
          ],
        },
        {
          id: '2-2',
          label: '检查元素',
          click() {
            BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
          },
        },
      ],
    },
    {
      id: '11', label: '编辑', submenu: [
        { id: '11-1', label: '复制', role: 'copy' },
        { id: '11-2', label: '粘贴', role: 'paste' },
        { id: '11-7', label: '剪切', role: 'cut' },
        { id: '11-4', label: '刷新', role: 'forceReload' },
        { id: '11-6', label: '全选', role: 'selectAll' },
        { id: '11-9', label: '取消', role: 'undo' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          id:'222-1',
          label: '联系我们',
          click: async () => {
            await shell.openExternal('https://www.uptmr.com');
          },
        },
        { id: '222-2', label: '分隔线', type: 'separator' },
        { id: '222-3', label: '退出', role: 'quit' },
      ],
    },
  ];
  /** 创建菜单 */
  const appMenu = Menu.buildFromTemplate(AppMenu);
  return appMenu;
}

/**
 * @description 递归生成菜单数组,数组传递给渲染进程用于生成windows上左上角菜单栏
 * @returns {menuObj}  menuArr:{ lable: string, id: string, type: string, child?: menuObj[] }
 */
function getmenu() {
  function menu(ims: MenuItem[]) {
    const menuArr: menuObj[] = [];
    ims.map((im) => {
      const menuObj: menuObj = {
        lable: im.label,
        id: im.id,
        type: im.type,
        child: im.type == 'submenu' && im.submenu ? menu(im.submenu.items) : null,
      };
      menuArr.push(menuObj);
    });
    return menuArr;
  }

  const ims = Menu.getApplicationMenu() as Menu;
  return menu(ims.items);
}
