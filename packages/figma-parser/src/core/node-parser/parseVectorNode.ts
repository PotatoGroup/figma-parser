import type { VectorNode } from "@figma/rest-api-spec";
import { SingleFigmaCore } from "@/core/core";
import type { IExtendedFigmaNode } from "@/types";
import {
  commonStyles,
  generateClassName,
  generateCSS,
  sanitizeName,
  uuid,
} from "@/core/utils";
import { parseBorderStyle } from "@/core/style-parser/borderStyleParser";

export const parseVectorNode = async (
  node: VectorNode & IExtendedFigmaNode,
  images: { [key: string]: string },
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  const figmaCore = new SingleFigmaCore();
  const base64 = await figmaCore.transformNodeToBase64(node.id, "svg");
  if (!base64) return { html: "", css: "" };

  const containerClassName = generateClassName("vector");
  const imageClassName = generateClassName("vector-img");

  const imageName = `${sanitizeName(node.name)}_${uuid()}.svg`;
  images[imageName] = base64;
  const srcIdentifier = `__SRC__${imageName}__`;

  const containerStyles = Object.assign(
    {},
    commonStyles(
      node,
      { excludeBackground: true, excludeBorder: true, excludeShadow: true },
      isTopLevel
    )
  );

  // 获取border样式并调整容器尺寸
  const borderStyles = parseBorderStyle(node);
  if (borderStyles.borderDetail) {
    const detail = borderStyles.borderDetail;
    const extraWidth = (detail.left?.width || 0) + (detail.right?.width || 0);
    const extraHeight = (detail.top?.width || 0) + (detail.bottom?.width || 0);

    if (containerStyles.width) {
      containerStyles.width = `${
        parseFloat(containerStyles.width) + extraWidth
      }px`;
    }
    if (containerStyles.height) {
      containerStyles.height = `${
        parseFloat(containerStyles.height) + extraHeight
      }px`;
    }
  }

  const imageStyles: { [key: string]: string } = Object.assign({
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    ["object-fit"]: "cover",
  } as { [key: string]: string });

  const css =
    generateCSS(containerStyles, containerClassName) +
    generateCSS(imageStyles, imageClassName);

  const html = `<div class="${containerClassName}">
    <img src="${srcIdentifier}" class="${imageClassName}" />
  </div>`;

  return { html, css };
};
