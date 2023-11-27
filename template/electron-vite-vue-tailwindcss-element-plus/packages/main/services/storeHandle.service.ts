import { ipcMain } from 'electron';

import Store from 'electron-store';

const store = new Store();

export default class StoreHandle {
  static listen() {
    // 内容存储到 app.getPath('userData') 的 config.json 中
    ipcMain.handle('electronStoreGetInvoke', async (event, key) => {
      // 主线程的日志只会在 webstorm 控制台打印出来，devTools 不会打印
      return event.returnValue = store.get(key);
    });
    ipcMain.handle('electronStoreSetInvoke', (event, key, val) => {
      return store.set(key, val);
    });
  }

}
