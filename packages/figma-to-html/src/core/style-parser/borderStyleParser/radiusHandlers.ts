import type { FigmaNode } from '@/types'
import { roundToHalf } from '@/core/utils'
import type { BorderStyles } from './types'

export function handleCornerRadius(node: FigmaNode, styles: BorderStyles) {
  if (
    'topLeftRadius' in node &&
    'topRightRadius' in node &&
    'bottomRightRadius' in node &&
    'bottomLeftRadius' in node
  ) {
    let { topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius } =
      node

    const rotationInDegrees = ((node.rotation || 0) * 180) / Math.PI
    const rotation = rotationInDegrees % 360

    if (Math.abs(rotation - 90) < 1 || Math.abs(rotation + 270) < 1) {
      ;[topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius] = [
        bottomLeftRadius,
        topLeftRadius,
        topRightRadius,
        bottomRightRadius,
      ]
    } else if (Math.abs(rotation - 180) < 1 || Math.abs(rotation + 180) < 1) {
      ;[topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius] = [
        bottomRightRadius,
        bottomLeftRadius,
        topLeftRadius,
        topRightRadius,
      ]
    } else if (Math.abs(rotation - 270) < 1 || Math.abs(rotation + 90) < 1) {
      ;[topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius] = [
        topRightRadius,
        bottomRightRadius,
        bottomLeftRadius,
        topLeftRadius,
      ]
    }

    styles.borderRadius = `${roundToHalf(topLeftRadius)}px ${roundToHalf(topRightRadius)}px ${roundToHalf(bottomRightRadius)}px ${roundToHalf(bottomLeftRadius)}px`
    styles.radiusDetail = {
      topLeft: roundToHalf(topLeftRadius),
      topRight: roundToHalf(topRightRadius),
      bottomRight: roundToHalf(bottomRightRadius),
      bottomLeft: roundToHalf(bottomLeftRadius),
    }
  }
}
