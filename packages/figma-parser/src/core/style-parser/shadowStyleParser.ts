interface ShadowDetail {
  offset: {
    x: number
    y: number
  }
  radius: number
  color: {
    r: number
    g: number
    b: number
    a: number
    rgba: string
  }
  type: string
}

interface ShadowStyles {
  boxShadow?: string
  shadowDetail?: ShadowDetail
}

export function parseShadowStyle(node: SceneNode): ShadowStyles {
  if (!('effects' in node) || node.effects.length === 0 || !node.visible)
    return {}

  const effect = node.effects.find(
    e => e.type === 'DROP_SHADOW' && e.visible,
  ) as DropShadowEffect
  if (!effect) return {}

  const { r, g, b, a } = effect.color
  const rgbaStr = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`

  return {
    boxShadow: `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${rgbaStr}`,
    shadowDetail: {
      offset: {
        x: effect.offset.x,
        y: effect.offset.y,
      },
      radius: effect.radius,
      color: {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a,
        rgba: rgbaStr,
      },
      type: effect.type,
    },
  }
}
