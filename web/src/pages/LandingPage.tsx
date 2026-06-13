import { Link } from "react-router-dom";
import { Sparkles, Activity, ShieldCheck, HeartHandshake, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CuraPath</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
              AI Care
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Activity className="h-3.5 w-3.5" />
            Personal Post-Discharge Recovery Companion
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl mx-auto text-slate-900">
            Recover with confidence, <br />
            <span className="text-blue-600">guided by intelligence.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            CuraPath turns complex medical prescriptions, discharge notes, and clinical summaries into a clear, prioritized daily recovery schedule.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 py-6 rounded-2xl shadow-xl shadow-blue-600/20 text-base">
                Start Your Recovery Plan
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-6 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 text-base">
                Patient Portal
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-slate-50 border-y border-slate-100 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Designed for Safe, Simple Recovery</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Drug Interaction Guards</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Automatically cross-references your current medications and medical history to alert you of potential safety interactions.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Daily Recovery Checklist</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  View daily tasks classified by clinical urgency (Critical, Important, Optional), so you never miss what matters most.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">AI Recovery Coach Chat</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  24/7 interactive chat centered around your specific clinical profile. Ask about side effects, schedules, and care notes instantly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white py-8 px-6 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>HIPAA Compliant & Secure Encryption</span>
          </div>
          <p>© {new Date().getFullYear()} CuraPath Health. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
