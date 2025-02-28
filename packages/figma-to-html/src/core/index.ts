import { calculateNodeNumber, parseNode } from "@/core/node-parser";
import {
  singleton,
  InstanceType,
  wrapNode,
  replaceSrcIdentifiers,
  htmlTemplate,
} from "./utils";
import { getFigmaNodes, getFigmaImages, getBase64ByImageRef } from "@/api";
import type { GetFileNodesResponse } from "@figma/rest-api-spec";
import { SingleFigmaAuth, type FigmaAuthOptions } from "@/oAuth";

const pickParams = (url: string) => {
  const urlObject = new URL(url);
  const fileKey = urlObject.pathname.split("/")[2];
  const nodeId = urlObject.searchParams.get("node-id") as string;
  return {
    fileKey,
    nodeId,
  };
};

export type FigmaParserOptions = FigmaAuthOptions;

export type ParseOptions = Partial<{
  onProgress: (progress: number) => void;
}>;

class FigmaCore {
  private fileKey!: string;
  private nodeId!: string;
  private auth!: InstanceType<typeof SingleFigmaAuth>;
  private total!: number;
  private current!: number;
  constructor(options?: FigmaParserOptions) {
    this.auth = new SingleFigmaAuth(options);
  }
  public async parse(url: string, options?: ParseOptions) {
    await this.auth.checkAuthorize();
    this.resetProgress();
    const { html, css } = await this.transform(url, options);
    return htmlTemplate(html, css);
  }
  public async parseBatch(urls: string[], options?: ParseOptions) {
    await this.auth.checkAuthorize();
    this.resetProgress();
    const result = await Promise.all(
      urls.map((url) => this.transform(url, options))
    );
    return result.map(({ html, css }) => htmlTemplate(html, css));
  }

  private async transform(url: string, options?: ParseOptions) {
    const { fileKey, nodeId } = pickParams(url);
    this.fileKey = fileKey;
    this.nodeId = nodeId;
    const file = (await getFigmaNodes({
      fileKey: this.fileKey,
      nodeId: this.nodeId,
    })) as GetFileNodesResponse;
    const figmaDocument = Object.values(file.nodes)[0].document;
    const rootNode = wrapNode(figmaDocument);
    const images = {};
    this.total += calculateNodeNumber(rootNode);
    const { html, css } = await parseNode(rootNode, images, true, () => {
      this.current++;
      options?.onProgress?.(this.current / this.current);
    });
    const previewHtml = replaceSrcIdentifiers(html, images, true);
    return { html: previewHtml, css };
  }

  public async transformNodeToBase64(nodeId: string, format: "png" | "svg") {
    const response = await getFigmaImages({
      nodeId: nodeId ?? this.nodeId,
      fileKey: this.fileKey,
      format,
    });
    const imageUrl = response.images[nodeId];
    if (!imageUrl) return null;
    const base64 = await this.getBase64ByImageUrl(imageUrl);
    return base64 && this.formatBase64(base64, format);
  }
  private async getBase64ByImageUrl(imageUrl: string) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
  private formatBase64(base64: string, format: "png" | "svg") {
    if (format === "png") {
      return base64.startsWith("data:image/png;base64,")
        ? base64
        : `data:image/png;base64,${base64}`;
    }
    return base64.startsWith("data:image/svg+xml;base64,")
      ? base64
      : `data:image/svg+xml;base64,${base64}`;
  }

  public async getBase64ByImageRef(imageRef: string) {
    const response = await getBase64ByImageRef({ imageRef });
    const data = await response.json();
    const base64 = data.images[imageRef];
    return base64 && this.formatBase64(base64, "png");
  }
  private resetProgress() {
    this.total = 0;
    this.current = 0;
  }
}

const FigmaParser = singleton(FigmaCore);

export { FigmaParser };
