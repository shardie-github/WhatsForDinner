import { redirect } from 'next/navigation';

export default function TermsOfServicePage() {
  // Redirect to static HTML page
  redirect('/legal/terms.html');
}
