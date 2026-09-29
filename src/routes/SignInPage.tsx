import { Navigate } from "react-router-dom";
import { AlertCircle, Lock } from "lucide-react";
import { PortalMonogram } from "@/components/PortalMonogram";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../auth";

// The official Google "G" mark, per Google's own Sign In branding
// guidelines — a fixed four-color exception like DonutChart's chart
// palette, not a value from the Ink token set (Google's brand colors
// aren't ours to substitute).
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export function SignInPage() {
  const { isSignedIn, isSigningIn, error, signIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/properties" replace />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <PortalMonogram size={64} className="rounded-lg" />
        <div className="flex flex-col gap-1">
          <h1 className="text-title font-semibold text-ink">
            Property Tracker
          </h1>
          <p className="text-caption text-muted-foreground">
            Real estate portfolio cash flow &amp; operational tracking
          </p>
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-section text-ink">Welcome back</h2>
            <p className="text-caption text-muted-foreground">
              Sign in to view buildings, income logs, and monthly statements.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={signIn}
            disabled={isSigningIn}
          >
            <GoogleIcon />
            {isSigningIn ? "Signing in…" : "Continue with Google"}
          </Button>

          <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <Lock className="size-3.5" strokeWidth={1.75} />
            Bank-grade encryption · Offline ready
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
