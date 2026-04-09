// Ovaj layout wrapa samo /api stranicu (ne API route.ts fajlove)
export default function ApiPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}