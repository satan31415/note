import { ipcMain } from 'electron';
import fs from 'fs-extra';

export default class ReadBrowserBookmarkHandle {
  static listen() {
    ipcMain.handle('readBrowserBookmarkInvoke', (event) => {
      return this.readBrowserBookmarkInvoke();
    });
  }


  static async readBrowserBookmarkInvoke(): Promise<string | null> {
    // zchtodo todo 后续可以支持 linux，并且支持其他多个浏览器
    const isWindows = process.platform === 'win32';
    const isMac = process.platform === 'darwin';
    let bookmarksPath = '';
    let defaultBrowserName = '';

    // 获取默认浏览器的名称和路径
    if (isWindows) {
      // 询默认浏览器的 ProgId，然后查询 ProgId 对应的可执行文件路径。注意，这个方法可能会因为不同的 Windows 版本和系统设置而有所不同，所以建议在不同的 Windows 系统上进行测试。
      const Winreg = require('winreg');
      try {
        const userChoiceKey = new Winreg({ hive: Winreg.HKCU, key: '\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice' });
        userChoiceKey.get('ProgId', (error: any, progIdValue: any) => {
          if (error) {
            console.error('Failed to get ProgId:', error);
            return;
          }

          const progId = progIdValue.value;
          const executableKey = new Winreg({ hive: Winreg.HKCR, key: `\\${progId}\\shell\\open\\command` });
          executableKey.get('', (error: any, commandValue: any) => {
            if (error) {
              console.error('Failed to get command:', error);
              return;
            }

            const command = commandValue.value;
            // 数据示例："C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --single-argument %1
            // 数据示例："C:\Program Files\Google\Chrome\Application\chrome.exe" --single-argument %1
            console.log(command);
            const regex = /"([^"]*)"/; // 匹配双引号内的内容
            const match = command.match(regex);
            const browserPath = match ? match[1] : command.split(' ')[0];
            const browserName = browserPath.split('\\').pop().split('.')[0];
            defaultBrowserName = browserName;
            console.log(`Default browser path: ${browserPath}`);
            console.log(`Default browser name: ${browserName}`);
          });
        });
      } catch (error) {
        console.error('Failed to get default browser on Windows:', error);
      }
    } else {
      // macOS 和 linux 系统下方法（zchtodo todo 还没测试过）
      // 输出格式：Microsoft Edge
      const defaultBrowser = require('default-browser');
      let browser = await defaultBrowser();
      defaultBrowserName = browser.name;
      console.log(`Default browser: ${browser.name}`);

    }

    // zchtodo todo 在 windows 上没办法获取到默认浏览器的名称，因为上面读取注册表的方式是异步的，这里有时候会先执行下面的代码，导致获取不到默认浏览器的名称
    if (!defaultBrowserName) {
      console.error('Could not determine defaultBrowserName');
      return null;
    }

    defaultBrowserName = defaultBrowserName.toLowerCase();

    // 只支持 chrome 和 edge 浏览器
    if (isWindows) {
      // 不可以写成：process.env.LOCALAPPDATA，不然拿到的是 undefined
      const localAppDataPath = process.env['LOCALAPPDATA'];
      // console.log(JSON.stringify(process.env, null, 2));
      if (!localAppDataPath) {
        return null;
      }

      if (defaultBrowserName.includes('chrome')) {
        bookmarksPath = `${localAppDataPath}\\Google\\Chrome\\User Data\\Default\\Bookmarks`;
      }
      if (defaultBrowserName.includes('edge')) {
        // zchtodo todo 这个还没测试过，并且这里还有一个问题是，如果是 Edge Dev 的路径跟这里也不一样，没办法到时候要提示用户只支持正式版，或者获取不到，让用户自己填写路径
        bookmarksPath = `${localAppDataPath}\\Microsoft\\Edge\\User Data\\Default\\bookmarks`;
      }
    } else if (isMac) {
      // 全部测试通过
      if (defaultBrowserName.includes('chrome')) {
        bookmarksPath = `${process.env['HOME']}/Library/Application Support/Google/Chrome/Default/Bookmarks`;
      }
      if (defaultBrowserName.includes('edge')) {
        bookmarksPath = `${process.env['HOME']}/Library/Application Support/Microsoft Edge/Default/Bookmarks`;
      }
    }

    // zchtodo todo 这里在 windows 上会有问题，因为 windows 里面的方法是异步的，可能会先执行到这里，导致 bookmarksPath 为空
    console.log('bookmarksPath=' + bookmarksPath);
    if (!bookmarksPath) {
      console.error('Could not determine bookmarks path.');
      return null;
    }

    try {
      const bookmarksData = await fs.readFile(bookmarksPath, 'utf8');
      const bookmarksJson = JSON.parse(bookmarksData);
      return bookmarksJson;
    } catch (error) {
      console.error(`Error reading bookmarks file: ${error}`);
      return null;
    }
  }


}
