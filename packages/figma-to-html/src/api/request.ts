import { checkAuthorize, refreshToken } from "@/oAuth";
export const request = async (url: string, options?: RequestInit) => {
  const { headers, ...rest } = options ?? {};
  const doFetch = async () => {
    const token = sessionStorage.getItem("access_token");
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
    history.pushState(null, "", location.origin);
    checkAuthorize();
    throw new Error("no access permission");
  }
  return response;
};
