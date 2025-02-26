# figma-to-html

[![NPM version](https://img.shields.io/npm/v/figma-to-html.svg?style=flat)](https://npmjs.com/package/figma-to-html)
[![NPM downloads](http://img.shields.io/npm/dm/figma-to-html.svg?style=flat)](https://npmjs.com/package/figma-to-html)

## Install

```bash
$ pnpm install figma-to-html
```

## Usage
```ts
import { transformFigmaToHtml, transformFigmaToHtmlBatch } from 'figma-to-html'
//参数：figma url
const htmlText = await transformFigmaToHtml(url)
//批量转换，参数：figma url数组
const htmlText = await transformFigmaToHtmlBatch(urls)
```

## LICENSE

MIT
