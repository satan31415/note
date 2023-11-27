import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Worker } from 'worker_threads';

export default class TextFileProcessorHandle {
  static listen() {
    ipcMain.handle('processLargeFileInvoke', (event, inputFilePath, outputFilePath) => {
      console.log('processLargeFileInvoke 收到信息1=' + inputFilePath);
      console.log('processLargeFileInvoke 收到信息2=' + outputFilePath);
      return this.processLargeFileInvoke(inputFilePath, outputFilePath);
    });
  }

  static async processLargeFileInvoke(inputFilePath: string, outputFilePath: string): Promise<boolean> {
    try {

      return true;
    } catch (error) {
      console.error(`Error processing large file: ${error}`);
      return false;
    }
  }
}
