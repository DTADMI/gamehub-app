"use client";

import dynamic from "next/dynamic";
import {Suspense} from "react";

// Client-side only form to avoid hydration issues
const LoginForm = dynamic(() => import("./LoginForm"), {
    ssr: false,
});

// Loading skeleton component
function LoadingSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-10">
            <div
                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"/>
                <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingSkeleton/>}>
            <LoginForm/>
        </Suspense>
    );
}
