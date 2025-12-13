"use client";

import {SessionProvider} from "next-auth/react";

import {ThemeProvider} from "@/components/ThemeProvider";
import {AuthProvider} from "@/contexts/AuthContext";
import {SubscriptionProvider} from "@/contexts/SubscriptionContext";

export function Providers({ children }: { children: React.ReactNode }) {
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
