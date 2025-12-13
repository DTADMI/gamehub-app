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
    gameType: GameType;
};

// GraphQL enum mirrors (keep in sync with backend schema)
export type GameType =
    | "SNAKE"
    | "BUBBLE_POP"
    | "TETRIS"
    | "BREAKOUT"
    | "KNITZY"
    | "MEMORY"
    | "CHECKERS"
    | "CHESS"
    | "PLATFORMER"
    | "TOWER_DEFENSE";

export type LeaderboardScope = "PERSONAL" | "FRIENDS" | "GLOBAL";
export type TimeWindow = "ALL_TIME" | "YEAR" | "MONTH" | "WEEK" | "DAY";

// Deprecated simple fetch kept for backward compatibility by adapting to paged form
export async function fetchLeaderboard(params: {
    gameType: GameType;
    limit?: number;
}): Promise<{ leaderboard: LeaderboardEntry[] }> {
    const data = await fetchLeaderboardPaged({
        gameType: params.gameType,
        first: params.limit ?? 25,
    });
    const entries = data.leaderboard.edges.map((e) => e.node);
    return {leaderboard: entries};
}

// New paginated leaderboard aligned with backend schema
export async function fetchLeaderboardPaged(params: {
    gameType: GameType;
    scope?: LeaderboardScope; // default GLOBAL on server
    window?: TimeWindow; // default WEEK on server
    first?: number; // default 25
    after?: string | null;
}): Promise<{
    leaderboard: {
        edges: { cursor: string; node: LeaderboardEntry }[];
        pageInfo: { hasNextPage: boolean; endCursor?: string | null };
    };
}> {
    const query = `
    query Leaderboard(
      $gameType: GameType!,
      $scope: LeaderboardScope,
      $window: TimeWindow,
      $first: Int,
      $after: String
    ) {
      leaderboard(
        gameType: $gameType,
        scope: $scope,
        window: $window,
        first: $first,
        after: $after
      ) {
        edges {
          cursor
          node {
            rank
            score
            gameType
            user { id username avatar }
          }
        }
        pageInfo { hasNextPage endCursor }
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
        gameType: GameType;
        user: LeaderboardUser;
    };
};

export async function submitScore(params: {
    gameType: GameType;
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
// Plan enum mirrors backend (Plan { FREE PRO })
export type Plan = "FREE" | "PRO";

export type CreateCheckoutInput = {
    plan: Plan;
    returnUrl: string;
    cancelUrl: string;
};

export type CreateCheckoutResult = {
    createCheckout: {
        id: string;
        url: string;
    };
};

export async function createCheckout(
    input: CreateCheckoutInput,
): Promise<CreateCheckoutResult> {
    const mutation = `
      mutation CreateCheckout($input: CreateCheckoutInput!) {
        createCheckout(input: $input) { id url }
      }
    `;
    return gqlFetch<CreateCheckoutResult>({
        query: mutation,
        variables: {input},
    });
}

// Viewer / subscription info (for premium gating)
export type PremiumFeatures = {
    advancedLeaderboards: boolean;
    cosmetics: boolean;
    earlyAccess: boolean;
};

export type Subscription = {
    id: string;
    userId: string;
    plan: Plan;
    status: string;
    currentPeriodEnd: string;
} | null;

export type Viewer = {
    id: string;
    username: string;
    avatar?: string | null;
    subscription: Subscription;
    premium: PremiumFeatures;
} | null;

export async function fetchViewer(): Promise<{ viewer: Viewer }> {
    const query = `
      query Viewer {
        viewer {
          id
          username
          avatar
          subscription { id userId plan status currentPeriodEnd }
          premium { advancedLeaderboards cosmetics earlyAccess }
        }
      }
    `;
    return gqlFetch({query});
}
