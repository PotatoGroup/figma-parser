# figma-parser
Figma解析工具，支持解析Figma文件中的组件、样式、图层等信息


## Getting started
```bash
npm install figma-parser
```

## Usage
```ts
import { generateByUrl, transformFigmaToHtml } from 'figma-parser'
const htmlText = await transformFigmaToHtml(url)
```
详细参考playground