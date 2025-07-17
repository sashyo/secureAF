import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTideCloak } from '@tidecloak/react';
import { Shield } from 'lucide-react';

export default function RedirectPage() {
  const { authenticated, isInitializing, logout } = useTideCloak();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "failed") {
      sessionStorage.setItem("tokenExpired", "true");
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (!isInitializing) {
      navigate(authenticated ? '/' : '/');
    }
  }, [authenticated, isInitializing, navigate]);

  return (
    <div className="min-h-screen bg-gradient-vault flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-security rounded-full flex items-center justify-center animate-pulse-glow">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Processing Authentication</h2>
          <p className="text-muted-foreground">Please wait while we secure your session...</p>
        </div>
      </div>
    </div>
  );
}