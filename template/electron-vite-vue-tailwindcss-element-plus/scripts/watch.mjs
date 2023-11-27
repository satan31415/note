import {spawn} from 'child_process';
import {build, createServer} from 'vite';
import electron from 'electron';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import {fileURLToPath} from 'url';

const query = new URLSearchParams(import.meta.url.split('?')[1]);
const debug = query.has('debug');


/*日志输出处理 start*/
function electronLog(data, color) {
  if (data) {
    let log = '';
    data = data.toString().split(/\r?\n/);
    data.forEach(line => {
      log += `  ${line}\n`;
    });
    console.log(
      chalk[color].bold('┏ Electron -------------------') +
      '\n\n' +
      log +
      chalk[color].bold('┗ ----------------------------') +
      '\n',
    );
  }
}

/*日志输出处理 end*/

// 演示如何在开发时使用自动复制文件到指定目录（实际目前是不需要这样做的）
async function copyBin() {
  // url.fileURLToPath()函数会根据当前操作系统平台自动处理文件路径。在macOS和其他类Unix系统上，它会正确地处理URL对象的pathname属性，而在Windows上，它会移除多余的斜杠
  const basePath = fileURLToPath(new URL('../', import.meta.url));
  const srcDir = path.normalize(path.join(basePath, 'bin'));
  const destDir = path.normalize(path.join(basePath, 'dist', 'main', 'bin'));
  console.log('srcDir', srcDir);
  console.log('destDir', destDir);
  fs.existsSync(destDir) && fs.removeSync(destDir);
  await fs.copy(srcDir, destDir);
  console.log('bin directory copied to dist/main/bin');
}


function watchMain(server) {
  /**
   * @type {import('child_process').ChildProcessWithoutNullStreams | null}
   */
  let electronProcess = null;
  const address = server.httpServer.address();
  const env = Object.assign(process.env, {
    VITE_DEV_SERVER_HOST: address.address,
    VITE_DEV_SERVER_PORT: address.port,
  });
  /**
   * @type {import('vite').Plugin}
   */
  const startElectron = {
    name: 'electron-main-watcher',
    writeBundle() {
      electronProcess && electronProcess.kill();
      electronProcess = spawn(electron, ['.'], {stdio: 'inherit', env});

      electronLog('开始启动', 'blue');

    },
  };

  return build({
    configFile: 'packages/main/vite.config.ts',
    mode: 'development',
    plugins: [!debug && startElectron].filter(Boolean),
    build: {
      watch: {},
    },
  }).then(() => {
    // Vite 构建结束后，将 bin 目录复制到 dist/main 目录下
    // return copyBin();
  });
}

/**
 * @type {(server: import('vite').ViteDevServer) => Promise<import('rollup').RollupWatcher>}
 */
function watchPreload(server) {
  return build({
    configFile: 'packages/preload/vite.config.ts',
    mode: 'development',
    plugins: [{
      name: 'electron-preload-watcher',
      writeBundle() {
        server.ws.send({type: 'full-reload'});
      },
    }],
    build: {
      watch: {},
    },
  });
}

// bootstrap
const server = await createServer({configFile: 'packages/renderer/vite.config.ts'});

await server.listen();
await watchPreload(server);
await watchMain(server);
