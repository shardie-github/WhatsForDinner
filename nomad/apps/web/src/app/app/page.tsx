import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { DashboardContent } from './dashboard-content';
import { getSession } from '../lib/auth';

export default async function AppPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
