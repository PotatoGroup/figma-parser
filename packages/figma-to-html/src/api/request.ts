import { refreshToken } from "@/oAuth";
export const request = async (url: string, options?: RequestInit) => {
  const { headers, ...rest } = options ?? {};
  const doFetch = async () => {
    const token = sessionStorage.getItem("figma_token");
    return fetch(url, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
      ...rest,
    });
  };
  let response = await doFetch();
  if (response.status === 403) {
    await refreshToken();
    response = await doFetch();
  }
  if (response.status === 404) {
    throw new Error("no access permission");
  }
  return response;
};
