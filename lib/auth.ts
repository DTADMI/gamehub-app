"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export type AuthState = {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
  accessToken?: string;
  refreshToken?: string;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: typeof signIn;
  signOut: typeof signOut;
};

export function useAuth(): AuthState {
  const { data, status } = useSession();
  const user = data?.user ?? null;
  return {
    user: user ? { id: (user as any).id, name: user.name, email: user.email } : null,
    accessToken: (data as any)?.accessToken,
    refreshToken: (data as any)?.refreshToken,
    status,
    signIn,
    signOut,
  };
}
