import { ipcMain } from 'electron';
import path from 'path';
import { log } from '../index';


export default class ShellExecHandle {
  static listen() {
    ipcMain.handle('shellExecInvoke', (event, inputPath, outputPath) => {
      console.log('shellExecInvoke 收到信息=' + inputPath);
      return this.shellExecInvoke(inputPath, outputPath);
    });
  }


  static async shellExecInvoke(inputPath: string, outputPath: string): Promise<string | null> {
    const shell = require('shelljs');

    try {
      // 使用 shelljs 调用二进制文件
      let binFile;
      switch (process.platform) {
        case 'win32':
          binFile = `text-replacer-${process.platform}.exe`;
          break;
        case 'darwin':
          const os = require('os');
          const arch = os.arch();
          if (arch === 'arm64') {
            binFile = `text-replacer-${process.platform}-${arch}`;
          } else {
            binFile = `text-replacer-${process.platform}`;
          }
          break;
        case 'linux':
          binFile = `text-replacer-${process.platform}`;
          break;
        default:
          console.error('Unsupported platform:', process.platform);
          return outputPath;
      }


      let binPath = path.join(__dirname, '../../', 'bin', binFile);
      log.info('binPath=' + binPath);

      // 先确定软件所在的执行目录
      shell.config.execPath = binPath;

      shell.exec(`${binPath} -input ${inputPath} -output ${outputPath}`);


      return binPath;
    } catch (error) {
      log.error(`Error shell exec: ${error}`);
      return null;
    }
  }

}
