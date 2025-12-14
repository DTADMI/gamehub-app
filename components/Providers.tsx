"use client";

import {SessionProvider} from "next-auth/react";

import {ThemeProvider} from "@/components/ThemeProvider";
import {AuthProvider} from "@/contexts/AuthContext";
import {SubscriptionProvider} from "@/contexts/SubscriptionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  // In CI/E2E we want to avoid initializing Firebase/Auth and hitting the backend
  // because those external calls can cause client-side exceptions that break Playwright.
  // We keep them enabled for normal local/dev usage.
  const disableExternalProviders =
      process.env.NEXT_PUBLIC_DISABLE_PROVIDERS === "true" ||
      process.env.CI === "true";

  if (disableExternalProviders) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
    );
  }

  return (
    <SessionProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

export default Providers;
