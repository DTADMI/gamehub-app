// Minimal GraphQL client used by the app to talk to the backend GraphQL API
// It posts JSON to `${API_BASE}/graphql` where API_BASE is NEXT_PUBLIC_API_URL without the trailing /api.

export type GraphQLRequest<TVariables = Record<string, any>> = {
    query: string;
    variables?: TVariables;
};

export type GraphQLResponse<TData> = {
    data?: TData;
    errors?: { message: string }[];
};

function getGraphqlUrl(): string {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const apiBase = base.replace(/\/api$/, "");
    return `${apiBase}/graphql`;
}

export async function gqlFetch<TData, TVariables = Record<string, any>>(
    req: GraphQLRequest<TVariables>,
    init?: RequestInit,
): Promise<TData> {
    const res = await fetch(getGraphqlUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
        body: JSON.stringify(req),
        credentials: "include",
        ...init,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
    }

    const json = (await res.json()) as GraphQLResponse<TData>;
    if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join("; "));
    }
    if (!json.data) {
        throw new Error("GraphQL response missing data");
    }
    return json.data;
}
