import type { PluginOption } from 'vite';
const fetch = (...args: [string, object]) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { join } = path;
const FormData = require('form-data');
const archiver = require('archiver');
export default function viteUploadSourceMap(payload): PluginOption {
  const { appCode, appVersion, uploadUrl, removeSourceMap } = payload;
  const getAssetPath = (path: string, name: string) => {
    return join(path, name);
  };

  const zipSourceMaps = (_dirPath: string, sourceFileList: string[]) => {
    return new Promise((resolve, reject) => {
      const outPath = _dirPath;
      const zipFilePath = join(outPath, '/sourceMaps.zip');
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', async () => {
        console.log(`总共 ${archive.pointer()} 字节`);
        console.log(
          'archiver完成文件的归档，文件输出流描述符已关闭',
          removeSourceMap,
        );
        if (removeSourceMap) {
          console.log('开始删除各个sourcemap文件');
          // 压缩完成删除对应的map文件
          await Promise.all(
            sourceFileList.map((sourceMap) => {
              const filePath = getAssetPath(outPath, sourceMap);
              return fsPromises.unlink(filePath);
            }),
          );
          console.log('删除各个sourcemap文件成功');
        }
        resolve(zipFilePath);
      });
      archive.on('error', function (err) {
        throw err;
      });
      archive.pipe(output);
      sourceFileList.forEach((sourceMap) => {
        archive.file(getAssetPath(outPath, sourceMap), { name: sourceMap });
      });
      archive.finalize();
    });
  };

  const uploadSourceMapZip = async (zipPath) => {
    const errMessage = `failed to upload ${zipPath}`;
    const sourceMapFilesZip = fs.createReadStream(zipPath);
    const form = new FormData();
    form.append('projectCode', appCode);
    form.append('projectVersion', appVersion);
    form.append('sourceMapFilesZip', sourceMapFilesZip);
    let res;
    try {
      res = await fetch(uploadUrl, {
        method: 'POST',
        body: form,
      });
    } catch (err) {
      console.log('发送文件失败err===', err);
      throw errMessage;
    }
    let body;
    if (res.ok) {
      body = await res.json();
      if (body.retcode === 200) {
        console.log('上传成功');
        return await fsPromises.unlink(zipPath);
      }
    }
    const details =
      (body && body.retdesc) || `${res.status} - ${res.statusText}`;
    throw new Error(`${errMessage}: ${details}`);
  };
  // const getAllFile = function (dir) {
  //   const res: string[] = [];
  //   function traverse(dir) {
  //     fs.readdirSync(dir).forEach((file) => {
  //       const pathname = join(dir, file);
  //       if (fs.statSync(pathname).isDirectory()) {
  //         traverse(pathname);
  //       } else {
  //         res.push(pathname);
  //       }
  //     });
  //   }
  //   traverse(dir);
  //   return res;
  // };
  return {
    // 插件名称
    name: 'vite-plugin-upload-sourcemap',

    // pre 会较于 post 先执行
    enforce: 'post', // post

    // 指明它们仅在 'build' 或 'serve' 模式时调用
    apply: 'build', // apply 亦可以是一个函数

    // vite 独有的钩子：在解析 vite 配置后调用。使用这个钩子读取和存储最终解析的配置。当插件需要根据运行的命令做一些不同的事情时，它很有用。
    configResolved(resolvedConfig) {
      if (!resolvedConfig.build.sourcemap) {
        throw new Error('vite config: build.sourcemap must be true');
      }
    },
    // 输出阶段钩子通用钩子：在调用 bundle.write后，所有的chunk都写入文件后，最后会调用一次 writeBundle
    async writeBundle(options) {
      const _dirPath = options.dir;
      fs.readdir(_dirPath + '/assets', async (err, files) => {
        if (err) {
          throw err;
        }
        const sourceFile = files
          .filter((file) => /\.js\.map$/.test(file))
          .map((file) => `/assets/${file}`);
        console.log(sourceFile);
        if (sourceFile.length > 0 && _dirPath) {
          const zipPath = await zipSourceMaps(_dirPath, sourceFile);
          await uploadSourceMapZip(zipPath);
        } else {
          throw new Error('未查询到sourcemap文件或输入路径异常');
        }
      });
    },
  };
}
