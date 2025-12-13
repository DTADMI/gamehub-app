"use client";

import {useSession} from "next-auth/react";

export type FetchOptions = RequestInit & { auth?: boolean };

/**
 * Hook returning a fetch wrapper that injects the access token when available.
 */
export function useAuthedFetch() {
  const { data } = useSession();
  const accessToken: string | undefined = (data as any)?.accessToken;

  return async function authedFetch(
      input: RequestInfo | URL,
      init?: FetchOptions,
  ) {
    const opts: RequestInit = { ...(init || {}) };
    const headers = new Headers(opts.headers as HeadersInit);
    if ((init?.auth ?? true) && accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    // Default to JSON when body is an object
    if (
        opts.body &&
        typeof opts.body === "object" &&
        !(opts.body instanceof FormData)
    ) {
      headers.set("Content-Type", "application/json");
      opts.body = JSON.stringify(opts.body);
    }
    opts.headers = headers;
    return fetch(input, opts);
  };
}
