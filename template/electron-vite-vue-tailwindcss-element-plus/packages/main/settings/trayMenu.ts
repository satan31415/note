import path from 'path';
import type { App, BrowserWindow } from 'electron';
import { Menu, Tray } from 'electron';
import AutoLaunch from 'easy-auto-launch';
import Store from 'electron-store';
import { log } from '../index';

export let tray: Tray | null = null;

const store = new Store();

const focusWindow = (mainWindow: BrowserWindow) => {
  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }
  mainWindow.focus();
};

const buildMenu = (mainWindow: BrowserWindow, app: App) => {
  const alwaysOnTop = store.get('alwaysOnTopStore', false) as boolean;
  const autoLaunchEnabled = store.get('autoLaunchEnabledStore', false) as boolean;
  const mainAppName = process.env.MAIN_APP_NAME as string;

  return Menu.buildFromTemplate([
    {
      label: '打开',
      type: 'normal',
      click: async () => {
        focusWindow(mainWindow);
        // 也可以看一些其他事情，比如：
        // mainWindow.webContents.send("open");
      },
    },
    {
      label: '测试主线程给 UI 层发信息',
      type: 'normal',
      click: async () => {
        mainWindow.webContents.send('mainWindowToRendererTestMessage', '这是从主线程发过去的信息');
      },
    },
    {
      label: '置顶窗口',
      type: 'checkbox',
      checked: alwaysOnTop,
      click: (menuItem) => {
        store.set('alwaysOnTopStore', menuItem.checked);
        mainWindow.setAlwaysOnTop(menuItem.checked);
      },
    },
    {
      label: '开机启动',
      type: 'checkbox',
      checked: autoLaunchEnabled,
      click: async (menuItem) => {
        store.set('autoLaunchEnabledStore', menuItem.checked);
        const autoLauncher = new AutoLaunch({ name: mainAppName });
        if (menuItem.checked) {
          autoLauncher.enable();
        } else {
          autoLauncher.disable();
        }
      },
    },
    {
      label: '退出',
      type: 'normal',
      click: async () => {
        app.exit();
      },
    },
  ]);
};

export default function createTray(mainWindow: BrowserWindow, app: App) {
  const contextMenu = buildMenu(mainWindow, app);

  // 根据存储的配置设置窗口置顶
  const alwaysOnTop = store.get('alwaysOnTopStore', false) as boolean;
  mainWindow.setAlwaysOnTop(alwaysOnTop);

  // 根据存储的配置设置开机启动
  const mainAppName = process.env.MAIN_APP_NAME as string;
  const autoLaunchEnabled = store.get('autoLaunchEnabledStore', false) as boolean;
  const autoLauncher = new AutoLaunch({ name: mainAppName });
  if (autoLaunchEnabled) {
    // 启用开机启动
    autoLauncher.isEnabled()
    .then(function(isEnabled){
      if(isEnabled){
        return;
      }
      autoLauncher.enable();
    })
    .catch(function(err){
      log.error(`Error AutoLaunch enable exec: ${err}`);
    });
  } else {
    // 禁用开机启动
    autoLauncher.isEnabled()
    .then(function(isEnabled){
      if(isEnabled){
        autoLauncher.disable();
      }
    })
    .catch(function(err){
      log.error(`Error AutoLaunch disable exec: ${err}`);
    });
  }

  // mac 下只能使用 16x16 不然在状态栏那边会显得很大
  let imagePath = '../../buildResources/16x16/favicon.png';
  if (process.env.NODE_ENV === 'production') {
    imagePath = '../renderer/icons/16x16/favicon.png';
  }
  tray = new Tray(path.resolve(__dirname, imagePath));


  tray.setToolTip('这是提示语句');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    focusWindow(mainWindow);
  });
}
