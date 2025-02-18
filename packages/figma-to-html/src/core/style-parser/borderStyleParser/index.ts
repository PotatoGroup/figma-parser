import type { FigmaNode } from "@/types";
import { handleCornerRadius } from "./radiusHandlers";
import { handleStroke } from "./strokeHandlers";
import type { BorderStyles } from "./types";

export function parseBorderStyle(node: FigmaNode): BorderStyles {
  if (node.visible === false) return {};
  const styles: BorderStyles = {};
  // border
  handleStroke(node, styles);
  // radius
  handleCornerRadius(node, styles);
  return styles;
}
