import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      let userId;
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        userId = payload.id;
      } catch {}
      loginUser(data.access_token, { ...data.user, id: userId });
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Leaf className="h-8 w-8 sm:h-9 sm:w-9 text-primary-foreground" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-foreground">BookLeaf</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your support portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full min-h-[44px] h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-default"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full min-h-[44px] h-10 px-3 pr-10 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-default"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full min-h-[44px] h-10">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">Test credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail("priya.sharma@email.com"); setPassword("password123"); }}
                className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-default text-center"
              >
                Author login
              </button>
              <button
                type="button"
                onClick={() => { setEmail("admin@bookleaf.com"); setPassword("admin123"); }}
                className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-default text-center"
              >
                Admin login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
