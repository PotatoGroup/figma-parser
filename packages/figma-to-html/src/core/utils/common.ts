import type { RGB, Node, TypeStyle } from "@figma/rest-api-spec";
import type { FigmaNode, ImageType } from "@/types";
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

export function replaceSrcIdentifiers(
  html: string,
  images: { [key: string]: string }
): string {
  return html.replace(
    /__SRC__(.*?)__/g,
    (_, imageName) => images[imageName.replace(/\s+/g, "_")]
  );
}

function calculateGradientTransform(
  gradientHandlePositions: { x: number; y: number }[]
): number[][] {
  // 实现根据 gradientHandlePositions 计算矩阵
  // 这里需要根据具体需求计算，这里提供一个示例
  const [handle1, handle2] = gradientHandlePositions;
  // 示例转换，实际需根据 Figma 的 gradient 转换逻辑实现
  return [
    [handle2.x - handle1.x, 0, handle1.x],
    [0, handle2.y - handle1.y, handle1.y],
  ];
}

export function wrapNode(nodeData: Node): FigmaNode {
  const privateFills = (nodeData as FigmaNode).fills;
  const privateStrokes = (nodeData as FigmaNode).strokes;
  const privateVisible = (nodeData as FigmaNode).visible;
  const extendedNode = Object.defineProperties(nodeData, {
    getStyledTextSegments: {
      value: function (styleTypes: (keyof TypeStyle)[]) {
        if (
          !("characterStyleOverrides" in this) ||
          !("styleOverrideTable" in this) ||
          this.characterStyleOverrides.length === 0
        ) {
          const defaultStyles = styleTypes.reduce((acc, type) => {
            acc[type] = this.style[type] || this[type];
            return acc;
          }, {} as TypeStyle);
          return [defaultStyles];
        }

        const textContent = this.characters || "";
        const segments = [];
        let currentSegment = { start: 0, end: 0, styles: {} };

        for (let i = 0; i < this.characterStyleOverrides.length; i++) {
          const styleIndex = this.characterStyleOverrides[i];
          const charStyle = this.styleOverrideTable[styleIndex] || {};

          const styles = styleTypes.reduce((acc, type) => {
            if (charStyle[type] !== undefined && charStyle[type] !== null) {
              acc[type] = charStyle[type];
            } else {
              acc[type] = this.style[type] || this[type];
            }
            return acc;
          }, {} as TypeStyle);

          if (i === 0) {
            currentSegment.styles = styles;
          }

          if (
            JSON.stringify(currentSegment.styles) !== JSON.stringify(styles)
          ) {
            currentSegment.end = i;
            segments.push({ ...currentSegment });
            currentSegment = { start: i, end: i, styles };
          }

          currentSegment.end = i + 1;
        }

        segments.push(currentSegment);
        return segments.map(({ start, end, styles }) => {
          return {
            characters: textContent.substring(start, end),
            start,
            end,
            ...styles,
          };
        });
      },
    },
    marginTop: {
      get(this: FigmaNode) {
        if (
          this.parent &&
          "absoluteBoundingBox" in this &&
          "absoluteBoundingBox" in this.parent &&
          this.absoluteBoundingBox &&
          this.parent.absoluteBoundingBox
        ) {
          return this.absoluteBoundingBox.y - this.parent.absoluteBoundingBox.y;
        }
        return 0;
      },
    },
    marginRight: {
      get(this: FigmaNode) {
        if (
          this.parent &&
          "absoluteBoundingBox" in this &&
          "absoluteBoundingBox" in this.parent &&
          this.absoluteBoundingBox &&
          this.parent.absoluteBoundingBox
        ) {
          const parentRight =
            this.parent.absoluteBoundingBox.x +
            this.parent.absoluteBoundingBox.width;
          const nodeRight =
            this.absoluteBoundingBox.x + this.absoluteBoundingBox.width;
          return parentRight - nodeRight;
        }
        return 0;
      },
    },
    marginBottom: {
      get(this: FigmaNode) {
        if (
          this.parent &&
          "absoluteBoundingBox" in this &&
          "absoluteBoundingBox" in this.parent &&
          this.absoluteBoundingBox &&
          this.parent.absoluteBoundingBox
        ) {
          const parentBottom =
            this.parent.absoluteBoundingBox.y +
            this.parent.absoluteBoundingBox.height;
          const nodeBottom =
            this.absoluteBoundingBox.y + this.absoluteBoundingBox.height;
          return parentBottom - nodeBottom;
        }
        return 0;
      },
    },
    marginLeft: {
      get(this: FigmaNode) {
        if (
          this.parent &&
          "absoluteBoundingBox" in this &&
          "absoluteBoundingBox" in this.parent &&
          this.absoluteBoundingBox &&
          this.parent.absoluteBoundingBox
        ) {
          return this.absoluteBoundingBox.x - this.parent.absoluteBoundingBox.x;
        }
        return 0;
      },
    },
    textAlignHorizontal: {
      get(this: FigmaNode) {
        if ("constraints" in this && this.constraints?.horizontal) {
          return this.constraints.horizontal;
        }
        return "LEFT";
      },
    },
    textAlignVertical: {
      get(this: FigmaNode) {
        if ("constraints" in this && this.constraints?.vertical) {
          return this.constraints.vertical;
        }
        return "TOP";
      },
    },
    fills: {
      get(this: FigmaNode) {
        if (!privateFills) {
          return [];
        }
        return privateFills.map((fill) => ({
          ...fill,
          ...(fill.type === "GRADIENT_LINEAR"
            ? {
                gradientTransform: calculateGradientTransform(
                  fill.gradientHandlePositions
                ),
              }
            : {}),
        }));
      },
    },
    strokes: {
      get(this: FigmaNode) {
        if (!privateStrokes) {
          return [];
        }
        return privateStrokes.map((stroke) => ({
          ...stroke,
          ...(stroke.type === "GRADIENT_LINEAR"
            ? {
                gradientTransform: calculateGradientTransform(
                  stroke.gradientHandlePositions
                ),
              }
            : {}),
        }));
      },
    },
    width: {
      get() {
        return this.absoluteBoundingBox?.width ?? 0;
      },
    },
    height: {
      get() {
        return this.absoluteBoundingBox?.height ?? 0;
      },
    },
    visible: {
      get() {
        return privateVisible ?? true;
      },
    },
    topLeftRadius: {
      get(this: FigmaNode) {
        if ("rectangleCornerRadii" in this) {
          return this.rectangleCornerRadii?.[0] ?? 0;
        }
        return "cornerRadius" in this ? this.cornerRadius ?? 0 : 0;
      },
    },
    topRightRadius: {
      get(this: FigmaNode) {
        if ("rectangleCornerRadii" in this) {
          return this.rectangleCornerRadii?.[1] ?? 0;
        }
        return "cornerRadius" in this ? this.cornerRadius ?? 0 : 0;
      },
    },
    bottomRightRadius: {
      get(this: FigmaNode) {
        if ("rectangleCornerRadii" in this) {
          return this.rectangleCornerRadii?.[2] ?? 0;
        }
        return "cornerRadius" in this ? this.cornerRadius ?? 0 : 0;
      },
    },
    bottomLeftRadius: {
      get(this: FigmaNode) {
        if ("rectangleCornerRadii" in this) {
          return this.rectangleCornerRadii?.[3] ?? 0;
        }
        return "cornerRadius" in this ? this.cornerRadius ?? 0 : 0;
      },
    },
  }) as FigmaNode;

  // 递归处理子节点
  if ("children" in extendedNode && extendedNode.children) {
    extendedNode.children = extendedNode.children.map((child) => {
      const res = wrapNode(child);
      res.parent = extendedNode;
      return res;
    });
  }

  return extendedNode;
}

export function htmlTemplate(html: string, css: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Figma Designer</title>
    <style>${css}</style>
  </head>
  <body>
    ${html}
  </body>
</html>
`;
}

export function formatBase64(base64: string, format: ImageType) {
  if (format === "png") {
    return base64.startsWith("data:image/png;base64,")
      ? base64
      : `data:image/png;base64,${base64}`;
  }
  return base64.startsWith("data:image/svg+xml;base64,")
    ? base64
    : `data:image/svg+xml;base64,${base64}`;
}
