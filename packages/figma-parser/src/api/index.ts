import { request } from "./request";

const BaseUrl = "https://api.figma.com/v1";

export const getFigmaNodes = async ({
  fileKey,
  nodeId,
}: {
  fileKey: string;
  nodeId: string;
}) => {
  const response = await request(
    `${BaseUrl}/files/${fileKey}/nodes?ids=${nodeId}&geometry=paths`
  );
  return response.json();
};

export const getFigmaImages = async ({
  fileKey,
  nodeId,
  format,
}: {
  fileKey: string;
  nodeId: string;
  format?: string;
}) => {
  const response = await request(
    `${BaseUrl}/images/${fileKey}?ids=${nodeId}&format=${format}`
  );
  return response.json();
};

export const getBase64ByImageRef = async ({
  imageRef,
}: {
  imageRef: string;
}) => {
  const response = await request(`${BaseUrl}/images/${imageRef}?format=png`);
  return response.json();
};
