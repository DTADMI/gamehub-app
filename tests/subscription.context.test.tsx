import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {SubscriptionProvider, useSubscription} from '@/contexts/SubscriptionContext';

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({user: {uid: 'u1', email: 'me@example.com'}})
}));

const fetchViewerMock = vi.fn();
vi.mock('@/lib/graphql/queries', () => ({
    fetchViewer: () => fetchViewerMock(),
}));

function Probe() {
    const {loading, subscription, entitlements} = useSubscription();
    return (
        <div>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="plan">{subscription?.plan || 'NONE'}</div>
            <div data-testid="adv">{String(entitlements.advancedLeaderboards)}</div>
        </div>
    );
}

describe('SubscriptionContext', () => {
    beforeEach(() => {
        fetchViewerMock.mockReset();
    });
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('derives entitlements from viewer.premium', async () => {
        fetchViewerMock.mockResolvedValue({
            viewer: {
                subscription: {id: 's1', userId: 'u1', plan: 'PRO', status: 'active', currentPeriodEnd: '2099-01-01'},
                premium: {advancedLeaderboards: true, cosmetics: true, earlyAccess: true},
            }
        });

        render(
            <SubscriptionProvider>
                <Probe/>
            </SubscriptionProvider>
        );

        await waitFor(() => expect(screen.getByTestId('plan').textContent).toBe('PRO'));
        expect(screen.getByTestId('adv').textContent).toBe('true');
    });

    it('resets to defaults when viewer has no subscription', async () => {
        fetchViewerMock.mockResolvedValue({
            viewer: {
                subscription: null,
                premium: {advancedLeaderboards: false, cosmetics: false, earlyAccess: false}
            }
        });

        render(
            <SubscriptionProvider>
                <Probe/>
            </SubscriptionProvider>
        );

        await waitFor(() => expect(screen.getByTestId('plan').textContent).toBe('NONE'));
        expect(screen.getByTestId('adv').textContent).toBe('false');
    });
});
