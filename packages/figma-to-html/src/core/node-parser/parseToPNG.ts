import { SingleFigmaCore } from "@/core/core";
import type { FigmaNode } from "@/types";
import {
  commonStyles,
  generateClassName,
  generateCSS,
  sanitizeName,
  uuid,
} from "@/core/utils";
import { parseBorderStyle } from "@/core/style-parser/borderStyleParser";

export const parseToPNG = async (
  node: FigmaNode,
  images: { [key: string]: string },
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  const figmaCore = new SingleFigmaCore();
  const base64 = await figmaCore.transformNodeToBase64(node.id, "png");
  if (!base64) return { html: "", css: "" };

  const imageClassName = generateClassName("png-img");
  const imageName = `${sanitizeName(node.name)}_${uuid()}.png`;
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
    } as { [key: string]: string }
  );

  // 获取border样式并调整容器尺寸
  const borderStyles = parseBorderStyle(node);
  if (borderStyles.borderDetail) {
    const detail = borderStyles.borderDetail;
    const extraWidth = (detail.left?.width || 0) + (detail.right?.width || 0);
    const extraHeight = (detail.top?.width || 0) + (detail.bottom?.width || 0);

    if (imageStyles.width) {
      imageStyles.width = `${parseFloat(imageStyles.width) + extraWidth}px`;
    }
    if (imageStyles.height) {
      imageStyles.height = `${parseFloat(imageStyles.height) + extraHeight}px`;
    }
  }

  const css = generateCSS(imageStyles, imageClassName);

  const html = `<img src="${srcIdentifier}" class="${imageClassName}" />`;

  return { html, css };
};

// 判断是否需要导出为PNG
export const shouldExportToPNG = (node: FigmaNode): boolean => {
  let hasImageFill = false;

  const checkNode = (node: FigmaNode): boolean => {
    if (!node.visible) {
      return true;
    }

    if (node.type === "TEXT") {
      return false;
    }

    if ("fills" in node && node.fills) {
      const fills = node.fills;
      if (fills.some((fill) => fill.type === "IMAGE")) {
        hasImageFill = true;
      }
    }

    if ("children" in node) {
      return (node.children as FigmaNode[]).every(checkNode);
    }

    return true;
  };

  const noTextNodes = checkNode(node);
  return noTextNodes && hasImageFill;
};
