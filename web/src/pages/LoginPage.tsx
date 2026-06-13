import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/models";
import { Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginState } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      loginState(data.token, data.user);
      if (data.user.role === UserRole.DOCTOR) {
        navigate("/doctor");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">CuraPath</span>
        </div>

        <div className="p-8 space-y-6 bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to your recovery dashboard</p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email / Username</label>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com or 'doctor'"
                required
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 py-6 text-base"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-center text-xs text-slate-400">
              <Link to="/landing" className="hover:text-blue-600 transition-colors">
                ← Back to landing page
              </Link>
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Demo credentials:</p>
            <p>Doctor: email = <code className="font-mono">doctor</code>, password = <code className="font-mono">doctor123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
