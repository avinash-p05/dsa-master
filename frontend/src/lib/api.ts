/**
 * Thin fetch wrapper for the Spring Boot API (same origin, session cookie auth).
 * Spring Security issues a CSRF token in the XSRF-TOKEN cookie; every
 * state-changing request must echo it in the X-XSRF-TOKEN header.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Stable error code from the server, e.g. "EMAIL_NOT_VERIFIED". */
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Human-readable message for any thrown error. */
export const errorMessage = (err: unknown, fallback = "Something went wrong. Please try again.") =>
  err instanceof ApiError ? err.message : fallback;

function readCookie(name: string): string | undefined {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const token = readCookie("XSRF-TOKEN");
    if (token) headers["X-XSRF-TOKEN"] = token;
  }

  const res = await fetch(path, {
    method,
    headers,
    credentials: "same-origin",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    let message = res.statusText || `Request failed (${res.status})`;
    let code: string | undefined;
    try {
      const problem = (await res.json()) as { detail?: string; code?: string };
      if (problem.detail) message = problem.detail;
      code = problem.code;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message, code);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------- API types (mirror the backend DTOs) ---------- */

/** "password" = email/password sign-in is enabled on the server. */
export type AuthProviderId = "github" | "google" | "password" | "dev";
export type OAuthProviderId = "github" | "google";

export interface ApiUser {
  id: number;
  provider: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

export interface SessionInfo {
  authenticated: boolean;
  user: ApiUser | null;
  providers: AuthProviderId[];
}

/** One problem's progress. Timestamps are epoch milliseconds. */
export interface ProgressEntryDto {
  slug: string;
  solvedAt: number | null;
  reviewStage: number;
  lastReviewedAt: number | null;
  flagged: boolean;
  note: string | null;
}

/* ---------- Endpoints ---------- */

export const api = {
  session: () => request<SessionInfo>("GET", "/api/auth/session"),
  devLogin: () => request<ApiUser>("POST", "/api/dev/login"),
  logout: () => request<void>("POST", "/api/auth/logout"),

  register: (body: { email: string; password: string; name?: string }) =>
    request<{ message: string }>("POST", "/api/auth/register", body),
  login: (body: { email: string; password: string }) => request<ApiUser>("POST", "/api/auth/login", body),
  verifyEmail: (token: string) => request<ApiUser>("POST", "/api/auth/verify-email", { token }),
  resendVerification: (email: string) =>
    request<{ message: string }>("POST", "/api/auth/resend-verification", { email }),
  forgotPassword: (email: string) => request<{ message: string }>("POST", "/api/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    request<ApiUser>("POST", "/api/auth/reset-password", { token, password }),

  listProgress: () => request<{ problems: ProgressEntryDto[] }>("GET", "/api/progress"),
  putProgress: (entry: ProgressEntryDto) =>
    request<ProgressEntryDto | undefined>("PUT", `/api/progress/${encodeURIComponent(entry.slug)}`, {
      solvedAt: entry.solvedAt,
      reviewStage: entry.reviewStage,
      lastReviewedAt: entry.lastReviewedAt,
      flagged: entry.flagged,
      note: entry.note,
    }),
  mergeProgress: (problems: ProgressEntryDto[]) =>
    request<{ problems: ProgressEntryDto[] }>("POST", "/api/progress/merge", { problems }),
  resetProgress: () => request<void>("DELETE", "/api/progress"),
};

/** Full-page redirect into Spring Security's OAuth flow. */
export const oauthLoginUrl = (provider: OAuthProviderId) => `/oauth2/authorization/${provider}`;
