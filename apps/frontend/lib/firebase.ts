// lib/firebase.ts
"use client";
import {getApp, getApps, initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const isBrowser = typeof window !== "undefined";

const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function validateConfig() {
    const missing: string[] = [];
    for (const [k, v] of Object.entries(config)) {
        if (!v && ["apiKey", "authDomain", "projectId", "appId"].includes(k)) {
            missing.push(`NEXT_PUBLIC_FIREBASE_${k.toUpperCase()}`);
        }
    }
    if (missing.length && isBrowser) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("Missing Firebase envs:", missing);
        }
    }
}

export function getFirebaseApp() {
    if (!isBrowser) {
        return undefined;
    } // never initialize on server
    validateConfig();
    return getApps().length ? getApp() : initializeApp(config as any);
}

export function getFireStore() {
    const app = getFirebaseApp();
    return app ? getFirestore(app) : getFirestore();
}

export function getFirebaseAuth() {
    return getAuth(getFirebaseApp());
}
