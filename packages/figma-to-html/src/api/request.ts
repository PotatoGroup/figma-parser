import { refreshToken, reauth, getToken } from "@/oAuth";
export const request = async (url: string, options?: RequestInit) => {
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
    await refreshToken();
    response = await doFetch();
  }
  if (response.status === 404) {
    reauth();
    throw new Error("No access permission");
  }
  return response;
};
