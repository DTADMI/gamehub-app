"use client";

import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {signIn} from "next-auth/react";
import {useState} from "react";

import {Icons} from "@/components/icons";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useToast} from "@/components/ui/use-toast";

export default function LoginForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  // Sanitize callbackUrl: enforce same-origin relative path to avoid cross-origin redirects
  const rawCb = searchParams.get("callbackUrl") || "/";
  const callbackUrl = rawCb.startsWith("/") ? rawCb : "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const _result = await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl,
      });
      // When redirect=true NextAuth will navigate; no manual push required
    } catch {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-10">
        <div
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Sign in to track scores, compete on leaderboards, and unlock extra
            features.
          </p>

          <form
              onSubmit={onSubmit}
              className="space-y-4"
              autoComplete="on"
              data-1p-ignore
              data-lpignore
          >
            <div className="space-y-2">
              <Label
                  className="block text-sm mb-1 text-gray-700 dark:text-gray-200"
                  htmlFor="email"
              >
                Email
              </Label>
              <Input
                  id="email"
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={loading}
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                  id="password"
                  placeholder="••••••••"
                  disabled={loading}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
                <p
                    className="text-sm text-red-600"
                    role="status"
                    aria-live="polite"
                >
                  {error}
                </p>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary text-primary-foreground py-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
                    Signing in...
                  </>
              ) : (
                  "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"/>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
                variant="outline"
                type="button"
                disabled={loading}
                className="border-gray-300 dark:border-gray-600"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await signIn("google", {callbackUrl});
                  } finally {
                    setLoading(false);
                  }
                }}
            >
              {loading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
              ) : (
                  <Icons.google className="mr-2 h-4 w-4"/>
              )}{" "}
              Google
            </Button>
            <Button
                variant="outline"
                type="button"
                disabled={loading}
                className="border-gray-300 dark:border-gray-600"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await signIn("github", {callbackUrl});
                  } finally {
                    setLoading(false);
                  }
                }}
            >
              {loading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
              ) : (
                  <Icons.github className="mr-2 h-4 w-4"/>
              )}{" "}
              GitHub
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              No account?{" "}
              <Link
                  className="font-medium text-accent underline-offset-4 hover:underline"
                  href="/register"
              >
                Sign up
              </Link>
            </p>
            <Link
                className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                href="/games"
            >
              Play as guest
            </Link>
          </div>
      </div>
    </div>
  );
}
