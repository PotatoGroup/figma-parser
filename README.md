# figma-parser
Figma解析工具集，支持解析Figma文件中的组件、样式、图层等信息


## Getting started
```bash
npm install figma-to-html
```

## Usage
```ts
import { transformFigmaToHtml, transformFigmaToHtmlBatch } from 'figma-to-html'
//参数：figma url
const htmlText = await transformFigmaToHtml(url)
//批量转换，参数：figma url数组
const htmlText = await transformFigmaToHtmlBatch(urls)
```
详细参考playground