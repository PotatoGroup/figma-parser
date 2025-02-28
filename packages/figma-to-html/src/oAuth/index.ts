import { SCOPE, REDIRECT_URI, REFRESH_TOKEN_URL, TOKEN_URL } from "./const";
import { singleton, uuid } from "@/core/utils";

type FigmaToken = {
  access_token: string;
  refresh_token: string;
  code: string;
  state: string;
};

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

export type FigmaAuthOptions = {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
};

class FigmaAuth {
  private clientId!: string;
  private clientSecret!: string;
  private redirectUri!: string;
  constructor(options?: FigmaAuthOptions) {
    this.clientId = options?.clientId!;
    this.clientSecret = options?.clientSecret!;
    this.redirectUri = options?.redirectUri || REDIRECT_URI;
  }
  private getCredentials() {
    return btoa(`${this.clientId}:${this.clientSecret}`);
  }
  private oauthFigma() {
    const state = uuid();
    setToken({ state });
    const authUrl = `https://www.figma.com/oauth?client_id=${this.clientId}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${state}&response_type=code`;
    window.location.href = authUrl;
  }
  private async exchange(code: string) {
    const credentials = this.getCredentials();
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
  public async checkAuthorize() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("clientId or clientSecret is required");
    }
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const { state: lastState, access_token } = getToken();
    if (!code || state !== lastState) {
      return this.oauthFigma();
    }
    if (!access_token) {
      await this.exchange(code);
    }
  }
  public async refreshToken() {
    const refresh_token = getToken().refresh_token;
    const credentials = this.getCredentials();
    const response = await fetch(REFRESH_TOKEN_URL, {
      method: "POST",
      headers: {
        ["Content-Type"]: "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        ["refresh_token"]: refresh_token,
      }).toString(),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.message || "refresh token failed");
    }
    setToken({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  }
  public reauth() {
    history.pushState(null, "", this.redirectUri);
    cleanToken();
    this.checkAuthorize();
  }
}

const SingleFigmaAuth = singleton<FigmaAuthOptions>(FigmaAuth);

export { SingleFigmaAuth };
