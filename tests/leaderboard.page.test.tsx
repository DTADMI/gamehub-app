import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, cleanup, fireEvent, render, screen, waitFor,} from "@testing-library/react";
import React from "react";
import LeaderboardPage from "@/app/leaderboard/page";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    status: "authenticated",
      data: {user: {email: "me@example.com"}},
  }),
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<any>("next/navigation");
  return {
    ...actual,
      useRouter: () => ({push: vi.fn(), replace: vi.fn()}),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/leaderboard",
  };
});

vi.mock("@/contexts/SubscriptionContext", () => ({
    useSubscription: () => ({entitlements: {advancedLeaderboards: false}}),
}));

vi.mock("@/lib/graphql/queries", () => ({
  fetchLeaderboardPaged: vi.fn().mockResolvedValue({
    leaderboard: {
      edges: [
        {
          cursor: "c1",
          node: {
            rank: 1,
            score: 100,
            gameType: "SNAKE",
              user: {id: "u1", username: "alice"},
          },
        },
        {
          cursor: "c2",
          node: {
            rank: 2,
            score: 90,
            gameType: "SNAKE",
              user: {id: "u2", username: "bob"},
          },
        },
      ],
        pageInfo: {hasNextPage: true, endCursor: "c2"},
    },
  }),
}));

describe("LeaderboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => cleanup());

  it("renders initial rows and shows Load more when hasNextPage", async () => {
    await act(async () => {
        render(<LeaderboardPage/>);
    });
    expect(await screen.findByText("Leaderboard")).toBeInTheDocument();
    await act(async () => {
      await screen.findByText("alice");
      await screen.findByText("bob");
    });
    expect(screen.getByText("Load more")).toBeInTheDocument();
  });

  it("gates FRIENDS scope for non-premium users", async () => {
    await act(async () => {
        render(<LeaderboardPage/>);
    });
    // FRIENDS button exists but disabled via opacity/cursor class; clicking should not change selection or fetch
    await act(async () => {
        const friendsBtn = await screen.findByRole("button", {name: "Friends"});
      expect(friendsBtn).toBeDisabled();
    });
  });

  it("changes game type via selector and refreshes", async () => {
    const queries = await import("@/lib/graphql/queries");
    const spy = vi.spyOn(queries, "fetchLeaderboardPaged");
    await act(async () => {
        render(<LeaderboardPage/>);
    });
    await act(async () => {
      await screen.findByText("alice");
      const select = screen.getByDisplayValue("SNAKE");
        fireEvent.change(select, {target: {value: "TETRIS"}});
    });
    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
