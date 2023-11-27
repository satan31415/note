import { ipcMain } from 'electron';
import path from 'path';
import sharp from 'sharp';

export default class ImageHandle {
  static listen() {
    ipcMain.handle('generateMultipleResolutionImagesInvoke', (event, imagePath, savePath, widthHeightListJsonString, fileSuffix) => {
      console.log('generateMultipleResolutionImagesInvoke 收到信息=' + imagePath);
      return this.generateMultipleResolutionImagesInvoke(imagePath, savePath, widthHeightListJsonString, fileSuffix);
    });
  }

  static getFilenameWithoutExtension(path: string): string {
    // 获取路径中最后一个斜杠(/)或反斜杠(\)的位置
    const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    const filenameWithExtension = path.slice(lastSlashIndex + 1);

    // 获取文件名中最后一个点(.)的位置
    const lastDotIndex = filenameWithExtension.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // 如果没有点(.)，则返回原始文件名
      return filenameWithExtension;
    }

    // 返回不包含文件后缀的文件名
    return filenameWithExtension.slice(0, lastDotIndex);
  }

  // 截取图片中间分辨率部分，不是等比例缩放
  static async resizeImage(inputPath: string, outputPath: string, width: number, height: number): Promise<string> {
    try {
      await sharp(inputPath)
      .resize(width, height)
      .toFile(outputPath);
      console.log(`Image resized to ${width}x${height} and saved as ${outputPath}`);
    } catch (error) {
      console.error('Error resizing image:', error);
      return error + '';
    }
    return '';
  }

  // 等比例缩放图片
  static async resizeImage2(inputPath: string, outputPath: string, width: number, height: number): Promise<string> {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      const aspectRatio = metadata.width! / metadata.height!;
      let newWidth = width;
      let newHeight = height;

      if (aspectRatio > 1) {
        // Landscape orientation
        newHeight = Math.round(width / aspectRatio);
      } else {
        // Portrait orientation
        newWidth = Math.round(height * aspectRatio);
      }

      await image
      .resize(newWidth, newHeight)
      .toFile(outputPath);
      console.log(`Image resized to ${newWidth}x${newHeight} and saved as ${outputPath}`);
    } catch (error) {
      console.error('Error resizing image:', error);
      return error + '';
    }
    return '';
  }

  // 生成多分辨率图片，如果源图片小于指定的宽高，则会生成放大版的图片
  static async generateMultipleResolutionImagesInvoke(imagePath: string, savePath: string, widthHeightListJsonString: string, fileSuffix: string): Promise<string> {
    try {
      const filenameWithoutExtension = this.getFilenameWithoutExtension(imagePath);

      const sizes = [
        { width: 128, height: 128 },
        { width: 16, height: 16 },
      ];

      // const sizes = JSON.parse(widthHeightListJsonString);

      for (const size of sizes) {
        const outputPath = path.join(savePath, `${filenameWithoutExtension}_${size.width}x${size.height}.${fileSuffix}`);
        await this.resizeImage2(imagePath, outputPath, size.width, size.height);
      }
    } catch (error) {
      console.error(`Error resizing image.: ${error}`);
      return error + '';
    }
    return '';
  }

}
