import { redirect } from 'next/navigation';

export default function PerformancePage() {
  redirect('/dashboard');
  return null;
}
