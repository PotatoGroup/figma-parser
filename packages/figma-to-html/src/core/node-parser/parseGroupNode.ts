import type { GroupNode } from "@figma/rest-api-spec";
import type { IExtendedFigmaNode } from "@/types";
import { parseNode } from ".";
import { commonStyles, generateClassName, generateCSS } from "@/core/utils";

export const parseGroupNode = async (
  node: GroupNode & IExtendedFigmaNode,
  images: { [key: string]: string },
  isTopLevel = false
): Promise<{ html: string; css: string }> => {
  const containerClassName = generateClassName("group");

  let childrenHtml = "";
  let css = "";

  for (const child of node.children) {
    const result = await parseNode(child, images, false);
    childrenHtml += result.html;
    css += result.css;
  }

  const containerStyles = Object.assign({}, commonStyles(node, {}, isTopLevel));

  css += generateCSS(containerStyles, containerClassName);
  const html = `<div class="${containerClassName}">${childrenHtml}</div>`;

  return { html, css };
};
