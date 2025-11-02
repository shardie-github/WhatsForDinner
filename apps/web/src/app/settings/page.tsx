'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account Section */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Account</h2>
          <div className="bg-white border rounded-lg divide-y">
            <Link
              href="/settings/account/profile"
              className="block px-4 py-3 hover:bg-gray-50"
            >
              <div className="font-medium">Profile</div>
              <div className="text-sm text-gray-500">Edit your profile information</div>
            </Link>
            <Link
              href="/settings/account/delete"
              className="block px-4 py-3 hover:bg-gray-50 text-red-600"
            >
              <div className="font-medium">Delete Account</div>
              <div className="text-sm">Permanently delete your account and data</div>
            </Link>
          </div>
        </section>

        {/* Privacy Section */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Privacy</h2>
          <div className="bg-white border rounded-lg divide-y">
            <Link
              href="/settings/legal"
              className="block px-4 py-3 hover:bg-gray-50"
            >
              <div className="font-medium">Legal</div>
              <div className="text-sm text-gray-500">Privacy Policy & Terms of Service</div>
            </Link>
            <div className="px-4 py-3">
              <div className="font-medium mb-2">Analytics</div>
              <div className="text-sm text-gray-500 mb-2">
                Help us improve by sharing usage data
              </div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">Enable analytics</span>
              </label>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Notifications</h2>
          <div className="bg-white border rounded-lg divide-y">
            <div className="px-4 py-3">
              <div className="font-medium mb-2">Push Notifications</div>
              <div className="text-sm text-gray-500 mb-2">
                Receive notifications about meal suggestions
              </div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">Enable push notifications</span>
              </label>
            </div>
          </div>
        </section>

        {/* App Section */}
        <section>
          <h2 className="text-xl font-semibold mb-3">App</h2>
          <div className="bg-white border rounded-lg divide-y">
            <div className="px-4 py-3">
              <div className="font-medium mb-2">Version</div>
              <div className="text-sm text-gray-500">
                {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
              </div>
            </div>
            <Link
              href="/support"
              className="block px-4 py-3 hover:bg-gray-50"
            >
              <div className="font-medium">Support</div>
              <div className="text-sm text-gray-500">Get help and contact us</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
