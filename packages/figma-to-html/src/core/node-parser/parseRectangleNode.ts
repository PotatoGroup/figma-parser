import type { RectangleNode } from "@figma/rest-api-spec";
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

export const parseRectangleNode = async (
  node: RectangleNode & IExtendedFigmaNode,
  images: { [key: string]: string },
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  const figmaParser = new FigmaParser();
  const containerClassName = generateClassName("rectangle");
  const { name } = node;

  const containerStyles: { [key: string]: string } = Object.assign(
    { overflow: "hidden" },
    commonStyles(node, {}, isTopLevel)
  );

  const fills = node.fills;
  let html = `<div class="${containerClassName}">`;
  let css = "";

  for (const fill of fills) {
    if (fill.visible === false) continue;
    if (fill.type === "SOLID") {
      containerStyles["background-color"] = colorToCss(fill.color);
    } else if (fill.type === "IMAGE") {
      const base64 = await figmaParser.getBase64ByImageRef(fill.imageRef);
      const imageName = `${sanitizeName(name)}_${uuid()}.png`;
      images[imageName] = base64;
      const srcIdentifier = `__SRC__${imageName}__`;
      const imageClassName = generateClassName("image");

      const imageStyles = {
        ["object-fit"]: "cover",
        width: "100%",
        height: "100%",
      };

      html += `<img src="${srcIdentifier}" class="${imageClassName}" />`;
      css += generateCSS(imageStyles, imageClassName);
    } else if (fill.type === "GRADIENT_LINEAR") {
      const gradientStops = fill.gradientStops
        .map((stop) => {
          return `${colorToCss(stop.color)} ${stop.position * 100}%`;
        })
        .join(", ");
      containerStyles["background-image"] = `linear-gradient(${
        fill.gradientTransform[0][1] * 90
      }deg, ${gradientStops})`;
    }
  }
  html += `</div>`;
  css = generateCSS(containerStyles, containerClassName) + css;
  return { html, css };
};
