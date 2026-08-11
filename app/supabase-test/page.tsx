import { redirect } from 'next/navigation';

// Retired dev harness. Kept as a redirect so the route can't expose a test page.
export default function SupabaseTestPage() {
  redirect('/dashboard');
}
