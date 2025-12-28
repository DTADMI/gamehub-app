"use client";

import dynamic from "next/dynamic";

// Dynamically import the AdminGeoPageClient component with no SSR
const AdminGeoPageClient = dynamic(() => import("./AdminGeoPageClient"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p>Loading admin panel...</p>
            </div>
        </div>
    ),
});

export default function AdminGeoPage() {
    return <AdminGeoPageClient/>;
}
