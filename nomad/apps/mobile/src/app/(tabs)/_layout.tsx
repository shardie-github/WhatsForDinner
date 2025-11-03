import { Tabs } from 'expo-router';
import { useT } from '@nomad/i18n';

export default function TabLayout() {
  const { t } = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#10b981',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard.title'),
          tabBarLabel: t('dashboard.title'),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: t('planner.title'),
          tabBarLabel: t('planner.title'),
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: t('grocery.title'),
          tabBarLabel: t('grocery.title'),
        }}
      />
      <Tabs.Screen
        name="inspire"
        options={{
          title: t('dashboard.inspire'),
          tabBarLabel: t('dashboard.inspire'),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: t('family.title'),
          tabBarLabel: t('family.title'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarLabel: t('settings.title'),
        }}
      />
    </Tabs>
  );
}
