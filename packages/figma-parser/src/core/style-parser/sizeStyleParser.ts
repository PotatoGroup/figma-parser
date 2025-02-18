import { roundToHalf } from "@/core/utils";
import type { FigmaNode } from "@/types";

export function parseSizeStyle(node: FigmaNode): {
  width: string;
  height: string;
} {
  const width = node.width;
  const height = node.height;

  const transform = node.relativeTransform;
  const scaleX = transform ? transform[0][0] : 1;
  const skewX = transform ? transform[0][1] : 0;
  const skewY = transform ? transform[1][0] : 0;
  const scaleY = transform ? transform[1][1] : 1;

  let transformedWidth = width * scaleX + height * Math.abs(skewX);
  let transformedHeight = height * scaleY + width * Math.abs(skewY);

  // 检查父容器是否裁剪
  const parent = node.parent;
  if (parent && "clipsContent" in parent && parent.clipsContent) {
    const nodeBounds = node.absoluteBoundingBox;
    const parentBounds = parent.absoluteBoundingBox;

    if (nodeBounds && parentBounds) {
      // 计算裁剪后的实际尺寸
      transformedWidth = Math.min(
        transformedWidth,
        parentBounds.width - (nodeBounds.x - parentBounds.x)
      );
      transformedHeight = Math.min(
        transformedHeight,
        parentBounds.height - (nodeBounds.y - parentBounds.y)
      );
    }
  }

  return {
    width: `${roundToHalf(Math.max(0, transformedWidth))}px`,
    height: `${roundToHalf(Math.max(0, transformedHeight))}px`,
  };
}
