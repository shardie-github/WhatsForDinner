'use client';

import { useQuery } from 'react-query';
import { queryKeys, createApiClient } from '@nomad/data';
import { AdSlot } from '@nomad/ui';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { useAuth } from '../hooks/useAuth';

const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com',
  getAccessToken: () => {
    // Get from httpOnly cookie
    return null;
  },
});

export function DashboardContent() {
  const flags = useFeatureFlags();
  const { user } = useAuth();

  const { data: mealPlan, isLoading } = useQuery(
    queryKeys.mealplan.day(new Date().toISOString().split('T')[0]),
    () => apiClient.get(queryKeys.mealplan.day(new Date().toISOString().split('T')[0]).join('/'))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Meal Plan</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p>Meal plan data here</p>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Health</h2>
          <p>Health metrics here</p>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Grocery</h2>
          <p>Quick add grocery items</p>
        </section>
      </div>

      {user?.plan === 'free' && flags.ads && (
        <div className="mt-8">
          <AdSlot
            slot="dash_bottom"
            flags={flags}
            consent={true}
            userPlan={user.plan}
            networkStatus="online"
          />
        </div>
      )}
    </div>
  );
}
