import { Link } from "react-router-dom";
import { HeartPulse, Play, ShieldCheck, FileText, Calendar, Phone, QrCode, Upload, ArrowRight, CheckCircle2, Bell } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-[#2563EB]" strokeWidth={2.5} />
            <span className="font-bold text-2xl tracking-tight text-slate-900">CuraPath</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-[#2563EB] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#2563EB] transition-colors">How It Works</a>
            <a href="#patients" className="hover:text-[#2563EB] transition-colors">For Patients</a>
            <a href="#doctors" className="hover:text-[#2563EB] transition-colors">For Doctors</a>
            <a href="#security" className="hover:text-[#2563EB] transition-colors">Security</a>
          </div>
          <Link to="/login" className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm">
            Request Demo
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-6xl font-black text-[#0F172A] leading-[1.1] mb-6">
              Recovery doesn't end when you leave the hospital.
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
              CuraPath converts discharge papers into a personalized recovery plan, tracks medication adherence, performs automated wellness check-ins, and securely shares patient history with the next doctor through a simple QR handoff.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 text-lg">
                <Play className="w-5 h-5 fill-current" /> Watch Demo
              </button>
              <Link to="/login" className="bg-white border-2 border-blue-100 hover:border-blue-200 text-[#2563EB] font-bold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg">
                Try Prototype <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <ShieldCheck className="w-6 h-6 text-green-500" />
              Built for patients, caregivers, and healthcare providers.
            </div>
          </div>
          
          {/* HERO MOCKUP GRAPHIC */}
          <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
            
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg p-6 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Welcome back, Rajesh 👋</h3>
                  <p className="text-xs text-slate-500">Here's your recovery overview</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">R</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Recovery Progress</h4>
                  <div className="text-3xl font-black text-green-500">72%</div>
                  <p className="text-xs text-slate-500">On Track</p>
                </div>
                <div className="space-y-3 w-32">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-600"><span>Meds</span><span>8/10</span></div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full"><div className="h-full bg-green-500 rounded-full w-[80%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-600"><span>Appts</span><span>3/5</span></div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full"><div className="h-full bg-green-500 rounded-full w-[60%]"></div></div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
                <div className="bg-blue-500 text-white p-2 rounded-full mt-1"><Phone className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Check-in Status</h4>
                  <p className="text-xs text-slate-600 mt-1">Great! No concerns reported.</p>
                </div>
              </div>
            </div>
            
            {/* Floating Element */}
            <div className="absolute -bottom-10 -left-10 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 w-64 -rotate-3 animate-bounce" style={{animationDuration: '5s'}}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-bold text-sm text-slate-900">Next Medication</span>
              </div>
              <p className="font-bold text-lg text-slate-900 mb-1">Paracetamol 650mg</p>
              <p className="text-xs text-slate-500">1 Tablet &bull; After Lunch</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="rounded-3xl overflow-hidden shadow-lg h-[500px]">
              <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" alt="Patient checking papers" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[#2563EB] font-bold tracking-widest text-sm uppercase mb-4">The Problem</p>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Most patients are left on their own after discharge.
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Complex paper-based instructions, forgotten follow-ups, and scattered medical records lead to confusion, anxiety, and even unnecessary hospital visits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6"><FileText className="w-6 h-6" /></div>
              <h3 className="text-4xl font-black text-slate-900 mb-4">33%</h3>
              <p className="text-slate-600 font-medium mb-8">Patients end up seeking emergency care due to lack of clarity after discharge.</p>
              <p className="text-xs text-slate-400 font-bold uppercase">Source: IPSOS Healthcare Survey</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6"><Calendar className="w-6 h-6" /></div>
              <h3 className="text-4xl font-black text-slate-900 mb-4">7/10</h3>
              <p className="text-slate-600 font-medium mb-8">Patients forget or miss their medications within the first week of going home.</p>
              <p className="text-xs text-slate-400 font-bold uppercase">Source: WHO India Report</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6"><QrCode className="w-6 h-6" /></div>
              <h3 className="text-4xl font-black text-slate-900 mb-4">50%</h3>
              <p className="text-slate-600 font-medium mb-8">Patients carry paper reports between doctors leading to errors or repeated tests.</p>
              <p className="text-xs text-slate-400 font-bold uppercase">Source: NITI Aayog Report</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[#2563EB] font-bold tracking-widest text-sm uppercase mb-4">What CuraPath Does</p>
          <h2 className="text-4xl font-black text-slate-900 mb-16">Everything you need for a smooth recovery</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-blue-500 transition-colors cursor-default">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6"><FileText className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Paper to Plan</h3>
              <p className="text-slate-600 font-medium">OCR scans your discharge papers and builds a digital recovery plan in seconds.</p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-green-500 transition-colors cursor-default">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6"><Calendar className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Stay on Track</h3>
              <p className="text-slate-600 font-medium">Never miss a medication or appointment with smart reminders and tracking.</p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-purple-500 transition-colors cursor-default">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6"><Phone className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Voice Check-ins</h3>
              <p className="text-slate-600 font-medium">Automated calls check on your recovery and alert your care team if needed.</p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-orange-500 transition-colors cursor-default">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6"><QrCode className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Share & Handoff</h3>
              <p className="text-slate-600 font-medium">Share your complete medical summary with the next doctor using a simple QR code.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-slate-50 border-t border-slate-100 text-center" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#2563EB] font-bold tracking-widest text-sm uppercase mb-4">How It Works</p>
          <h2 className="text-4xl font-black text-slate-900 mb-16">From discharge papers to better recovery in 4 simple steps</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
            <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-slate-200 -z-10"></div>
            
            <div className="flex flex-col items-center bg-slate-50">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center mb-6 shadow-sm"><Upload className="w-10 h-10 text-blue-600" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. Upload</h3>
              <p className="text-slate-600 max-w-[200px] text-sm">Upload your discharge papers or prescriptions.</p>
            </div>
            <div className="flex flex-col items-center bg-slate-50">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center mb-6 shadow-sm"><FileText className="w-10 h-10 text-green-600" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. We Process</h3>
              <p className="text-slate-600 max-w-[200px] text-sm">Our AI extracts important details and creates your recovery plan.</p>
            </div>
            <div className="flex flex-col items-center bg-slate-50">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center mb-6 shadow-sm"><Bell className="w-10 h-10 text-purple-600" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">3. Stay on Track</h3>
              <p className="text-slate-600 max-w-[200px] text-sm">Follow your plan, get reminders, and complete check-ins.</p>
            </div>
            <div className="flex flex-col items-center bg-slate-50">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center mb-6 shadow-sm"><QrCode className="w-10 h-10 text-blue-600" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">4. Share</h3>
              <p className="text-slate-600 max-w-[200px] text-sm">Share your health summary with any doctor in just 30 seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BANNER */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-6 p-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 lg:w-1/3">
            <ShieldCheck className="w-12 h-12 text-[#2563EB] shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Your data is safe with us</h4>
              <p className="text-xs text-slate-600 font-medium">We follow bank-level encryption and strict privacy standards. Your health data is always in your control.</p>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <h4 className="font-bold text-slate-500 mb-6 text-center lg:text-left">Trusted by hospitals and healthcare professionals</h4>
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Dummy logos for AIIMS, Apollo, Fortis, Manipal */}
              <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><HeartPulse className="w-8 h-8"/> AIIMS</div>
              <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><ShieldCheck className="w-8 h-8"/> Apollo</div>
              <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><FileText className="w-8 h-8"/> Fortis</div>
              <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><Phone className="w-8 h-8"/> Manipal</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-center font-medium text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-white mb-4 md:mb-0">
            <HeartPulse className="h-6 w-6 text-[#2563EB]" />
            <span className="font-bold text-xl tracking-tight">CuraPath</span>
          </div>
          <p>&copy; 2026 CuraPath HealthTech. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
