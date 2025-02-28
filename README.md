# figma-parser
Figma解析工具集，支持解析Figma文件中的组件、样式、图层等信息


## Getting started
```bash
npm install figma-to-html
```

## Usage

```ts
import { FigmaParser } from "figma-to-html";
const figmaParser = new FigmaParser({
  clientId: "clientId",
  clientSecret: "clientSecret",
  redirectUri: "redirectUri",
});

//single：figma url
figmaParser
  .parse(url, { onProgress: (progress) => {} })
  .then((htmlText) => {
    console.log(htmlText);
  })
  .catch((error) => {
    console.log(error);
  });

//batch：figma url array
figmaParser
  .parseBatch(urls, { onProgress: (progress) => {} })
  .then((htmlText) => {
    console.log(htmlText);
  })
  .catch((error) => {
    console.log(error);
  });
```
详细参考playground