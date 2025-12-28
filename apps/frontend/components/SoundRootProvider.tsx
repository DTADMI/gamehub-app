"use client";

import {SoundProvider} from "@games/shared";
import React from "react";

type Props = {
    children: React.ReactNode;
};

export default function SoundRootProvider({children}: Props) {
    return <SoundProvider>{children}</SoundProvider>;
}
