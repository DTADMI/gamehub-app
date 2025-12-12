import {gqlFetch} from "./client";

// Types aligned with current backend schema shared by the user
export type LeaderboardUser = {
    id: string;
    username: string;
    email?: string | null;
    avatar?: string | null;
};

export type LeaderboardEntry = {
    rank: number;
    user: LeaderboardUser;
    score: number;
    gameType: string;
};

export async function fetchLeaderboard(params: {
    gameType: string;
    limit?: number;
}): Promise<{ leaderboard: LeaderboardEntry[] }> {
    const query = `
    query Leaderboard($gameType: String!, $limit: Int) {
      leaderboard(gameType: $gameType, limit: $limit) {
        rank
        score
        gameType
        user { id username avatar }
      }
    }
  `;
    return gqlFetch({query, variables: params});
}

export type SubmitScoreResult = {
    submitScore: {
        id: string;
        score: number;
        createdAt: string;
        gameType: string;
        user: LeaderboardUser;
    };
};

export async function submitScore(params: {
    gameType: string;
    score: number;
    metadata?: Record<string, any>;
}): Promise<SubmitScoreResult> {
    const mutation = `
    mutation SubmitScore($input: ScoreInput!) {
      submitScore(input: $input) {
        id
        score
        createdAt
        gameType
        user { id username }
      }
    }
  `;
    return gqlFetch<SubmitScoreResult>({
        query: mutation,
        variables: {input: params},
    });
}

// Payments: create checkout session (Stripe, test mode initially)
export type CreateCheckoutInput = {
    plan: "WEEKLY" | "MONTHLY" | "YEARLY" | "LIFETIME";
    returnUrl: string;
    cancelUrl: string;
};

export type CreateCheckoutResult = {
    createCheckout: {
        id: string;
        url: string;
    };
};

export async function createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const mutation = `
      mutation CreateCheckout($input: CreateCheckoutInput!) {
        createCheckout(input: $input) { id url }
      }
    `;
    return gqlFetch<CreateCheckoutResult>({query: mutation, variables: {input}});
}
