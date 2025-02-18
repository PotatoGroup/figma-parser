import { SingleFigmaCore } from "./core";
import { FigmaNode } from "@/types";
import type { Node, TypeStyle } from "@figma/rest-api-spec";
import { parseNode } from "@/core/node-parser";

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

function replaceSrcIdentifiers(
  html: string,
  images: { [key: string]: string },
  useBase64: boolean
): string {
  return html.replace(/__SRC__(.*?)__/g, (_, imageName) => {
    const src = useBase64
      ? images[imageName.replace(/\s+/g, "_")]
      : `images/${imageName.replace(/\s+/g, "_")}`;
    return src;
  });
}

export const generateByUrl = async (url: string) => {
  const figmaCore = new SingleFigmaCore();
  figmaCore.setUrl(url);
  const figmaData = await figmaCore.getFigmaNodes();
  const figmaDocument = Object.values(figmaData.nodes)[0].document;
  const rootNode = wrapNode(figmaDocument);
  const images = {};
  const { html, css } = await parseNode(rootNode, images, true, () => {});
  const previewHtml = replaceSrcIdentifiers(html, images, true);
  return { html: previewHtml, css };
};

export const transformFigmaToHtml = async (url: string) => {
  const { html, css } = await generateByUrl(url);
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
};
