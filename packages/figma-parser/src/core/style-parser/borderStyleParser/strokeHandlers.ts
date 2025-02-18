import type { FigmaNode, GradientLinearPaint } from "@/types";
import type { SolidPaint } from "@figma/rest-api-spec";
import type { BorderSide, BorderStyles } from "./types";

function handleSolidStroke(
  stroke: SolidPaint,
  width: number,
  styles: BorderStyles
) {
  const { r, g, b } = stroke.color;
  const opacity = stroke.opacity !== undefined ? stroke.opacity : 1;
  const rgbStr = `rgb(${Math.round(r * 255)}, ${Math.round(
    g * 255
  )}, ${Math.round(b * 255)})`;
  const rgbaStr = `rgba(${Math.round(r * 255)}, ${Math.round(
    g * 255
  )}, ${Math.round(b * 255)}, ${opacity})`;

  const borderSide: BorderSide = {
    width,
    color: {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: opacity,
      rgb: rgbStr,
      rgba: rgbaStr,
    },
    style: "solid",
  };

  const borderStr = `${width}px solid ${rgbaStr}`;
  styles.borderTop = borderStr;
  styles.borderRight = borderStr;
  styles.borderBottom = borderStr;
  styles.borderLeft = borderStr;
  styles.border = borderStr;

  styles.borderDetail = {
    top: borderSide,
    right: borderSide,
    bottom: borderSide,
    left: borderSide,
  };
}

function handleGradientStroke(
  stroke: GradientLinearPaint,
  width: number,
  styles: BorderStyles
) {
  const gradientStops = stroke.gradientStops;
  const gradientTransform = stroke.gradientTransform;

  const angle =
    Math.atan2(gradientTransform[0][1], gradientTransform[0][0]) *
    (180 / Math.PI);

  const gradientColors = gradientStops.map((stop) => {
    const { r, g, b } = stop.color;
    const a = stop.color.a !== undefined ? stop.color.a : 1;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
      b * 255
    )}, ${a})`;
  });

  const gradientPositions = gradientStops.map((stop) =>
    Math.round(stop.position * 100)
  );

  const gradientString = `linear-gradient(${angle}deg, ${gradientStops
    .map((_, index) => `${gradientColors[index]} ${gradientPositions[index]}%`)
    .join(", ")})`;

  const borderStr = `${width}px solid`;
  styles.borderTop = borderStr;
  styles.borderRight = borderStr;
  styles.borderBottom = borderStr;
  styles.borderLeft = borderStr;
  styles.border = borderStr;

  styles.borderDetail = {
    top: {
      width,
      color: { r: 0, g: 0, b: 0, a: 0, rgb: "", rgba: "" },
      style: "gradient",
      gradient: gradientString,
    },
    right: {
      width,
      color: { r: 0, g: 0, b: 0, a: 0, rgb: "", rgba: "" },
      style: "gradient",
      gradient: gradientString,
    },
    bottom: {
      width,
      color: { r: 0, g: 0, b: 0, a: 0, rgb: "", rgba: "" },
      style: "gradient",
      gradient: gradientString,
    },
    left: {
      width,
      color: { r: 0, g: 0, b: 0, a: 0, rgb: "", rgba: "" },
      style: "gradient",
      gradient: gradientString,
    },
  };
}

export function handleStroke(node: FigmaNode, styles: BorderStyles) {
  // 处理边框
  if ("strokeWeight" in node && "strokes" in node && node.strokes) {
    const strokes = node.strokes;
    // 添加对 strokeWeight 的检查，必须大于等于 0.5
    if (
      strokes.length > 0 &&
      strokes[0].visible !== false &&
      typeof node.strokeWeight === "number" &&
      node.strokeWeight >= 0.5
    ) {
      const stroke = strokes[0];
      const width =
        typeof node.strokeWeight === "number" ? node.strokeWeight : 0;

      if (stroke.type === "SOLID") {
        handleSolidStroke(stroke, width, styles);
      } else if (stroke.type === "GRADIENT_LINEAR") {
        handleGradientStroke(stroke, width, styles);
      }
    }
  }
}
