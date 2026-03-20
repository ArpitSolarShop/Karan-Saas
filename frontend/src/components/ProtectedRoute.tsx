"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * ProtectedRoute — wrap any page that requires authentication.
 *
 * Usage:
 *   export default function DashboardPage() {
 *     return (
 *       <ProtectedRoute>
 *         <Dashboard />
 *       </ProtectedRoute>
 *     );
 *   }
 */
export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (roles && user && !roles.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, isLoading, user, roles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
