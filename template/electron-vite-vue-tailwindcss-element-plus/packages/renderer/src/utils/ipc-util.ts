/** 与主进程通信相关方法 */
import { ipcRenderer } from 'electron';

/** 获取用户目录 */
export const getUserDataFullPathInvoke = async () => {
  return await ipcRenderer.invoke('getUserDataFullPathInvoke');
};


export const sendMessageToMainWindowInvoke = async () => {
  return await ipcRenderer.invoke('simpleTestHandleGetMessageTestInvoke', '这是来自 UI 层发送的消息');
};


export const openDirectoryInvokeToMainWindow = async (path: string) => {
  await ipcRenderer.invoke('openDirectoryInvoke', path);
};

export const openHtmlFileByDefaultBrowserInvokeToMainWindow = async (path: string) => {
  await ipcRenderer.invoke('openHtmlFileByDefaultBrowserInvoke', path);
};

export const openUrlByDefaultBrowserInvokeToMainWindow = async (path: string) => {
  await ipcRenderer.invoke('openUrlByDefaultBrowserInvoke', path);
};


export const sendReadOneFolderToMainWindowInvoke = async (path: string) => {
  return await ipcRenderer.invoke('readOneFolderInvoke', path);
};

export const sendReadRecursionFolderToMainWindowInvoke = async (path: string) => {
  return await ipcRenderer.invoke('readRecursionFolderInvoke', path);
};

export const sendSimpleDownloadToMainWindowInvoke = async (imageUrl: string, savePath: string) => {
  return await ipcRenderer.invoke('simpleDownloadInvoke', imageUrl, savePath);
};

export const sendShellExecToMainWindowInvoke = async (imageUrl: string, savePath: string) => {
  return await ipcRenderer.invoke('shellExecInvoke', imageUrl, savePath);
};

export const generateMultipleResolutionImagesInvokeToMainWindow = async (imagePath: string, savePath: string, widthHeightListJsonString: string, fileSuffix: string) => {
  return await ipcRenderer.invoke('generateMultipleResolutionImagesInvoke', imagePath, savePath, widthHeightListJsonString, fileSuffix);
};

export const sendReadBrowserBookmarkToMainWindowInvoke = async () => {
  return await ipcRenderer.invoke('readBrowserBookmarkInvoke');
};

export const electronStoreSetInvokeToMainWindow = async (key: string, value: string) => {
  await ipcRenderer.invoke('electronStoreSetInvoke', key, value);
};

export const electronStoreGetInvokeToMainWindow = async (key: string) => {
  return await ipcRenderer.invoke('electronStoreGetInvoke', key);
};

export const getHomeDirInvokeToMainWindow = async () => {
  return await ipcRenderer.invoke('getHomeDirInvoke');
};

export const loadDirectoryInvokeToMainWindow = async () => {
  return await ipcRenderer.invoke('loadDirectoryInvoke');
};

export const loadFileInvokeToMainWindow = async () => {
  return await ipcRenderer.invoke('loadFileInvoke');
};

export const loadFileFullPathInvokeToMainWindow = async () => {
  return await ipcRenderer.invoke('loadFileFullPathInvoke');
};

export const sendProcessLargeFileInvoke = async () => {
  let imageUrl = 'E:\\golang_projects\\logtest.txt';
  let savePath = 'E:\\golang_projects\\logtest2.txt';
  return await ipcRenderer.invoke('processLargeFileInvoke', imageUrl, savePath);
};


/*输出 snap2html 格式 start*/
export const sendReadAllFolderInvokeToMainWindowInvoke = async (scanFullDirPath: string, saveFullDirPath: string) => {
  const jsonString = await ipcRenderer.invoke('readAllFolderInvoke', scanFullDirPath, saveFullDirPath);
  return jsonString;
};
/*输出 snap2html 格式 end*/


