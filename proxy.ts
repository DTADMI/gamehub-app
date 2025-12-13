import {NextRequest, NextResponse} from "next/server";

// Protected route prefixes. Adjust as needed.
const PROTECTED_PREFIXES = ["/dashboard"]; // sample private area used by E2E

export default function proxy(req: NextRequest) {
    // Allow bypass during certain local workflows (used by E2E when needed)
    const publicMode = process.env.E2E_PUBLIC_MODE === "true";
    if (publicMode) {
        return; // continue the request normally
    }

    const {pathname, search} = req.nextUrl;

    // Skip static assets and public routes
    if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/next/") ||
        pathname.startsWith("/api/") ||
        pathname.startsWith("/login") ||
        pathname === "/" ||
        pathname === "/projects" ||
        pathname.startsWith("/games/")
    ) {
        return; // let it through
    }

    // Protect selected paths by redirecting to /login?redirect=...
    if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        const redirect = encodeURIComponent(pathname + (search || ""));
        url.search = `?redirect=${redirect}`;
        return NextResponse.redirect(url);
    }

    // Default: continue
    return;
}

export const config = {
    matcher: ["/(.*)"],
};
