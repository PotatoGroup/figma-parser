import type { SolidPaint, TextNode } from "@figma/rest-api-spec";
import type { ExtendedPaint, IExtendedFigmaNode } from "@/types";
import {
  colorToCss,
  generateClassName,
  generateCSS,
  roundToHalf,
} from "@/core/utils";
import { parseOpacityStyle } from "@/core/style-parser/opacityStyleParser";
import { positionStyleParser } from "@/core/style-parser/positionStyleParser";

const convertTextDecoration = (decoration?: string): string => {
  switch (decoration) {
    case "STRIKETHROUGH":
      return "line-through";
    case "UNDERLINE":
      return "underline";
    default:
      return "none";
  }
};

const convertFillsToCss = (fills: ExtendedPaint[]): string => {
  const solidFill = fills.find(
    (fill) => fill.visible !== false && fill.type === "SOLID" && fill.color
  );
  if (solidFill) {
    return colorToCss((solidFill as SolidPaint).color);
  }

  const gradientFill = fills.find(
    (fill) =>
      fill.visible !== false &&
      fill.type === "GRADIENT_LINEAR" &&
      fill.gradientStops
  );
  if (gradientFill && gradientFill.type === "GRADIENT_LINEAR") {
    const gradientStops = gradientFill.gradientStops
      .map((stop) => `${colorToCss(stop.color)} ${stop.position * 100}%`)
      .join(", ");
    return `linear-gradient(${gradientFill.gradientTransform[0][1]}deg, ${gradientStops})`;
  }

  return "";
};

export const parseTextNode = (
  node: TextNode & IExtendedFigmaNode,
  isTopLevel = false
): { html: string; css: string } => {
  const containerClassName = generateClassName("text-container");

  const { relativeX, relativeY } = positionStyleParser(node);

  let contentHtml = "";
  let css = "";

  // 处理文本段落样式
  const segments = node.getStyledTextSegments([
    "fontSize",
    "fontFamily",
    "fontWeight",
    "lineHeightPx",
    "letterSpacing",
    "fills",
    "textDecoration",
  ]);

  segments.forEach((segment) => {
    const segmentClassName = generateClassName("text-segment");
    const segmentStyles: { [key: string]: string } = {
      ["font-size"]: `${Math.round(segment.fontSize)}px`,
      ["font-family"]: segment.fontFamily,
      ["font-weight"]: `${segment.fontWeight}`,
      ["line-height"]: `${Math.round(segment.lineHeightPx)}px`,
      color: convertFillsToCss(segment.fills),
      ["text-decoration"]: convertTextDecoration(segment.textDecoration),
    };

    if (segment.letterSpacing !== undefined) {
      segmentStyles["letter-spacing"] = `${roundToHalf(
        segment.letterSpacing
      )}px`;
    }

    contentHtml += `<span class="${segmentClassName}">${node.characters.slice(
      segment.start,
      segment.end
    )}</span>`;
    css += generateCSS(segmentStyles, segmentClassName);
  });

  const containerStyles = Object.assign({
    position: isTopLevel ? "relative" : "absolute",
    top: !isTopLevel ? `${roundToHalf(relativeY)}px` : "auto",
    left: !isTopLevel ? `${roundToHalf(relativeX)}px` : "auto",
    width: `${roundToHalf(node.width)}px`,
    height: `${roundToHalf(node.height)}px`,
    display: "flex",
    ["flex-direction"]: "row",
    ["align-items"]: (() => {
      const verticalAlign = node.style.textAlignVertical;
      return verticalAlign === "TOP"
        ? "flex-start"
        : verticalAlign === "BOTTOM"
        ? "flex-end"
        : "center";
    })(),
    ["justify-content"]: (() => {
      const horizontalAlign = node.style.textAlignHorizontal;
      return horizontalAlign === "LEFT"
        ? "flex-start"
        : horizontalAlign === "RIGHT"
        ? "flex-end"
        : horizontalAlign === "JUSTIFIED"
        ? "space-between"
        : "center";
    })(),
    ["text-wrap"]: "nowrap",
    opacity: parseOpacityStyle(node).opacity,
  });

  css += generateCSS(containerStyles, containerClassName);
  const html = `<div class="${containerClassName}">${contentHtml}</div>`;

  return { html, css };
};
