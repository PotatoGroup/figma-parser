import { getToken, SingleFigmaAuth } from "@/oAuth";

const cacheMap = new Map<string, Response>();
export const request = async (url: string, options?: RequestInit) => {
  const auth = new SingleFigmaAuth();
  if (cacheMap.has(url)) {
    const response = cacheMap.get(url)?.clone() as Response;
    return response;
  }
  const { headers, ...rest } = options ?? {};
  const doFetch = async () => {
    const access_token = getToken().access_token;
    return fetch(url, {
      headers: {
        ...headers,
        Authorization: `Bearer ${access_token}`,
      },
      ...rest,
    });
  };
  let response = await doFetch();
  if (response.status === 403) {
    await auth.refreshToken();
    response = await doFetch();
  }
  if (response.status === 404) {
    auth.reauth();
    throw new Error("No access permission");
  }
  cacheMap.set(url, response);
  return response;
};
