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

let _onProgress = () => {};
export const parseNode = async (
  node: FigmaNode,
  images: { [key: string]: string } = {},
  isTopLevel = false,
  onProgress?: () => void
): Promise<{ html: string; css: string }> => {
  // check if node is visible
  if (!node.visible) {
    return { html: "", css: "" };
  }

  if (onProgress) _onProgress = onProgress;

  _onProgress?.();

  if (shouldExportToSVG(node)) {
    return parseToSVG(node, images, isTopLevel);
  }

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

export const calculateNodeNumber = (node: FigmaNode): number => {
  if (node.visible === false) return 0;
  if (
    !node.children ||
    node.children.length === 0 ||
    shouldExportToSVG(node) ||
    shouldExportToPNG(node)
  ) {
    return 1;
  }
  return node.children.reduce(
    (count: number, child: FigmaNode) => count + calculateNodeNumber(child),
    1
  );
};
