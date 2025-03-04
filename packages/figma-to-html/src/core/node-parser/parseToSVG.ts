import { FigmaParser } from "@/core";
import type { FigmaNode } from "@/types";
import {
  commonStyles,
  generateClassName,
  generateCSS,
  roundToHalf,
  sanitizeName,
  uuid,
} from "@/core/utils";
import { parseBorderStyle } from "@/core/style-parser/borderStyleParser";


export const parseToSVG = async (
  node: FigmaNode,
  images: { [key: string]: string },
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  const figmaParser = new FigmaParser();
  const base64 = await figmaParser.transformNodeToBase64(node.id, "svg");
  if (!base64) return { html: "", css: "" };

  const imageClassName = generateClassName("svg-img");
  const imageName = `${sanitizeName(node.name)}_${uuid()}.svg`;
  images[imageName] = base64;
  const srcIdentifier = `__SRC__${imageName}__`;

  const imageStyles: { [key: string]: string } = Object.assign(
    commonStyles(
      node,
      { excludeBackground: true, excludeBorder: true, excludeShadow: true },
      isTopLevel
    ),
    {
      ["object-fit"]: "cover",
    } as { [key: string]: string },
    {
      width: roundToHalf(node.width),
      height: roundToHalf(node.height),
    }
  );

  // 获取border样式并调整容器尺寸
  const borderStyles = parseBorderStyle(node);
  if (borderStyles.borderDetail) {
    const detail = borderStyles.borderDetail;
    const extraWidth = (detail.left?.width || 0) + (detail.right?.width || 0);
    const extraHeight = (detail.top?.width || 0) + (detail.bottom?.width || 0);
    imageStyles.width = imageStyles.width + extraWidth;
    imageStyles.height = imageStyles.height + extraHeight;
  }
  imageStyles.width = imageStyles.width + "px";
  imageStyles.height = imageStyles.height + "px";
  const css = generateCSS(imageStyles, imageClassName);

  const html = `<img src="${srcIdentifier}" class="${imageClassName}" />`;

  return { html, css };
};

// 检查节点是否有背景色
const hasBackgroundFill = (node: FigmaNode): boolean => {
  if ("fills" in node && node.fills) {
    const fills = node.fills;
    return fills.some(
      (fill) =>
        fill.visible !== false &&
        (fill.type === "SOLID" || fill.type === "GRADIENT_LINEAR")
    );
  }
  return false;
};

export const shouldExportToSVG = (
  node: FigmaNode,
  parentHasBackground: boolean = false
): boolean => {
  if (node.visible === false) {
    return true;
  }

  const currentHasBackground = hasBackgroundFill(node);

  if (node.type === "TEXT") {
    // 如果父节点有背景色，且当前节点是唯一子节点，则允许导出SVG
    if (parentHasBackground && node.parent && node.parent.children) {
      return node.parent.children.length === 1;
    }
    return false;
  }

  if ("fills" in node && node.fills) {
    const fills = node.fills;
    if (fills.some((fill) => fill.type === "IMAGE" && fill.visible !== false)) {
      return false;
    }
  }

  if ("children" in node && node.children) {
    return node.children.every((child) =>
      shouldExportToSVG(child, currentHasBackground || parentHasBackground)
    );
  }

  return true;
};
