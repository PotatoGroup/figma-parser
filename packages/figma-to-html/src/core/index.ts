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

export type FigmaParserOptions = FigmaAuthOptions & { tpl?: boolean };

export type ParseOptions = Partial<{
  onProgress: (progress: number) => void;
}>;

const errorImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAwCAYAAABAIGlOAAAAAXNSR0IArs4c6QAAAjZJREFUaEPtmFFygzAMRHEu1uYOges0uU7IHUJPplZMnNFQkNYgJ57i/OQHbD2t1pYIzU5+YSecTQX9b0pXRXer6Ol0+iwJ/na7DSnxQKXbtu29aZqiQBkyhHC5Xq9nBBgFJWSxVz+TGzSpZDLBj9WVFbTve6gKMgE2fFaEENhKFXQuyZA6bds+PVoVzVWrk3Vr6RqJrqUrE1Q9qpQLeym1TUNsXpRHYzApFzoCyc8UBSp7YyI6eipbDKgMJKrkefcWAzo36XiW8AP0i6eplHVdr5eu685ExEH8+aUEhfg1zseoLVxB5TXkCSuHfhRsur8bKDqco4eTLNGZpA0hhG906B4nHaRMrIZh7gBS1h36vj9q+6JJ+/XpQEQXRGUX0ITARr4lvyYm7JkrxP+bQT2DMxLGXzYWv1tZltgMah1AWolKJbQTW97Dyn6qJTaBasEh3pegKICmuqbqatC1JSsTEAOzEjZRVPv0uqjqatDUA2hOYRRUKmVYxRfUQ00Gj0pZSYugyL5LffUqRa3AEH+mgPJ9yXevVeJyzc2dER8gS/0sCjidaoDEvR40FUZ7HvVobDKABPt51BM0Xi+I95B9tQ4p2aPIhugzk3tUvTa4ied1NVW1Af+toLLv1VRFlLf63beDxhOVoZVTVT2MLEh4TEOOdbRc555De17rXbWv3hJgzneB5MKzKKxoTiBtbfbt4XAYRzMi+nj8X/gfGbbl2pBH3wXquW8F9cxmCWtVRUtQwTOGHz4GEE9rpxzOAAAAAElFTkSuQmCC`;

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
    const previewHtml = replaceSrcIdentifiers(html, images, true);
    return { html: previewHtml, css };
  }

  public async transformNodeToBase64(nodeId: string, format: "png" | "svg") {
    const response = await getFigmaImages({
      nodeId: nodeId ?? this.nodeId,
      fileKey: this.fileKey,
      format,
    });
    const imageUrl = response.images?.[nodeId];
    if (!imageUrl) return errorImage;
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
    const base64 = data.images?.[imageRef];
    return base64 && this.formatBase64(base64, "png");
  }
  private resetProgress() {
    this.total = 0;
    this.current = 0;
  }
}

const FigmaParser = singleton<FigmaParserOptions>(FigmaCore);

export { FigmaParser };
