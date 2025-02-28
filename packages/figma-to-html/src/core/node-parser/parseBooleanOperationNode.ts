import type { BooleanOperationNode } from "@figma/rest-api-spec";
import { FigmaParser } from "@/core";
import type { IExtendedFigmaNode } from "@/types";
import {
  commonStyles,
  generateClassName,
  generateCSS,
  sanitizeName,
  uuid,
} from "@/core/utils";

export const parseBooleanOperationNode = async (
  node: BooleanOperationNode & IExtendedFigmaNode,
  images: { [key: string]: string } = {},
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  const figmaParser = new FigmaParser();
  const containerClassName = generateClassName("boolean-operation");
  const imageClassName = generateClassName("boolean-operation-img");
  const { name } = node;

  let base64;
  try {
    base64 = await figmaParser.transformNodeToBase64(node.id, "svg");
  } catch (error) {
    return { html: "", css: "" };
  }
  if (!base64) return { html: "", css: "" };

  const imageName = `${sanitizeName(name)}_${uuid()}.svg`;
  images[imageName] = base64;
  const srcIdentifier = `__SRC__${imageName}__`;

  // Add styles for the container and image
  const containerStyles = Object.assign(
    {},
    commonStyles(
      node,
      {
        excludeBackground: true,
        excludeBorder: true,
        excludeShadow: true,
      },
      isTopLevel
    )
  );

  const imageStyles = Object.assign({
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
