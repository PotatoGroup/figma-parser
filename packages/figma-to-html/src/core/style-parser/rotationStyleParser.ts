import type { FigmaNode } from '@/types'

interface RotationStyles {
  ['transform-origin']?: string
  transform?: string
}

export function parseRotationStyle(
  node: FigmaNode & { rotation?: number },
): RotationStyles {
  if (!node.visible || typeof node.rotation !== 'number') return {}

  // figma 的截图就是旋转后的，似乎不旋转效果更好？ TODO: 持续优化，先想办法拿到原图
  return {
    ['transform-origin']: `${50}% ${50}%`,
    transform: node.rotation ? `rotate(${node.rotation}deg)` : 'none',
  }
}
