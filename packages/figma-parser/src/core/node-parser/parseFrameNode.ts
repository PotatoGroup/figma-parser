import type { FrameNode } from "@figma/rest-api-spec";
import type { IExtendedFigmaNode } from "@/types";
import { parseNode } from ".";
import {
  commonStyles,
  generateClassName,
  generateCSS,
  roundToHalf,
} from "@/core/utils";

/**
 * 进入此函数时，node 为 FrameNode 类型（node.type === 'FRAME'）
 */
export const parseFrameNode = async (
  node: FrameNode & IExtendedFigmaNode,
  images: { [key: string]: string },
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  // 如果frame没有子节点，返回空字符串 （兼容设计稿上一些无意义的节点，防止影响转 HTML 的效果）
  if (node.children.length === 0) {
    return { html: "", css: "" };
  }

  const containerClassName = generateClassName("frame");

  // 处理容器节点
  let childrenHtml = "";
  let css = "";

  for (const child of node.children) {
    const result = await parseNode(child, images, false);
    childrenHtml += result.html;
    css += result.css;
  }

  const containerStyles: { [key: string]: string } = Object.assign(
    {},
    commonStyles(node, {}, isTopLevel),
    {
      width: roundToHalf(node.width) + "px",
      height: roundToHalf(node.height) + "px",
    }
  );

  // 如果启用了 Clip content 属性，添加相应的 CSS 样式
  if (node.clipsContent) {
    containerStyles["overflow"] = "hidden";
  }

  css += generateCSS(containerStyles, containerClassName);
  const html = `<div class="${containerClassName}">${childrenHtml}</div>`;

  return { html, css };
};
