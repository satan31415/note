import { ipcMain } from 'electron';


export default class SimpleTestHandle {
  static listen() {
    ipcMain.handle('simpleTestHandleGetMessageTestInvoke', async (event, message) => {
      // 主线程的日志只会在 webstorm 控制台打印出来，devTools 不会打印
      console.log('SimpleTestHandle 收到信息=' + message);
      return '这是主线程 SimpleTestHandle 收到信息后返回的信息';
    });
  }

}
