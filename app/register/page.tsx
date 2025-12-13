"use client";

import Link from "next/link";
import {signIn} from "next-auth/react";
import {useState} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3000/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setLoading(false);
      setError("Password must include upper, lower case letters and a number.");
      return;
    }
    if (password !== confirm) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Registration failed");
      }
      // After signup, sign in with credentials and let NextAuth handle the redirect
      await signIn("credentials", {redirect: true, email, password, callbackUrl: "/"});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create an account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Sign up to save progress, post scores and access more features.
        </p>
        <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              type="text"
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Confirm Password</label>
            <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                type="password"
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link className="text-accent hover:underline" href="/login">
              Sign in
            </Link>
          </p>
          <Link className="text-indigo-600 hover:underline" href="/games">
            Play as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
