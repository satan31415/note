import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as util from 'util';
import path from 'path';
const moment = require('moment');
import { log } from '../index';
import os from 'os';


class DataObject {
  constructor(
    public parentPath: string,
    public pathUrl: string,
    public fileInfo: string,
    public indexNumber: number,
    public showValue?: string,
  ) {
  }
}

interface DirObjectInfo {
  path: string | null;
  parentPath: string;
  totalSize: number;
  lastModifyTime: number;
  isDirectory: boolean;
  fileList: DirObjectInfo[];
}

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const separatorSymbol = '@#@';

export default class ReadAllFolderHandle {
  static listen() {
    ipcMain.handle('readAllFolderInvoke', async (event, scanFullDirPath: string, saveFullDirPath: string) => {
      console.log('readAllFolderInvoke 收到信息 scanFullDirPath=' + scanFullDirPath);
      console.log('readAllFolderInvoke 收到信息 saveFullDirPath=' + saveFullDirPath);

      try {
        const dirInfo = await this.getDirectoryFileList(scanFullDirPath);
        const outputString = this.convertDirFileListToString(dirInfo);
        const newContent = this.buildSnap2HtmlString(outputString);

        let scanFullDirName = path.basename(scanFullDirPath);
        if (scanFullDirName.trim() === '') {
          // 获取盘符作为默认名称
          scanFullDirName = path.parse(scanFullDirPath).root;
          scanFullDirName = scanFullDirName.replace(':\\', '');
        }

        // 使用 moment.js 获取包含毫秒的时间字符串
        const currentDate = moment().format('YYYYMMDDHHmmssSSS');
        let saveFileName = 'Backup2HTML_' + scanFullDirName + '_' + currentDate;

        const outputFilename = `${saveFileName}.html`; // 指定新文件名
        const outputFilePath = path.join(saveFullDirPath, outputFilename);

        await this.generateFinalHtmlFile(saveFullDirPath, outputFilePath, newContent);
        return outputFilePath;
      } catch (error) {
        console.error(`read all error: ${error}`);
        return saveFullDirPath;
      }
    });
  }


  static sanitizeFileName(fileName: string): string {
    // 使用正则表达式删除文件名中的换行符和回车符
    fileName = fileName.replace(/[\r\n]/g, '');
    // 删除文件名中的双引号
    fileName = fileName.replace(/"/g, '');
    return fileName;
  }

  static async getDirectoryFileList(dirPath: string, parentPath = '',  fileCounter = { count: 0 }, fileLimit = 10 * 10000): Promise<DirObjectInfo> {
    try {
      // 限制扫描数量，太多会报：ERROR:node_bindings.cc(143)] Fatal error in V8: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
      if (fileCounter.count > fileLimit) {
        console.error(`File limit exceeded: ${fileLimit}`);
        return {
          path: null,
          parentPath,
          totalSize: 0,
          lastModifyTime: 0,
          isDirectory: true,
          fileList: [],
        };
      }

      const stats = await stat(dirPath);
      const entries = await readdir(dirPath, { withFileTypes: true });

      const dirInfo: Promise<DirObjectInfo>[] = entries.map(async (entry: any) => {
        // 忽略以点（.）开头的隐藏文件和文件夹
        let fileName = entry.name;
        let fullPath = path.join(dirPath, fileName);
        const entryStats = await stat(fullPath);

        // 使用正则表达式删除文件名中的换行符和回车符（unix 系统下它们是合法的命名）避免导出的 html 报错
        fileName = this.sanitizeFileName(fileName);
        fullPath = path.join(dirPath, fileName);

        // 忽略隐藏文件
        if (os.platform() === 'win32') {
          // const FILE_ATTRIBUTE_HIDDEN = 0x2;
          // const entryStats = await fs.promises.stat(entry);
          // const isHidden = (entryStats.mode & FILE_ATTRIBUTE_HIDDEN) !== 0;
          // if (isHidden) {
          //   return {
          //     path: null,
          //     parentPath,
          //     totalSize: 0,
          //     lastModifyTime: 0,
          //     isDirectory: true,
          //     fileList: [],
          //   };
          // }
        } else {
          // 其他系统（如 macOS）：检查文件名是否以点（.）开头
          if (fileName.startsWith('.')) {
            return {
              path: null,
              parentPath,
              totalSize: 0,
              lastModifyTime: 0,
              isDirectory: true,
              fileList: [],
            };
          }
        }

        if (entry.isDirectory()) {
          fileCounter.count++;
          return {
            path: fullPath,
            parentPath: dirPath,
            totalSize: 0,
            lastModifyTime: Math.floor(entryStats.mtimeMs / 1000),
            isDirectory: true,
            fileList: (await this.getDirectoryFileList(fullPath, dirPath, fileCounter, fileLimit)).fileList,
          };
        } else {
          return {
            path: fullPath,
            parentPath: dirPath,
            totalSize: entryStats.size,
            lastModifyTime: Math.floor(entryStats.mtimeMs / 1000),
            isDirectory: false,
            fileList: [],
          };
        }
      });

      return {
        path: dirPath,
        parentPath,
        totalSize: 0,
        lastModifyTime: Math.floor(stats.mtimeMs / 1000),
        isDirectory: true,
        fileList: await Promise.all(dirInfo),
      };
    } catch (error) {
      console.error(`scan dir error: ${error}`);
      return {
        path: null,
        parentPath,
        totalSize: 0,
        lastModifyTime: 0,
        isDirectory: true,
        fileList: [],
      };
    }
  }

  static convertDirFileListToString(entry: DirObjectInfo): string {
    let output = '';

    function processEntry(entry: DirObjectInfo, parentPath: string): void {
      if (!entry.path) {
        return;
      }
      let normalizedEntryPath = entry.path.split('\\').join('/');
      let normalizedParentPath = parentPath.split('\\').join('/');
      let pathInfo = `${normalizedParentPath}${separatorSymbol}${normalizedEntryPath}`;
      if (entry.isDirectory) {
        let subFilesInfo = entry.fileList
        .filter((file) => !file.isDirectory)
        .map((file) => `"${file.path!.split('\\').join('/').split('/').pop()}*${file.totalSize}*${file.lastModifyTime}"`)
        .join(',');

        let totalSize = entry.fileList
        .filter((file) => !file.isDirectory)
        .reduce((sum, file) => sum + file.totalSize, 0);

        let separator = subFilesInfo ? ',' : '';
        output += `${pathInfo}${separatorSymbol}D.p(["${normalizedEntryPath}*0*${entry.lastModifyTime}"${separator}${subFilesInfo},${totalSize}])\n`;

        entry.fileList
        .filter((file) => file.isDirectory)
        .forEach((subDir) => processEntry(subDir, entry.path!));
      } else {
        output += `${pathInfo}${separatorSymbol}D.p(["${normalizedEntryPath}*${entry.totalSize}*${entry.lastModifyTime}",${entry.totalSize}])\n`;
      }
    }

    processEntry(entry, 'NULL');
    return output.trim();
  }

  static buildSnap2HtmlString(content = ''): string {
    if (content.trim() === '') {
      return '';
    }
    const strings = content.split('\n');
    if (strings.length === 0) {
      return '';
    }

    let topPath = '';

    const dataObjectList: DataObject[] = [];
    for (let i = 0; i < strings.length; i++) {
      const strings1 = strings[i].trim().split(`${separatorSymbol}`);
      if (strings1.length === 0) {
        continue;
      }
      dataObjectList.push(new DataObject(strings1[0], strings1[1], strings1[2], i));
    }

    const parentMap: Record<string, number[]> = {};
    for (const dataObj of dataObjectList) {
      if (dataObj.parentPath === 'NULL') {
        topPath = dataObj.pathUrl;
        dataObj.showValue = '';
      } else {
        if (!parentMap[dataObj.parentPath]) {
          parentMap[dataObj.parentPath] = [dataObj.indexNumber];
        } else {
          parentMap[dataObj.parentPath].push(dataObj.indexNumber);
        }
      }
    }

    for (const dataObj of dataObjectList) {
      const integerList = parentMap[dataObj.pathUrl];
      if (integerList && integerList.length > 0) {
        dataObj.showValue = integerList.join('*');
      } else {
        dataObj.showValue = '';
      }
    }

    let concatenatedResults = '';
    for (const dataObj of dataObjectList) {
      let result = `${dataObj.fileInfo.slice(0, -2)},"${dataObj.showValue}"])`;
      concatenatedResults += result + '\n';
    }
    return concatenatedResults;
  }

  static async generateFinalHtmlFile(dirPath: string, outputFilePath: string, newContent = '') {
    /*读取模板文件 start*/
    let snap2HtmlTemplate = '../../mainResources/template.html';
    const snap2HtmlTemplatePath = path.join(__dirname, snap2HtmlTemplate);
    let fileContent = fs.readFileSync(snap2HtmlTemplatePath, 'utf8');
    let newFileContent = fileContent.replace('[DIR DATA]', newContent);
    newFileContent = newFileContent.replace('[SOURCE ROOT]', dirPath);
    const outputDirectory = dirPath; // 指定输出目录
    if (!fs.existsSync(outputDirectory)) {
      // 检查输出目录是否存在，如果不存在，则创建
      fs.mkdirSync(outputDirectory);
    }
    if (fs.existsSync(outputFilePath)) {
      // 检查输出目录是否存在，如果不存在，则创建
      fs.rmSync(outputFilePath);
    }
    // 将新文件内容写入到指定目录的新文件中
    fs.writeFileSync(outputFilePath, newFileContent, 'utf8');
    /*读取模板文件 end*/
  }


}
