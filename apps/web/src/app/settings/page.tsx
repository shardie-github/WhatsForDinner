'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Trash2,
  Shield,
  Bell,
  Settings as SettingsIcon,
  ExternalLink,
  BarChart3,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      
      // Load user preferences
      if (user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (preferences) {
          setAnalyticsEnabled(preferences.analytics_enabled ?? true);
          setNotificationsEnabled(preferences.notifications_enabled ?? true);
        }
      }
      
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleAnalyticsToggle = async (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          analytics_enabled: enabled,
          updated_at: new Date().toISOString(),
        });
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          notifications_enabled: enabled,
          updated_at: new Date().toISOString(),
        });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Account Section */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 divide-y">
          <Link
            href="/settings/account/profile"
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group"
          >
            <div>
              <div className="font-medium group-hover:text-primary transition-colors">Profile</div>
              <div className="text-sm text-muted-foreground">Edit your profile information</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/analytics"
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group"
          >
            <div>
              <div className="font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                Analytics Dashboard
                <Badge variant="secondary" className="text-xs">New</Badge>
              </div>
              <div className="text-sm text-muted-foreground">View your recipe analytics and insights</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/settings/account/delete"
            className="flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors group text-destructive"
          >
            <div>
              <div className="font-medium flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </div>
              <div className="text-sm">Permanently delete your account and data</div>
            </div>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>Control your privacy and data sharing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 divide-y">
          <Link
            href="/settings/legal"
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group"
          >
            <div>
              <div className="font-medium group-hover:text-primary transition-colors">Legal</div>
              <div className="text-sm text-muted-foreground">Privacy Policy & Terms of Service</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </div>
              <div className="text-sm text-muted-foreground">
                Help us improve by sharing usage data
              </div>
            </div>
            <Switch
              checked={analyticsEnabled}
              onCheckedChange={handleAnalyticsToggle}
              aria-label="Enable analytics"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive notifications about meal suggestions and updates
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationsToggle}
              aria-label="Enable push notifications"
            />
          </div>
        </CardContent>
      </Card>

      {/* App Section */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            App Information
          </CardTitle>
          <CardDescription>About this application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 divide-y">
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">Version</div>
              <div className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
              </div>
            </div>
            <Badge variant="outline">Latest</Badge>
          </div>
          <Link
            href="/support"
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group"
          >
            <div>
              <div className="font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Support
              </div>
              <div className="text-sm text-muted-foreground">Get help and contact us</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
