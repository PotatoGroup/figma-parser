# figma-parser

Figma 解析工具集，支持解析 Figma 文件中的组件、样式、图层等信息

## Getting started

[![NPM version](https://img.shields.io/npm/v/figma-to-html.svg?style=flat)](https://npmjs.com/package/figma-to-html)
[![NPM downloads](http://img.shields.io/npm/dm/figma-to-html.svg?style=flat)](https://npmjs.com/package/figma-to-html)

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

## Options

| Option           | Type                               | Default                             | Required | Description           |
| ---------------- | ---------------------------------- | ----------------------------------- | -------- | --------------------- |
| clientId         | `string`                           | -                                   | ✅       | figma clientId        |
| clientSecret     | `string`                           | -                                   | ✅       | figma clientSecret    |
| redirectUri      | `string`                           | location.origin + location.pathname |          | figma redirectUri     |
| tpl              | `boolean`                          | true                                |          | template              |
| placeholderImage | `string`                           | -                                   |          | placeholder image url |
| imageResolver    | `(url: string) => Promise<string>` | base64 image resolver               |          | image resolver        |
| onProgress       | `(progress: number) => void`       | -                                   |          | progress callback     |

## LICENSE

MIT
