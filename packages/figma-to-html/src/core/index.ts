import { calculateNodeNumber, parseNode } from "@/core/node-parser";
import {
  singleton,
  InstanceType,
  wrapNode,
  replaceSrcIdentifiers,
  htmlTemplate,
  formatBase64,
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

export type FigmaParserOptions = FigmaAuthOptions & {
  tpl?: boolean;
  placeholderImage?: string;
  imageResolver?: (url: string) => Promise<string>;
};

export type ParseOptions = Partial<{
  onProgress: (progress: number) => void;
}>;

class FigmaCore {
  private auth!: InstanceType<typeof SingleFigmaAuth>;
  private fileKey!: string;
  private nodeId!: string;
  private options!: FigmaParserOptions;
  private total!: number;
  private current!: number;

  constructor(options?: FigmaParserOptions) {
    this.auth = new SingleFigmaAuth(options);
    this.options = Object.assign({ tpl: true }, options);
  }
  public get checkAuthorize() {
    return this.auth.checkAuthorize.bind(this.auth);
  }
  public async parse(url: string, options?: ParseOptions) {
    await this.auth.checkAuthorize();
    this.resetProgress();
    const { html, css } = await this.transform(url, options);
    if (this.options.tpl) {
      return htmlTemplate(html, css);
    }
    return {
      html,
      css,
    };
  }
  public async parseBatch(urls: string[], options?: ParseOptions) {
    await this.auth.checkAuthorize();
    this.resetProgress();
    const result = await Promise.all(
      urls.map((url) => this.transform(url, options))
    );
    return result.map(({ html, css }) =>
      this.options.tpl ? htmlTemplate(html, css) : { html, css }
    );
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
      options?.onProgress?.(Math.floor((this.current / this.total) * 100));
    });
    const previewHtml = replaceSrcIdentifiers(html, images);
    return { html: previewHtml, css };
  }

  public async resolveImageNode(nodeId: string, format: "png" | "svg") {
    const response = await getFigmaImages({
      nodeId: nodeId ?? this.nodeId,
      fileKey: this.fileKey,
      format,
    });
    const imageUrl = response.images?.[nodeId];
    if (!imageUrl) return this.options.placeholderImage;
    const imageResolver =
      this.options.imageResolver || this.getBase64ByImageUrl;
    return imageResolver.call(this, imageUrl, format);
  }
  private async getBase64ByImageUrl(imageUrl: string, format: "png" | "svg") {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(formatBase64(base64, format));
      };
      reader.readAsDataURL(blob);
    });
  }

  public async getBase64ByImageRef(imageRef: string) {
    const response = await getBase64ByImageRef({ imageRef });
    const data = await response.json();
    const base64 = data.images?.[imageRef];
    return base64 && formatBase64(base64, "png");
  }
  private resetProgress() {
    this.total = 0;
    this.current = 0;
  }
}

const FigmaParser = singleton<FigmaParserOptions, FigmaCore>(FigmaCore);

export { FigmaParser };
