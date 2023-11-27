import { dialog, ipcMain, app } from 'electron';
import fs from 'fs';

export default class FileHandle {
  static listen() {
    ipcMain.handle('saveAsFileInvoke', (event, editorData) => {
      return this.saveAsFileInvoke(editorData);
    });

    ipcMain.handle('openDirectoryInvoke', (event, dirFullPath) => {
      return this.openDirectoryInvoke(dirFullPath);
    });

    ipcMain.handle('openHtmlFileByDefaultBrowserInvoke', (event, dirFullPath) => {
      return this.openHtmlFileByDefaultBrowserInvoke(dirFullPath);
    });

    ipcMain.handle('openUrlByDefaultBrowserInvoke', (event, url) => {
      return this.openUrlByDefaultBrowserInvoke(url);
    });

    ipcMain.handle('saveFileInvoke', (event, filePath, editorData) => {
      return this.saveFileInvoke(filePath, editorData);
    });
    ipcMain.handle('getHomeDirInvoke', (event) => {
      return this.getHomeDirInvoke();
    });

    ipcMain.handle('getUserDataFullPathInvoke', async (event) => {
      // Mac OS: ~/Library/Application Support/你的app名字
      // Windows: C:\Users\你的用户名\AppData\Local\你的app名字
      // Linux: ~/.config/你的app名字
      console.log(app.getPath('userData'));
      return app.getPath('userData');
    });

    ipcMain.handle('loadFileInvoke', async () => {
      return this.loadFileInvoke();
    });

    ipcMain.handle('loadFileFullPathInvoke', async () => {
      return this.loadFileFullPathInvoke();
    });

    ipcMain.handle('loadDirectoryInvoke', async () => {
      return this.loadDirectoryInvoke();
    });
  }

  static saveAsFileInvoke(data: string) {
    const savePath = dialog.showSaveDialogSync({});
    if (savePath) {
      fs.writeFileSync(savePath, data);
    }
    return savePath;
  }

  static async openDirectoryInvoke(dirFullPath: string) {
    const { shell } = require('electron');
    await shell.openPath(dirFullPath);
  }

  static async openHtmlFileByDefaultBrowserInvoke(filePath: string) {
    const open = require('open');

    // 使用open包启动默认浏览器并打开文件，如果使用 await shell.openExternal(`file://${filePath}`); 打开中文文件会无法打开
    await open(filePath, { wait: false });
  }

  static async openUrlByDefaultBrowserInvoke(url: string) {
    const { shell } = require('electron');
    await shell.openExternal(url);
  }

  static saveFileInvoke(filePath: string, data: string) {
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, data);
    }
  }

  static async loadFileInvoke() {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
    });
    const content = fs.readFileSync(filePaths[0]).toString();

    return {
      path: filePaths[0],
      content,
    };
  }

  static async loadFileFullPathInvoke() {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
    });
    return filePaths[0];
  }

  static async loadDirectoryInvoke() {
    const dirFullPath = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return dirFullPath;
  }

  static getHomeDirInvoke() {
    const homedir = require('os').homedir();
    return homedir;
  }
}
