import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, user } = useIsAdmin();
  const { signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <ShieldX className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Not Authorized</h1>
        <p className="text-muted-foreground max-w-sm">
          Your account does not have admin access. Contact the site owner if you believe this is an error.
        </p>
        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
      </div>
    );
  }

  return <>{children}</>;
}
