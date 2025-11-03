import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from 'react-query';
import { useT } from '@nomad/i18n';
import { queryKeys } from '@nomad/data';
import { createApiClient } from '@nomad/data';
import { AdSlot } from '@nomad/ui';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { useAuth } from '../hooks/useAuth';

const apiClient = createApiClient({
  baseURL: process.env.API_BASE_URL || 'https://api.example.com',
  getAccessToken: () => {
    // Get from secure storage
    return null;
  },
});

export default function Dashboard() {
  const { t } = useT();
  const flags = useFeatureFlags();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: mealPlan, isLoading } = useQuery(
    queryKeys.mealplan.day(new Date().toISOString().split('T')[0]),
    () => apiClient.get(queryKeys.mealplan.day(new Date().toISOString().split('T')[0]).join('/'))
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refetch queries
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.mealPlan')}</Text>
        {isLoading ? (
          <Text>{t('common.loading')}</Text>
        ) : (
          <Text>Meal plan data here</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.health')}</Text>
        <Text>Health metrics here</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.grocery')}</Text>
        <Text>Quick add grocery items</Text>
      </View>

      {user?.plan === 'free' && flags.ads && (
        <View style={styles.adSection}>
          <AdSlot
            slot="dash_bottom"
            flags={flags}
            consent={true}
            userPlan={user.plan}
            networkStatus="online"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  adSection: {
    padding: 16,
  },
});
