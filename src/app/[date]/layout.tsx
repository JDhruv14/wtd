// Sidebar lives in the root layout (src/app/layout.tsx) for true persistence across navigations.
export default function DateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
