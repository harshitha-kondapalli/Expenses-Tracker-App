import { requestJson, requestVoid } from "./api";

interface BackendUserProfile {
  id: number;
  email: string;
  created_at: string;
}

interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: BackendUserProfile;
}

export interface AuthSession {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

const buildDisplayName = (email: string) => {
  const localPart = email.split("@")[0] ?? "User";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const adaptSession = (response: AuthTokenResponse): AuthSession => ({
  accessToken: response.access_token,
  user: {
    id: String(response.user.id),
    email: response.user.email,
    name: buildDisplayName(response.user.email),
    createdAt: response.user.created_at
  }
});

export const registerWithApi = async (input: { email: string; password: string }) => {
  const response = await requestJson<AuthTokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });

  return adaptSession(response);
};

export const loginWithApi = async (input: { email: string; password: string }) => {
  const response = await requestJson<AuthTokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });

  return adaptSession(response);
};

export const getMeWithApi = async () => {
  const response = await requestJson<BackendUserProfile>("/auth/me");
  return {
    id: String(response.id),
    email: response.email,
    name: buildDisplayName(response.email),
    createdAt: response.created_at
  };
};

export const logoutWithApi = async () => {
  await requestVoid("/auth/logout", {
    method: "POST"
  });
};
