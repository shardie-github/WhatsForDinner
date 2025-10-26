'use client';

import { useTenant } from '@/hooks/useTenant';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Save,
  AlertTriangle,
  Shield,
  Bell,
  Database,
} from 'lucide-react';
import { useState } from 'react';

interface TenantSettings {
  name: string;
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      weekly_digest: boolean;
    };
    features: {
      ai_optimization: boolean;
      analytics_tracking: boolean;
      data_retention_days: number;
    };
    limits: {
      max_members: number;
      max_pantry_items: number;
      max_recipes: number;
    };
  };
}

export default function AdminSettingsPage() {
  const { tenant, refetch } = useTenant();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<TenantSettings>({
    name: tenant?.name || '',
    settings: {
      notifications: {
        email: true,
        push: true,
        weekly_digest: true,
      },
      features: {
        ai_optimization: true,
        analytics_tracking: true,
        data_retention_days: 365,
      },
      limits: {
        max_members: tenant?.plan === 'family' ? 5 : 1,
        max_pantry_items: 100,
        max_recipes: 1000,
      },
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (updates: Partial<TenantSettings>) => {
      if (!tenant) throw new Error('No tenant found');

      const { error } = await supabase
        .from('tenants')
        .update({
          name: updates.name,
          settings: updates.settings,
        })
        .eq('id', tenant.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      refetch();
    },
  });

  const handleSave = () => {
    updateTenantMutation.mutate(settings);
  };

  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings as any;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (!tenant) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Loading tenant settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Configure your tenant's settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Basic tenant configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tenant-name">Tenant Name</Label>
            <Input
              id="tenant-name"
              value={settings.name}
              onChange={e => handleSettingChange('name', e.target.value)}
              placeholder="Enter tenant name"
            />
          </div>

          <div>
            <Label htmlFor="tenant-plan">Current Plan</Label>
            <Input
              id="tenant-plan"
              value={tenant.plan.toUpperCase()}
              disabled
              className="bg-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.settings.notifications.email}
              onCheckedChange={checked =>
                handleSettingChange('settings.notifications.email', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive push notifications in the app
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.settings.notifications.push}
              onCheckedChange={checked =>
                handleSettingChange('settings.notifications.push', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-digest">Weekly Digest</Label>
              <p className="text-sm text-gray-500">
                Receive a weekly summary of activity
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={settings.settings.notifications.weekly_digest}
              onCheckedChange={checked =>
                handleSettingChange(
                  'settings.notifications.weekly_digest',
                  checked
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Feature Settings
          </CardTitle>
          <CardDescription>
            Control which features are enabled for your tenant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ai-optimization">AI Optimization</Label>
              <p className="text-sm text-gray-500">
                Enable AI cost optimization and caching
              </p>
            </div>
            <Switch
              id="ai-optimization"
              checked={settings.settings.features.ai_optimization}
              onCheckedChange={checked =>
                handleSettingChange(
                  'settings.features.ai_optimization',
                  checked
                )
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics-tracking">Analytics Tracking</Label>
              <p className="text-sm text-gray-500">
                Track usage analytics and performance metrics
              </p>
            </div>
            <Switch
              id="analytics-tracking"
              checked={settings.settings.features.analytics_tracking}
              onCheckedChange={checked =>
                handleSettingChange(
                  'settings.features.analytics_tracking',
                  checked
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="data-retention">Data Retention (Days)</Label>
            <Input
              id="data-retention"
              type="number"
              value={settings.settings.features.data_retention_days}
              onChange={e =>
                handleSettingChange(
                  'settings.features.data_retention_days',
                  parseInt(e.target.value)
                )
              }
              min="30"
              max="3650"
            />
            <p className="mt-1 text-sm text-gray-500">
              How long to keep analytics and usage data (30-3650 days)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Limits Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Usage Limits
          </CardTitle>
          <CardDescription>Set limits for your tenant's usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="max-members">Maximum Members</Label>
            <Input
              id="max-members"
              type="number"
              value={settings.settings.limits.max_members}
              onChange={e =>
                handleSettingChange(
                  'settings.limits.max_members',
                  parseInt(e.target.value)
                )
              }
              min="1"
              max={tenant.plan === 'family' ? 5 : 1}
              disabled={tenant.plan !== 'family'}
            />
            <p className="mt-1 text-sm text-gray-500">
              {tenant.plan === 'family'
                ? 'Maximum number of team members (1-5)'
                : 'Upgrade to Family plan to add more members'}
            </p>
          </div>

          <div>
            <Label htmlFor="max-pantry-items">Maximum Pantry Items</Label>
            <Input
              id="max-pantry-items"
              type="number"
              value={settings.settings.limits.max_pantry_items}
              onChange={e =>
                handleSettingChange(
                  'settings.limits.max_pantry_items',
                  parseInt(e.target.value)
                )
              }
              min="10"
              max="10000"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of items in pantry lists
            </p>
          </div>

          <div>
            <Label htmlFor="max-recipes">Maximum Saved Recipes</Label>
            <Input
              id="max-recipes"
              type="number"
              value={settings.settings.limits.max_recipes}
              onChange={e =>
                handleSettingChange(
                  'settings.limits.max_recipes',
                  parseInt(e.target.value)
                )
              }
              min="50"
              max="100000"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of saved recipes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4">
              <h4 className="font-medium text-red-800">Delete Tenant</h4>
              <p className="mt-1 text-sm text-red-600">
                Permanently delete this tenant and all associated data. This
                action cannot be undone.
              </p>
              <Button variant="destructive" className="mt-3" disabled>
                Delete Tenant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateTenantMutation.isPending}
          className="flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          {updateTenantMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
