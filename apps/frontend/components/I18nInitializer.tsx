"use client";

import {useEffect} from "react";

import {initI18n} from "@/lib/i18n";

export function I18nInitializer() {
    useEffect(() => {
        initI18n();
    }, []);
    return null;
}

export default I18nInitializer;
