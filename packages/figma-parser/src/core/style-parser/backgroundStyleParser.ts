import type { FigmaNode } from "@/types";

interface BackgroundColorDetail {
  r: number;
  g: number;
  b: number;
  a: number;
  rgb: string;
  rgba: string;
}

interface BackgroundStyles {
  backgroundColor?: string;
  backgroundColorDetail?: BackgroundColorDetail;
}

export function parseBackgroundStyle(node: FigmaNode): BackgroundStyles {
  if (!("fills" in node) || !node.visible) return {};

  const fills = node.fills;
  if (typeof fills === "symbol" || !fills || fills.length === 0) return {};

  for (const fill of fills) {
    if (fill.visible === false) continue;
    if (fill.type === "SOLID") {
      const { r, g, b } = fill.color;
      const a = fill.opacity !== undefined ? fill.opacity : 1;
      const rgb = Math.round(r * 255);
      const gg = Math.round(g * 255);
      const bb = Math.round(b * 255);
      const rgbStr = `rgb(${rgb}, ${gg}, ${bb})`;
      const rgbaStr = `rgba(${rgb}, ${gg}, ${bb}, ${a})`;

      return {
        backgroundColor: a === 1 ? rgbStr : rgbaStr,
        backgroundColorDetail: {
          r: rgb,
          g: gg,
          b: bb,
          a,
          rgb: rgbStr,
          rgba: rgbaStr,
        },
      };
    } else if (fill.type === "GRADIENT_LINEAR") {
      const gradientStops = fill.gradientStops.map((stop) => {
        const { r, g, b } = stop.color;
        const a = stop.color.a !== undefined ? stop.color.a : 1;
        const rgb = Math.round(r * 255);
        const gg = Math.round(g * 255);
        const bb = Math.round(b * 255);
        const rgbaStr = `rgba(${rgb}, ${gg}, ${bb}, ${a})`;
        return rgbaStr;
      });

      return {
        backgroundColor: `linear-gradient(${gradientStops.join(", ")})`,
        backgroundColorDetail: undefined, // 可以根据需要扩展详细信息
      };
    }
  }

  return {};
}
