"use client";

import * as React from "react";
import {getLocale, initI18n, setLocale} from "@/lib/i18n";
import {useRouter} from "next/navigation";

/**
 * Small EN/FR language toggle for the header.
 * - Persists selection to localStorage via lib/i18n
 * - Calls router.refresh() to re-render client components using `t()`
 * - Accessible: ≥44px target, aria-label, role, and data-testid hooks
 */
export function LanguageToggle({className = ""}: { className?: string }) {
    const router = useRouter();
    const [locale, setLoc] = React.useState<"en" | "fr">("en");

    React.useEffect(() => {
        initI18n();
        setLoc(getLocale());
    }, []);

    const switchTo = (l: "en" | "fr") => {
        if (l === locale) return;
        setLocale(l);
        setLoc(l);
        // Trigger a soft refresh so components reading `t()` re-render
        try {
            router.refresh();
        } catch {
        }
    };

    return (
        <div className={`inline-flex items-center gap-1 ${className}`} role="group" aria-label="Language selector">
            <button
                type="button"
                onClick={() => switchTo("en")}
                className={`min-h-11 px-3 rounded text-sm border ${locale === "en" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                aria-pressed={locale === "en"}
                aria-label="Switch language to English"
                data-testid="lang-en"
            >EN
            </button>
            <button
                type="button"
                onClick={() => switchTo("fr")}
                className={`min-h-11 px-3 rounded text-sm border ${locale === "fr" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                aria-pressed={locale === "fr"}
                aria-label="Changer la langue en français"
                data-testid="lang-fr"
            >FR
            </button>
        </div>
    );
}

export default LanguageToggle;
