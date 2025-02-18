import type { FigmaNode } from "@/types";
import { parseBooleanOperationNode } from "./parseBooleanOperationNode";
import { parseComponentNode } from "./parseComponentNode";
import { parseEllipseNode } from "./parseEllipseNode";
import { parseFrameNode } from "./parseFrameNode";
import { parseGroupNode } from "./parseGroupNode";
import { parseInstanceNode } from "./parseInstanceNode";
import { parseRectangleNode } from "./parseRectangleNode";
import { parseTextNode } from "./parseTextNode";
import { parseToPNG, shouldExportToPNG } from "./parseToPNG";
import { parseToSVG, shouldExportToSVG } from "./parseToSVG";
import { parseVectorNode } from "./parseVectorNode";

let _updateProgress: () => void;
// 解析节点并生成 HTML
export const parseNode = async (
  node: FigmaNode,
  images: { [key: string]: string } = {},
  isTopLevel = false,
  updateProgress?: () => void
): Promise<{ html: string; css: string }> => {
  // 统一在入口处判断节点可见性
  if (!node.visible) {
    return { html: "", css: "" };
  }

  if (updateProgress) {
    _updateProgress = updateProgress;
  }
  _updateProgress();

  // 如果当前节点和所有子孙节点都没有文字节点和图片节点，则直接使用 parseToSvg 解析
  if (shouldExportToSVG(node)) {
    return parseToSVG(node, images, isTopLevel);
  }

  // 如果当前节点和所有子孙节点都没有文字节点，但是有图片节点，则直接使用 parseToPng 解析
  if (shouldExportToPNG(node)) {
    return parseToPNG(node, images, isTopLevel);
  }

  switch (node.type) {
    case "BOOLEAN_OPERATION":
      return parseBooleanOperationNode(node, images, isTopLevel);
    case "TEXT":
      return parseTextNode(node, isTopLevel);
    case "RECTANGLE":
      return parseRectangleNode(node, images, isTopLevel);
    case "VECTOR":
      return parseVectorNode(node, images, isTopLevel);
    case "FRAME":
      return parseFrameNode(node, images, isTopLevel);
    case "GROUP":
      return parseGroupNode(node, images, isTopLevel);
    case "COMPONENT":
      return parseComponentNode(node, images, isTopLevel);
    case "ELLIPSE":
      return parseEllipseNode(node, images, isTopLevel);
    case "INSTANCE":
      return parseInstanceNode(node, images, isTopLevel);
    default:
      return { html: "", css: "" };
  }
};
