import type { RGB } from "@figma/rest-api-spec";
import type { FigmaNode } from "@/types";
import { parseBackgroundStyle } from "@/core/style-parser/backgroundStyleParser";
import { parseBorderStyle } from "@/core/style-parser/borderStyleParser";
import { parseColorStyle } from "@/core/style-parser/colorStyleParser";
import { parseOpacityStyle } from "@/core/style-parser/opacityStyleParser"; // 新增导入
import { positionStyleParser } from "@/core/style-parser/positionStyleParser"; // 修改导入
import { parseShadowStyle } from "@/core/style-parser/shadowStyleParser"; // 修改导入
import { parseSizeStyle } from "@/core/style-parser/sizeStyleParser"; // 新增导入

export const colorToCss = (color: RGB, opacity: number = 1): string => {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

type StyleOptions = {
  excludeWidth?: boolean;
  excludeHeight?: boolean;
  excludeBorder?: boolean;
  excludeShadow?: boolean;
  excludeMargin?: boolean;
  excludeBackground?: boolean;
  excludeColor?: boolean;
  excludeOpacity?: boolean; // 新增 excludeOpacity 属性
};

export const commonStyles = (
  node: FigmaNode,
  options: StyleOptions = {},
  isTopLevel: boolean
): { [key: string]: string } => {
  const sizeStyles = parseSizeStyle(node); // 使用 parseSizeStyle
  const positionStyles = positionStyleParser(node);
  const borderStyles = parseBorderStyle(node);
  const shadowStyles = parseShadowStyle(node);
  // const marginStyles = parseMarginStyle(node)
  const backgroundStyles = parseBackgroundStyle(node);
  const colorStyles = parseColorStyle(node);
  const opacityStyles = parseOpacityStyle(node); // 使用 parseOpacityStyle

  return Object.assign(
    !options.excludeWidth ? { width: sizeStyles.width } : {},
    !options.excludeHeight ? { height: sizeStyles.height } : {},
    {
      position: isTopLevel ? "relative" : "absolute",
      top: !isTopLevel ? `${positionStyles.relativeY}px` : "auto",
      left: !isTopLevel ? `${positionStyles.relativeX}px` : "auto",
    },

    !options.excludeBorder && borderStyles.border
      ? { border: borderStyles.border }
      : {},
    !options.excludeBorder && borderStyles.borderRadius
      ? { ["border-radius"]: borderStyles.borderRadius }
      : {},
    !options.excludeShadow && shadowStyles.boxShadow
      ? { ["box-shadow"]: shadowStyles.boxShadow }
      : {},
    // !options.excludeMargin && marginStyles.margin
    //   ? { margin: marginStyles.margin }
    //   : {},
    !options.excludeBackground && backgroundStyles.backgroundColor
      ? { ["background"]: backgroundStyles.backgroundColor }
      : {},
    !options.excludeColor && colorStyles.color
      ? { color: colorStyles.color }
      : {},
    !options.excludeOpacity && opacityStyles.opacity
      ? { opacity: opacityStyles.opacity }
      : {}
  );
};

let classCounter = 0;
export const generateClassName = (prefix: string): string => {
  return `${prefix}-${classCounter++}`;
};

export const generateCSS = (
  styles: { [key: string]: string },
  className: string
): string => {
  const cssRules = Object.entries(styles)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");
  return `.${className} {\n${cssRules}\n}\n`;
};

export const uuid = () => (Math.random() * 10000000 * Date.now()).toString(32);

export const sanitizeName = (name: string): string => {
  return name.replace(/[\s%]+/g, "0");
};

export function roundToHalf(value: number): number {
  const decimal = value % 1;
  if (decimal <= 0.25) {
    return Math.floor(value);
  } else if (decimal > 0.25 && decimal <= 0.75) {
    return Math.floor(value) + 0.5;
  } else {
    return Math.ceil(value);
  }
}
