这是一个使用`MaoXian Web Clipper`[编程接口](https://mika-cn.github.io/maoxian-web-clipper/api-zh-CN.html#clipped)的油猴脚本，目的是为了在插件剪切时将剪切的内容同步到TiddlyWiki，赞美作者让我们有了更多的选择

## 使用步骤

1. 需要在插件的Advanced里勾选`Communicate with third party`
2. 安装油猴脚本maoxian-tiddlywiki.user.js
3. 对TiddlyWiki进行改造，让其支持本地图片

PS. 脚本只支持Markdown模式，所以插件的Storage需要选择Markdown

## 对TiddlyWiki的改造

使用之前要对TiddlyWiki做一些小小的改造，插件将图片保存为本地文件，而TiddlyWiki的路由目前不支持本地图片

>  node_modules/tiddlywiki/core/modules/server/server.js
```js
# Server.prototype.requestHandler下添加
    var inputPath = url.parse(request.url).pathname;
    var inputSplit = inputPath.lastIndexOf(".");
    if (inputSplit > 0 && inputPath.indexOf(":") < 0) {
        var fileSuffix = inputPath.substring(inputSplit + 1)
        if (fileSuffix == "jpg" || fileSuffix == "jpeg" || fileSuffix == "png" || fileSuffix == "gif" || fileSuffix == "bmp" || fileSuffix == "webp") {
            var imageFilePath = decodeURIComponent(inputPath.substr(1));
            try {
                fs.accessSync(imageFilePath, fs.constants.R_OK);
                response.writeHead(200, {"Content-Type": "image/"+fileSuffix});
                var imageStream = fs.createReadStream(imageFilePath);
                var responseData = [];
                if (imageStream) {
                    imageStream.on("data", function(chunk) {
                      responseData.push(chunk);
                    });
                    imageStream.on("end", function() {
                       var finalData = Buffer.concat(responseData);
                       response.write(finalData);
                       response.end();
                    });
                    return;
                }
            } catch (err) {
                $tw.utils.log("Local image: [" + imageFilePath + "] read failed, will use default router...");
            }
        }
    }

```

推荐在tiddlers的同级目录放一个images目录，然后将其软链为插件的资源目录

之后这个目录（有tiddlers和images的目录）执行`tiddlywiki --listen`即可
