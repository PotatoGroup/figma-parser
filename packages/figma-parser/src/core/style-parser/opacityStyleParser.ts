import type { FigmaNode } from '@/types'

export const parseOpacityStyle = (node: FigmaNode): { opacity?: number } => {
  if ('opacity' in node) {
    return { opacity: node.opacity }
  }
  return { opacity: 1 }
}
