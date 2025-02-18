export interface BorderSide {
  width: number
  color: {
    r: number
    g: number
    b: number
    a: number
    rgb: string
    rgba: string
  }
  style?: string
  gradient?: string
}

export interface BorderDetail {
  top?: BorderSide
  right?: BorderSide
  bottom?: BorderSide
  left?: BorderSide
}

export interface RadiusDetail {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
}

export interface BorderStyles {
  border?: string
  borderTop?: string
  borderRight?: string
  borderBottom?: string
  borderLeft?: string
  borderRadius?: string
  borderDetail?: BorderDetail
  radiusDetail?: RadiusDetail
}
