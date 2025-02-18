import { singleton } from "./utils";
import { getFigmaNodes, getFigmaImages, getBase64ByImageRef } from "@/api";
import { checkAuthorize } from "@/oAuth";
import type { GetFileNodesResponse } from '@figma/rest-api-spec'

class FigmaCore {
  private fileKey!: string;
  private nodeId!: string;

  public setUrl(url: string) {
    this.parserUrl(url);
  }
  private parserUrl(url: string) {
    const urlObject = new URL(url);
    const fileKey = urlObject.pathname.split("/")[2];
    const nodeId = urlObject.searchParams.get("node-id") as string;
    this.fileKey = fileKey;
    this.nodeId = nodeId;
  }
  public async getFigmaNodes(): Promise<GetFileNodesResponse> {
    await checkAuthorize();
    const response = await getFigmaNodes({
      fileKey: this.fileKey,
      nodeId: this.nodeId,
    });
    return response;
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
}

const SingleFigmaCore = singleton(FigmaCore);

export { SingleFigmaCore };
