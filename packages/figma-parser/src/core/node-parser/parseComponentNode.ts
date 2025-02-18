import type { ComponentNode } from "@figma/rest-api-spec";
import type { IExtendedFigmaNode } from "@/types";
import { parseNode } from ".";
import { commonStyles, generateClassName, generateCSS } from "@/core/utils";

export const parseComponentNode = async (
  node: ComponentNode & IExtendedFigmaNode,
  images: { [key: string]: string },
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  const containerClassName = generateClassName("component");

  let childrenHtml = "";
  let css = "";

  for (const child of node.children) {
    const result = await parseNode(child, images, false);
    childrenHtml += result.html;
    css += result.css;
  }

  const containerStyles: { [key: string]: string } = Object.assign(
    {},
    commonStyles(node, {}, isTopLevel)
  );

  css += generateCSS(containerStyles, containerClassName);
  const html = `<div data-component-id="${node.id}" class="${containerClassName}">${childrenHtml}</div>`;

  return { html, css };
};
