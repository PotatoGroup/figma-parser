import {
  ClientId,
  ClientSecret,
  SCOPE,
  REDIRECT_URI,
  REFRESH_TOKEN_URL,
  TOKEN_URL,
} from "./const";

type FigmaToken = {
  access_token: string;
  refresh_token: string;
  code: string;
  state: string;
};

export function uuid() {
  return (Math.random() * 100000 * Date.now()).toString(36);
}

const getCredentials = () => btoa(`${ClientId}:${ClientSecret}`);

export const getToken = () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    return JSON.parse(token);
  }
  return {};
};

const setToken = (values: Partial<FigmaToken>) => {
  const token = getToken();
  sessionStorage.setItem("token", JSON.stringify(Object.assign(token, values)));
};

const cleanToken = () => {
  sessionStorage.removeItem("token");
};

export function oauthFigma() {
  const state = uuid();
  setToken({ state });
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
  setToken({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}

export async function refreshToken() {
  const refreshToken = getToken().refresh_token;
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
  setToken({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}

export const checkAuthorize = async () => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const { state: lastState, token } = getToken();
  if (!code || state !== lastState) {
    return oauthFigma();
  }
  if (!token) {
    await exchangeCodeForToken(code);
  }
};

export const reauth = () => {
  history.pushState(null, "", location.origin);
  cleanToken();
  checkAuthorize();
};
