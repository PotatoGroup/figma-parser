import type { FigmaNode } from "@/types";

// types.ts
export interface ParsedStyles {
  color?: string;
}

interface ColorDetail {
  r: number;
  g: number;
  b: number;
  a?: number;
  rgb: string;
  rgba?: string;
}

interface ColorStyles {
  color?: string;
  colorDetail?: ColorDetail;
}

// parseColorStyle.ts

export function parseColorStyle(node: FigmaNode): ColorStyles {
  if (!("fills" in node) || !node.visible) return {};

  const fills = node.fills;
  if (!fills || fills.length === 0 || !fills[0].visible) return {};

  const fill = fills[0];
  if (fill.type !== "SOLID") return {};

  const { r, g, b } = fill.color;
  const a = fill.opacity !== undefined ? fill.opacity : 1;
  const rgb = Math.round(r * 255);
  const gg = Math.round(g * 255);
  const bb = Math.round(b * 255);
  const rgbStr = `rgb(${rgb}, ${gg}, ${bb})`;
  const rgbaStr = `rgba(${rgb}, ${gg}, ${bb}, ${a})`;

  return {
    color: a === 1 ? rgbStr : rgbaStr,
    colorDetail: {
      r: rgb,
      g: gg,
      b: bb,
      a,
      rgb: rgbStr,
      rgba: rgbaStr,
    },
  };
}
