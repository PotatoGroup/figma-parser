import type { FigmaNode } from '@/types'

interface MarginDetail {
  top: number
  right: number
  bottom: number
  left: number
}

interface MarginStyles {
  margin?: string
  marginDetail?: MarginDetail
}

export function parseMarginStyle(node: FigmaNode): MarginStyles {
  if (
    !('marginLeft' in node) ||
    !('marginRight' in node) ||
    !('marginTop' in node) ||
    !('marginBottom' in node)
  ) {
    return {}
  }

  const nodeWithMargin = node as {
    marginTop: number
    marginRight: number
    marginBottom: number
    marginLeft: number
  }

  return {
    margin: `${nodeWithMargin.marginTop}px ${nodeWithMargin.marginRight}px ${nodeWithMargin.marginBottom}px ${nodeWithMargin.marginLeft}px`,
    marginDetail: {
      top: nodeWithMargin.marginTop,
      right: nodeWithMargin.marginRight,
      bottom: nodeWithMargin.marginBottom,
      left: nodeWithMargin.marginLeft,
    },
  }
}
