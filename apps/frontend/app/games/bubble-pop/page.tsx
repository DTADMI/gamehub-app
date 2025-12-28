"use client";

import dynamic from "next/dynamic";
import {useEffect} from "react";

import {GameShell} from "@/components/games/GameShell";
import MiniBoard from "@/components/leaderboards/MiniBoard";
import {useAuth} from "@/contexts/AuthContext";
import {submitScore} from "@/lib/graphql/queries";

const BubblePopGame = dynamic(
    () => import("@games/bubble-pop").then((m) => m.BubblePopGame),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading game...</div>
            </div>
        ),
    },
);

export default function BubblePopPage() {
    const {user} = useAuth();

    useEffect(() => {
        const handler = async (e: Event) => {
            const detail = (e as CustomEvent).detail as
                | { score?: number }
                | undefined;
            const score = detail?.score ?? 0;
            if (user && score > 0) {
                try {
                    await submitScore({
                        gameType: "BUBBLE_POP",
                        score,
                        metadata: {client: "web"},
                    });
                } catch (err) {
                    console.warn("submitScore failed (BUBBLE_POP)", err);
                }
            }
        };
        window.addEventListener("bubble-pop:gameover", handler as EventListener);
        window.addEventListener("game:gameover", handler as EventListener);
        return () => {
            window.removeEventListener(
                "bubble-pop:gameover",
                handler as EventListener,
            );
            window.removeEventListener("game:gameover", handler as EventListener);
        };
    }, [user]);

    return (
        <GameShell
            ariaLabel="Bubble Pop game"
            tips="Click or tap to pop bubbles — chain pops for higher scores"
        >
            <BubblePopGame/>
            <div className="px-4">
                <MiniBoard gameType="BUBBLE_POP" limit={10}/>
            </div>
        </GameShell>
    );
}
