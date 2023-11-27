// External imports
import { app, BrowserWindow, shell, ipcMain, Menu, dialog } from 'electron';
import { release } from 'os';
import { join } from 'path';
import axios from 'axios';
import * as log from 'electron-log';
import * as fs from 'fs-extra';
import * as path from 'path';

// Local imports
import FileHandle from './services/fileHandle.service';
import SimpleTestHandle from './services/simpleTestHandle.service';
import StoreHandle from './services/storeHandle.service';
import { onAppMenu, createAppMenu } from './settings/applicationMenu';
import createTray from './settings/trayMenu';
import DownloadFileHandle from './services/downloadFileHandle.service';
import ReadFolderHandle from './services/readFolderHandle.service';
import SimpleDownloadHandle from './services/simpleDownloadHandle.service';
import ReadBrowserBookmarkHandle from './services/readBrowserBookmarkHandle.service';
import ShellExecHandle from './services/shellExecHandle.service';
import ReadAllFolderHandle from './services/readAllFolderHandle.service';
import ImageHandle from './services/ImageHandle.service';

// Windows 7 中禁用GPU加速功能
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

// 保证单例应用，大部分时候我们需要仅打开一个实例，并且再次点击启动只是激活已经打开的应用而不是再开一个新的应用
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow: BrowserWindow | null = null;

onAppMenu();

let iconImagePath = '../../buildResources/128x128/favicon.png';
if (process.env.NODE_ENV === 'production') {
  iconImagePath = '../renderer/icons/128x128/favicon.png';
}
const iconImageObj = join(__dirname, iconImagePath);

async function createWindow() {
  const mainAppName = process.env.MAIN_APP_NAME;
  const windowOptions = {
    title: mainAppName,
    // 窗口永远置顶
    alwaysOnTop: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      // 可以让渲染进程中使用NodeJS api
      nodeIntegration: true,
      contextIsolation: false,
      // 为 false 表示禁用同源策略，可以跨域，安全性会降低，但是方便
      webSecurity: false,
      // 在一个 HTTPS 页面内访问 HTTP 协议提供的服务了，当开发者把 webSecurity 设置为 false 时，allowRunningInsecureContent 也会被自动设置为 true
      allowRunningInsecureContent: true,
      // 在macos中启用橡皮动画
      scrollBounce: process.platform === 'darwin',
      devTools: process.env.NODE_ENV === 'development',
    },
    // 该属性只对 win/linux 有效，mac 下面会处理
    icon: iconImageObj,
    width: 1300,
    height: 700,
    frame: true,
    resizable: true,
    transparent: false,
    backgroundColor: 'rgb(168,166,166)',
  };

  mainWindow = new BrowserWindow(windowOptions);

  if (process.platform === 'darwin') {
    // mac 的 dock 图标专门设置
    app.dock.setIcon(iconImageObj);
  }

  if (app.isPackaged) {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  } else {
    // Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`;

    mainWindow.loadURL(url);
    mainWindow.webContents.openDevTools();
  }

  // Test active push message to Renderer-process
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // 监控所有 <a href="https://www.xxxx.com" target="_blank"> 必须是 _blank 才会触发，使用系统默认浏览器打开，而不会在electron中打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}



async function checkForUpdates() {
  const baseUrl = process.env.MAIN_APP_REQUEST_BASE_URL;
  const currentVersionNum = process.env.MAIN_APP_CURRENT_VERSION_NUM;
  const s1 = process.env.MAIN_APP_S1;

  try {
    // 从服务器获取最新版本号
    const res = await axios.post(`${baseUrl}/multiapi/open/versionUpdate`, {
      v1: currentVersionNum,
      s1: s1,
    });
    if (res.data && res.data.data && res.data.data.versionNumber) {
      const dataObj = res.data.data;
      let latestVersionNum = dataObj.versionNumber + '';
      if (latestVersionNum === currentVersionNum) {
        // 版本是最新的，不需要更新
      } else {
        // 版本不是最新的
        const dialogOpts = {
          type: 'info',
          buttons: ['下载'],
          title: '应用更新',
          message: '检测到新版本，请更新',
        };
        const returnValue = await dialog.showMessageBox(mainWindow!, dialogOpts);
        if (returnValue.response === 0) {
          shell.openExternal(dataObj.downloadPageUrl);
          app.quit();
        }
      }
    } else {
      // 没有获取到最新版本号，提示：更新版本发生错误，请联系管理员
      const errorDialogOpts = {
        type: 'error',
        buttons: ['确定'],
        title: '检查更新失败',
        message: '更新版本发生错误，请联系管理员',
        detail: '请稍后重试，或者访问官方网站以获取更多信息。',
      };
      const returnValue = await dialog.showMessageBox(mainWindow!, errorDialogOpts);
      if (returnValue.response === 0) {
        app.quit();
      }
    }
  } catch (error) {
    console.error('检查更新时出错:', error);
    const errorDialogOpts = {
      type: 'error',
      buttons: ['确定'],
      title: '检查更新失败',
      message: '在检查更新时遇到了一个错误，请联系管理员。',
      detail: '请稍后重试，或者访问官方网站以获取更多信息。',
    };
    const returnValue = await dialog.showMessageBox(mainWindow!, errorDialogOpts);
    if (returnValue.response === 0) {
      app.quit();
    }
  }
}


function registerEventListeners(){
  // app.whenReady().then(createWindow)
  app.on('ready', () => {
    // 设置app菜单
    Menu.setApplicationMenu(createAppMenu());

    // 创建窗口 mainWindow 对象
    createWindow();

    if (mainWindow) {
      // 创建托盘菜单
      createTray(mainWindow, app);

      // 检查更新，如果有更新，会弹出提示框
      checkForUpdates();
    }

    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他打开的窗口，那么程序会重新创建一个窗口。
    app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
  });


  app.on('window-all-closed', () => {
    // mainWindow = null
    // if (process.platform !== 'darwin') {
    //   app.quit();
    // }
    app.quit();
  });

  app.on('second-instance', () => {
    if (mainWindow) {
      // Focus on the main window if the user tried to open another
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
      allWindows[0].focus();
    } else {
      createWindow();
    }
  });

  ipcMain.on('quit', () => {
    app.quit();
  });
}

/*设置日志输出框架 start*/
// 设置日志文件的路径
app.setPath('logs', app.getPath('userData') + '/logs');
log.transports.file.resolvePath = () => {
  return app.getPath('logs') + '/myAppLog_' + new Date().toLocaleDateString() + '_day_log.log';
};
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
// 设置日志文件最大大小为 10MB
log.transports.file.maxSize = 10 * 1024 * 1024;


// 设置日志文件的最大数量为5
const maxFiles = 5;

// 按照时间从新到旧对日志文件进行排序
function sortByModifiedTime(a: string, b: string) {
  return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
}

// 删除多余的日志文件
function removeOldLogFiles(directory: string) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      log.error('Error reading log directory:', err);
      return;
    }

    const logFiles = files.filter(file => file.endsWith('_day_log.log')).map(file => path.join(directory, file));

    if (logFiles.length > maxFiles) {
      logFiles.sort(sortByModifiedTime);

      for (let i = maxFiles; i < logFiles.length; i++) {
        fs.unlink(logFiles[i], (err) => {
          if (err) {
            log.error('Error deleting log file:', err);
          } else {
            log.info('Deleted old log file:', logFiles[i]);
          }
        });
      }
    }
  });
}

// 获取日志文件目录
const logFile = log.transports.file.getFile();
const logDir = path.dirname(path.join(logFile.path, ''));

// 在应用启动时执行日志文件清理
removeOldLogFiles(logDir);

// 导出 log 模块，以便其他文件可以使用
export { log };
/*设置日志输出框架 end*/


registerEventListeners();

FileHandle.listen();
SimpleTestHandle.listen();
StoreHandle.listen();
ReadFolderHandle.listen();
ReadBrowserBookmarkHandle.listen();
ShellExecHandle.listen();
SimpleDownloadHandle.listen();
DownloadFileHandle.listen();
ReadAllFolderHandle.listen();
ImageHandle.listen();

