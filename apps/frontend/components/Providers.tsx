"use client";

import {SessionProvider} from "next-auth/react";

import {ThemeProvider} from "@/components/ThemeProvider";
import {AuthProvider} from "@/contexts/AuthContext";
import {FlagsProvider} from "@/contexts/FlagsContext";
import {ProfileProvider} from "@/contexts/ProfileContext";
import {SubscriptionProvider} from "@/contexts/SubscriptionContext";

export function Providers({children}: { children: React.ReactNode }) {
    // In CI/E2E we want to avoid initializing Firebase/Auth and hitting the backend
    // because those external calls can cause client-side exceptions that break Playwright.
    // We keep them enabled for normal local/dev usage.
    // IMPORTANT: Do NOT couple this to CI directly, because Next.js production
    // builds also run with CI=true in pipelines. Only disable when explicitly
    // requested via NEXT_PUBLIC_DISABLE_PROVIDERS (set by E2E runner).
    const disableExternalProviders =
        process.env.NEXT_PUBLIC_DISABLE_PROVIDERS === "true";

    if (disableExternalProviders) {
        return (
            <FlagsProvider>
                <ProfileProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        {children}
                    </ThemeProvider>
                </ProfileProvider>
            </FlagsProvider>
        );
    }

    return (
        <SessionProvider>
            <AuthProvider>
                <SubscriptionProvider>
                    <FlagsProvider>
                        <ProfileProvider>
                            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                                {children}
                            </ThemeProvider>
                        </ProfileProvider>
                    </FlagsProvider>
                </SubscriptionProvider>
            </AuthProvider>
        </SessionProvider>
    );
}

export default Providers;
