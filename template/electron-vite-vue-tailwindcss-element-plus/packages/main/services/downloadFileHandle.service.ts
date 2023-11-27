import { app, BrowserWindow, ipcMain, DownloadItem } from 'electron';
import { download } from 'electron-dl';

let downloadItem: DownloadItem | undefined;

export default class DownloadFileHandle {
  static listen() {
    ipcMain.handle('downloadFileCancelInvoke', (event) => {
      if (downloadItem){
        console.log('按钮触发取消下载任务');
        downloadItem.cancel();
      }
      return;
    });

    ipcMain.handle('downloadFileStartInvoke', (event, params) => {
      // 主线程的日志只会在 webstorm 控制台打印出来，devTools 不会打印
      console.log('get downloadUrl=' + params);

      const mainWindow = BrowserWindow.getFocusedWindow() as BrowserWindow;
      let downloadUrl = params.downloadUrl;

      if (!(downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://'))) {
        mainWindow.webContents.send('downloadFileErrorToOn', {
          id: params.id,
          filename: params.filename,
          error: event,
        });
        return;
      }

      // todo 这里最好做个判断，如果没有目录传参数就报错
      let downloadFolder = params.downloadDirectoryPath;

      console.log('开始准备下载');

      download(mainWindow, downloadUrl, {
        filename: `${params.filename}`,
        directory: downloadFolder,
        onStarted(dlItem: DownloadItem) {
          downloadItem = dlItem;
          mainWindow.webContents.send('downloadFileProgressToOn', {
            id: params.id,
            filename: params.filename,
            totalBytes: dlItem.getTotalBytes(),
            downloadProgress: 0,
            downloadStatus: 'DOWNLOAD_STATUS_ENUM_START',
          });
        },
        onProgress(progress: any) {
          mainWindow.webContents.send('downloadFileProgressToOn', {
            id: params.id,
            filename: params.filename,
            downloadProgress: progress.percent * 100,
            downloadStatus: 'DOWNLOAD_STATUS_ENUM_PROGRESS',
          });
        },
        onCancel() {
          console.log('开始取消下载任务');
          mainWindow.webContents.send('downloadFileProgressToOn', {
            id: params.id,
            filename: params.filename,
            downloadProgress: 0,
            downloadStatus: 'DOWNLOAD_STATUS_ENUM_CANCEL',
          });
        },
      }).then(() => {
        // 下载成功
        mainWindow.webContents.send('downloadFileProgressToOn', {
          id: params.id,
          filename: params.filename,
          downloadProgress: 100,
          downloadStatus: 'DOWNLOAD_STATUS_ENUM_SUCCESS',
        });
      }).catch((err: any) => {
        // 下载失败
        console.log('无法下载文件，下载失败了');
        console.log('失败原因: ', err);
        mainWindow.webContents.send('downloadFileProgressToOn', {
          id: params.id,
          filename: params.filename,
          downloadProgress: 0,
          downloadStatus: 'DOWNLOAD_STATUS_ENUM_ERROR',
        });
      });
    });

  }


}
