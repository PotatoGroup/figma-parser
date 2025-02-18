import {
  ClientId,
  ClientSecret,
  SCOPE,
  REDIRECT_URI,
  REFRESH_TOKEN_URL,
  TOKEN_URL,
} from "./const";
export function uuid() {
  return (Math.random() * 100000 * Date.now()).toString(36);
}

const getCredentials = () => btoa(`${ClientId}:${ClientSecret}`);

export function oauthFigma() {
  const state = uuid();
  sessionStorage.setItem("oauth_state", state);
  const authUrl = `https://www.figma.com/oauth?client_id=${ClientId}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${state}&response_type=code`;
  window.location.href = authUrl;
}

export async function exchangeCodeForToken(code: string) {
  const credentials = getCredentials();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      ["Content-Type"]: "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      ["redirect_uri"]: REDIRECT_URI,
      code,
      ["grant_type"]: "authorization_code",
    }).toString(),
  });
  const data = await response.json();
  sessionStorage.setItem("figma_token", data.access_token);
}

export async function refreshToken() {
  const refreshToken = sessionStorage.getItem("figma_refresh_token") as string;
  const credentials = getCredentials();
  const response = await fetch(REFRESH_TOKEN_URL, {
    method: "POST",
    headers: {
      ["Content-Type"]: "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      ["refresh_token"]: refreshToken,
    }).toString(),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.message || "刷新 token 失败");
  }
  if (data.access_token) {
    sessionStorage.setItem("figma_token", data.access_token);
    sessionStorage.setItem("figma_refresh_token", data.refresh_token);
  }
}

export const checkAuthorize = async () => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const lastState = sessionStorage.getItem("oauth_state");
  if (!code || state !== lastState) {
    return oauthFigma();
  }
  const token = sessionStorage.getItem("figma_token");
  if (!token) {
    await exchangeCodeForToken(code);
  }
};
