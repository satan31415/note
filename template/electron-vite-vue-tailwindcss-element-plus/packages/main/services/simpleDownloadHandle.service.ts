import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export default class SimpleDownloadHandle {
  static listen() {
    ipcMain.handle('simpleDownloadInvoke', (event, imageUrl, savePath) => {
      console.log('simpleDownloadInvoke 收到信息=' + imageUrl);
      return this.simpleDownloadInvoke(imageUrl, savePath);
    });
  }


  static async simpleDownloadInvoke(imageUrl: string, savePath: string): Promise<string | null> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data, 'binary');
      const fileName = path.basename(imageUrl);
      const filePath = path.join(savePath, fileName);

      await fs.promises.writeFile(filePath, buffer);
      console.log(`Image saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error(`Error downloading image: ${error}`);
      return null;
    }
  }

}
