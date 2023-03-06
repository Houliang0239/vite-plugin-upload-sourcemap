# vite-plugin-upload-sourcemap
一个vite插件用于上传sourcemap
> 如果您的团队需要sourcemap反解析堆栈，则可以使用此插件
> 当前仅支持接口上传
#### 使用

```
// vite.config
import viteUploadSourceMap from 'vite-plugin-upload-sourcemap';

const config = {
    ...,
    plugins: [
        ...,
        viteUploadSourceMap({
            appCode: code, // 应用标识
            appVersion: version, // 应用版本 
            uploadUrl: url, // 上传接口
            removeSourceMap: true,
        })
    ],
    ...
}

```


本地引入时，windows不支持link，需要改为file

对于@types/node模块，需要用以下命令
```
npm install @types/node -D
```

TODO：
- [ ] 自定义上传参数
- [ ] 支持自定义vite输出路径
- [ ] 支持ssh上传