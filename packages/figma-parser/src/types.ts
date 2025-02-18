import type {
  GradientPaint,
  HasLayoutTrait,
  ImagePaint,
  Node,
  SolidPaint,
  TypeStyle,
} from '@figma/rest-api-spec'

export interface IExtendedFigmaNode {
  getStyledTextSegments: (
    styleTypes: (keyof TypeStyle)[],
  ) => Record<string, any>[]
  parent?: FigmaNode
  children?: FigmaNode[]
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM'
  fills?: ExtendedPaint[]
  strokes?: ExtendedPaint[]
  width: number
  height: number
  topLeftRadius: number
  topRightRadius: number
  bottomLeftRadius: number
  bottomRightRadius: number
}

export interface GradientLinearPaint extends GradientPaint {
  type: 'GRADIENT_LINEAR'
  gradientTransform: number[][]
}

export type ExtendedPaint = GradientLinearPaint | SolidPaint | ImagePaint

export type FigmaNode = Node & IExtendedFigmaNode & HasLayoutTrait
