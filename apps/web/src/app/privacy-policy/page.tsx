import { redirect } from 'next/navigation';

export default function PrivacyPolicyPage() {
  // Redirect to static HTML page
  redirect('/legal/privacy.html');
}
