"use client";

import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {useFeature} from "@/lib/flags";

// Dynamically import the ThreeScene component with no SSR
const ThreeScene = dynamic(() => import("@/components/admin/ThreeScene"), {
    ssr: false,
    loading: () => (
        <div
            className="w-full aspect-video max-w-5xl mx-auto rounded border bg-gray-900 flex items-center justify-center">
            <p className="text-white">Loading 3D viewer...</p>
        </div>
    ),
});

export default function AdminGeoPageClient() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const isAdminFlag = useFeature("ADMIN", false);

    // This ensures the component only renders on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    const isAdmin = isAdminFlag === true;

    useEffect(() => {
        // If not loading and not admin, redirect to home
        if (!isAdmin) {
            router.push("/");
        }
    }, [isAdmin, router]);

    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        You need admin access to view this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">3D Model Editor</h1>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <ThreeScene/>
                </div>
            </div>
        </div>
    );
}
