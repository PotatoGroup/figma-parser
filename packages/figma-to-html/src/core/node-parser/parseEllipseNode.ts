import type { EllipseNode } from "@figma/rest-api-spec";
import { FigmaParser } from "@/core";
import type { IExtendedFigmaNode } from "@/types";
import {
  colorToCss,
  commonStyles,
  generateClassName,
  generateCSS,
  sanitizeName,
  uuid,
} from "@/core/utils";

export const parseEllipseNode = async (
  node: EllipseNode & IExtendedFigmaNode,
  images: { [key: string]: string },
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  const figmaParser = new FigmaParser();
  const containerClassName = generateClassName("ellipse");
  const { name } = node;

  const containerStyles: { [key: string]: string } = Object.assign(
    commonStyles(node, {}, isTopLevel),
    {
      ["border-radius"]: "50%",
    }
  );

  const fills = node.fills;
  if (fills[0]?.type === "SOLID") {
    const opacity = fills[0].opacity !== undefined ? fills[0].opacity : 1;
    containerStyles["background-color"] = colorToCss(fills[0].color, opacity);
    const css = generateCSS(containerStyles, containerClassName);
    const html = `<div class="${containerClassName}"></div>`;
    return { html, css };
  }

  if (fills[0]?.type === "IMAGE") {
    const base64 = await figmaParser.getBase64ByImageRef(fills[0].imageRef);
    const imageName = `${sanitizeName(name)}_${uuid()}.png`;
    images[imageName] = base64;
    const srcIdentifier = `__SRC__${imageName}__`;
    Object.assign(containerStyles, {
      ["object-fit"]: "cover",
      display: "block",
      margin: "auto",
    });

    const css = generateCSS(containerStyles, containerClassName);
    const html = `<img src="${srcIdentifier}" class="${containerClassName}" />`;
    return { html, css };
  }

  return { html: "", css: "" };
};
