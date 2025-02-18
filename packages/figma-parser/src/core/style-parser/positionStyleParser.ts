import { roundToHalf } from '@/core/utils'
import type { FigmaNode } from '@/types'

export function positionStyleParser(node: FigmaNode): {
  relativeX: number
  relativeY: number
} {
  if (!node.parent) {
    return { relativeX: 0, relativeY: 0 }
  }

  const parentNode = node.parent

  if (!node.absoluteBoundingBox || !parentNode.absoluteBoundingBox) {
    return { relativeX: 0, relativeY: 0 }
  }

  const relativeX =
    node.absoluteBoundingBox.x - parentNode.absoluteBoundingBox.x
  const relativeY =
    node.absoluteBoundingBox.y - parentNode.absoluteBoundingBox.y

  return {
    relativeX: roundToHalf(relativeX),
    relativeY: roundToHalf(relativeY),
  }
}
