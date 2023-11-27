import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

export default class ReadFolderHandle {
  static listen() {
    ipcMain.handle('readOneFolderInvoke', (event, dirPath) => {
      console.log('readOneFolderInvoke 收到信息=' + dirPath);
      return this.readOneFolderInvoke(dirPath);
    });

    ipcMain.handle('readRecursionFolderInvoke', (event, dirPath) => {
      console.log('readRecursionFolderInvoke 收到信息=' + dirPath);
      return this.readRecursionFolderInvoke(dirPath);
    });
  }

  /**
   * 读取文件夹下的所有文件、文件夹（没有递归能力）
   * @param dirPath
   */
  static readOneFolderInvoke(dirPath: string) {
    return new Promise((resolve, reject) => {
      let results: any[] = [];
      fs.readdir(dirPath, (err, files) => {
        if (err) return reject(err);

        let pending = files.length;
        if (!pending) return resolve(results);

        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          fs.stat(filePath, (err, stat) => {
            if (stat && stat.isDirectory()) {
              results.push({ name: file, path: filePath, isDirectory: true });
            } else {
              results.push({ name: file, path: filePath, isDirectory: false });
            }
            if (!--pending) resolve(results);
          });
        });
      });
    });
  }

  /**
   * 支持递归读取文件夹下的所有文件、文件夹
   * @param dirPath
   */
  static async readRecursionFolderInvoke(dirPath: string) {
    let results: any[] = [];
    const readDir = async (dirPath: string) => {
      const files = await fs.promises.readdir(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.promises.stat(filePath);
        if (stat.isDirectory()) {
          results.push({ name: file, path: filePath, isDirectory: true });
          await readDir(filePath);
        } else {
          results.push({ name: file, path: filePath, isDirectory: false });
        }
      }
    };
    await readDir(dirPath);
    return results;
  }
}
