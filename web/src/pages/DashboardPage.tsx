import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDB } from "@/lib/db";
import { 
  LayoutGrid, ClipboardCheck, Pill, Calendar, CheckCircle2, 
  FileText, QrCode, Bell, Settings, LogOut, ChevronDown, 
  AlertTriangle, Phone, ScanLine, Check, HeartPulse, MoreVertical,
  Search, Download, Share2, Plus, Clock, Activity, ArrowRight, User, X
} from "lucide-react";

// --- REUSABLE COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-3.5 text-sm font-medium transition-colors ${
      active 
        ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600" 
        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50 border-r-4 border-transparent"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      {label}
    </div>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
    )}
  </button>
);

const DonutChart = ({ percentage }: { percentage: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r={radius} stroke="#F1F5F9" strokeWidth="8" fill="none" />
        <circle cx="50%" cy="50%" r={radius} stroke="#22C55E" strokeWidth="8" fill="none" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-800">{percentage}%</span>
        <span className="text-xs text-slate-500 font-medium">Completed</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, current, total, icon: Icon }: any) => {
  const pct = (current / total) * 100;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-600 flex items-center gap-2 font-medium">
           <Icon className="w-4 h-4 text-slate-400" />
           {label}
        </span>
        <span className="text-slate-400 font-medium"><strong className="text-slate-700">{current}</strong> / {total}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-[#22C55E]" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { db, updatePatient } = useDB();
  const activePatient = db.patients[0] || { 
    id: "RK-8829", name: "Rajesh Kumar", recoveryDay: 4, 
    medicationTaken: false, voiceCallDone: false 
  };

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [notifications, setNotifications] = useState(2);
  
  // Local state for tabs
  const [showModal, setShowModal] = useState<string | null>(null);
  const [settingsToggles, setSettingsToggles] = useState({ push: true, email: false, sms: true });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const markMedicationTaken = () => updatePatient(activePatient.id, { medicationTaken: true });
  const startCheckIn = () => updatePatient(activePatient.id, { voiceCallDone: true });

  // --- TAB COMPONENTS ---

  const DashboardHome = () => (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* TOP ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* RECOVERY PROGRESS */}
        <div className="xl:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recovery Progress</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">You're on track. Keep following your plan 💪</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0 pl-2">
              <DonutChart percentage={65} />
            </div>
            <div className="flex-1 w-full space-y-1">
              <ProgressBar label="Medications" current={activePatient.medicationTaken ? 9 : 8} total={12} icon={CheckCircle2} />
              <ProgressBar label="Appointments" current={2} total={3} icon={Calendar} />
              <ProgressBar label="Check-ins" current={activePatient.voiceCallDone ? 6 : 5} total={7} icon={CheckCircle2} />
              <ProgressBar label="Daily Goals" current={3} total={4} icon={CheckCircle2} />
            </div>
          </div>
        </div>

        {/* NEXT MEDICATION */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-[#E0F2FE] rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-[#38BDF8] rounded-sm transform rotate-45"></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Next Medication</h3>
                <p className="text-xs text-slate-500 font-medium">Upcoming at 2:00 PM</p>
              </div>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">Paracetamol 650mg</h4>
            <p className="text-sm text-slate-500 font-medium mb-6">1 Tablet &bull; After Lunch</p>
          </div>
          <button 
            onClick={markMedicationTaken}
            disabled={activePatient.medicationTaken}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
              activePatient.medicationTaken 
                ? 'bg-green-100 text-green-700' 
                : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
            }`}
          >
            {activePatient.medicationTaken ? '✓ Taken' : 'Mark as Taken'}
          </button>
        </div>

        {/* NEXT APPOINTMENT */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-[#EFF6FF] rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Next Appointment</h3>
                <p className="text-xs text-slate-500 font-medium">Tomorrow, 11:30 AM</p>
              </div>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">Orthopaedic Follow-up</h4>
            <p className="text-sm text-slate-500 font-medium mb-6">AIIMS Hospital, New Delhi</p>
          </div>
          <button onClick={() => setActiveTab("Appointments")} className="w-full py-3 rounded-xl font-bold text-sm text-[#2563EB] border border-[#2563EB] hover:bg-blue-50 transition-colors">
            View Details
          </button>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* TODAY'S RECOVERY PLAN */}
        <div className="xl:col-span-6 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-8">Today's Recovery Plan</h2>
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-[68px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-slate-200">
            <div className="relative flex items-center gap-6">
              <div className="w-20 text-right text-sm font-medium text-slate-600 shrink-0">08:00 AM</div>
              <div className="absolute left-[68px] md:left-auto md:relative h-7 w-7 rounded-full bg-[#22C55E] flex items-center justify-center ring-4 ring-white z-10">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <div className="flex-1 flex justify-between items-center bg-white">
                <div>
                  <p className="font-bold text-slate-900">Take Paracetamol 650mg</p>
                  <p className="text-sm text-slate-500 mt-1">Completed</p>
                </div>
              </div>
            </div>
            <div className="relative flex items-center gap-6">
              <div className="w-20 text-right text-sm font-medium text-[#2563EB] shrink-0">02:00 PM</div>
              <div className="absolute left-[68px] md:left-auto md:relative h-7 w-7 rounded-full bg-white border-[6px] border-[#2563EB] ring-4 ring-white z-10"></div>
              <div className="flex-1 flex justify-between items-center bg-white">
                <div>
                  <p className="font-bold text-slate-900">Take Paracetamol 650mg</p>
                  <p className="text-sm text-slate-500 mt-1">After Lunch</p>
                </div>
                <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-bold rounded-md">Upcoming</span>
              </div>
            </div>
            <div className="relative flex items-center gap-6">
              <div className="w-20 text-right text-sm font-medium text-slate-600 shrink-0">06:00 PM</div>
              <div className="absolute left-[68px] md:left-auto md:relative h-7 w-7 rounded-full bg-white border-[3px] border-slate-300 ring-4 ring-white z-10"></div>
              <div className="flex-1 flex justify-between items-center bg-white opacity-60">
                <div>
                  <p className="font-bold text-slate-900">Physiotherapy Exercise</p>
                  <p className="text-sm text-slate-500 mt-1">20 mins</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md border border-slate-200">Pending</span>
              </div>
            </div>
            <div className="relative flex items-center gap-6">
              <div className="w-20 text-right text-sm font-medium text-slate-600 shrink-0">09:00 PM</div>
              <div className="absolute left-[68px] md:left-auto md:relative h-7 w-7 rounded-full bg-white border-[3px] border-slate-300 ring-4 ring-white z-10"></div>
              <div className="flex-1 flex justify-between items-center bg-white opacity-60">
                <div>
                  <p className="font-bold text-slate-900">Take Pantoprazole 40mg</p>
                  <p className="text-sm text-slate-500 mt-1">Before Dinner</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md border border-slate-200">Pending</span>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button onClick={() => setActiveTab("Recovery Plan")} className="text-sm font-bold text-[#2563EB] hover:text-blue-800 border border-slate-200 px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              View Full Plan
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN STACK */}
        <div className="xl:col-span-6 space-y-6">
          {/* RECOVERY CHECK-IN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Recovery Check-in</h2>
              <span className="text-xs font-medium text-slate-500">Last check-in: {activePatient.voiceCallDone ? 'Just Now' : 'Today, 09:00 AM'}</span>
            </div>
            {activePatient.voiceCallDone ? (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-[#10B981] rounded-full p-1 mt-0.5"><Check className="w-4 h-4 text-white" /></div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">Great! No concerns reported.</p>
                    <p className="text-sm text-slate-700 mt-1 font-medium">We'll check in with you again tomorrow.</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab("Check-ins")} className="mt-6 px-4 py-2 border border-[#10B981] text-[#059669] rounded-lg text-sm font-bold hover:bg-[#D1FAE5] transition-colors flex items-center gap-2 bg-white">
                  <Phone className="w-4 h-4" /> View Transcript
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 rounded-full p-1 mt-0.5"><Phone className="w-4 h-4 text-white" /></div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">Time for your daily check-in!</p>
                    <p className="text-sm text-slate-700 mt-1 font-medium">Let us know how you are feeling today.</p>
                  </div>
                </div>
                <button onClick={startCheckIn} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Phone className="w-4 h-4" /> Start Check-in
                </button>
              </div>
            )}
          </div>

          {/* QUICK SHARE QR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex justify-between items-center gap-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Quick Share (QR)</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Share your health summary with your next doctor in 30 seconds.</p>
              <button onClick={() => setActiveTab("Share (QR)")} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                <QrCode className="w-4 h-4" /> Generate QR Code
              </button>
            </div>
            <div className="shrink-0 bg-white p-2 border border-slate-200 rounded-xl">
              <div className="w-24 h-24 flex flex-wrap gap-[1px]">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={`w-[11px] h-[11px] ${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-transparent'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IMPORTANT NOTE */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-6 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-[#D97706] shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Important Note</h3>
            <p className="text-sm text-slate-700 font-medium">If you experience severe pain, breathlessness, bleeding, or any other emergency, please contact your doctor or visit the nearest hospital.</p>
          </div>
        </div>
        <button className="shrink-0 flex items-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 bg-white rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors whitespace-nowrap">
          <Phone className="w-4 h-4" /> Emergency Contacts
        </button>
      </div>
    </div>
  );

  const RecoveryPlanView = () => (
    <div className="max-w-[1000px] mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Comprehensive Recovery Plan</h2>
          <p className="text-slate-500 mt-1">Timeline generated from your discharge summary.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>
      <div className="space-y-6">
        {['Week 1 (Current)', 'Week 2', 'Week 3-4'].map((week, idx) => (
          <div key={week} className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" /> {week}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className={`w-5 h-5 mt-0.5 ${idx === 0 ? 'text-green-500' : 'text-slate-300'}`} />
                <div>
                  <p className="font-bold text-slate-800">Strict Bed Rest & Hydration</p>
                  <p className="text-sm text-slate-500">Minimum 3 liters of water daily.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className={`w-5 h-5 mt-0.5 ${idx === 0 ? 'text-green-500' : 'text-slate-300'}`} />
                <div>
                  <p className="font-bold text-slate-800">Light Physiotherapy</p>
                  <p className="text-sm text-slate-500">20 mins of guided movement daily.</p>
                </div>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const MedicationsView = () => (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Active Medications</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm">
          <Plus className="w-4 h-4" /> Add Manual Entry
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activePatient.medications || []).map(med => (
          <div key={med.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{med.type}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{med.name}</h3>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" /> {med.time} ({med.dosage})
            </p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-orange-500">{med.stock}</span>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800">Request Refill</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AppointmentsView = () => (
    <div className="max-w-[1000px] mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Appointments</h2>
      <div className="space-y-4">
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white text-blue-600 rounded-xl flex flex-col items-center justify-center border border-blue-100 shadow-sm shrink-0">
              <span className="text-xs font-bold uppercase">Jun</span>
              <span className="text-xl font-black">18</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Orthopaedic Follow-up</h3>
              <p className="text-slate-600 text-sm">Dr. Evans • AIIMS Hospital, New Delhi</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2 border border-blue-200 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100">Reschedule</button>
            <button className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Join Video Call</button>
          </div>
        </div>

        <div className="border border-slate-200 bg-white rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-slate-50 text-slate-600 rounded-xl flex flex-col items-center justify-center border border-slate-200 shrink-0">
              <span className="text-xs font-bold uppercase">Jul</span>
              <span className="text-xl font-black">02</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Physiotherapy Assessment</h3>
              <p className="text-slate-600 text-sm">Dr. Sharma • Apollo Clinic</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );

  const CheckInsView = () => (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Check-in History</h2>
        <button onClick={startCheckIn} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm">
          <Phone className="w-4 h-4" /> Start Manual Check-in
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {[
          { date: "Today, 09:00 AM", status: "Good", notes: "No concerns reported. Pain level 2/10." },
          { date: "Yesterday, 09:15 AM", status: "Mild Pain", notes: "Reported slight discomfort around incision. Logged for review." },
          { date: "June 12, 08:30 AM", status: "Good", notes: "Medications taken on time. Feeling energetic." }
        ].map((log, idx) => (
          <div key={idx} className="border-b border-slate-100 last:border-0 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${log.status === 'Good' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{log.date}</p>
                <p className="text-sm text-slate-500 mt-1 max-w-md truncate">{log.notes}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.status === 'Good' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{log.status}</span>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const HealthRecordsView = () => (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Health Records & Files</h2>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 shadow-sm">
          <Plus className="w-4 h-4" /> Upload Record
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: "Discharge Summary", date: "June 10, 2026", type: "PDF", size: "2.4 MB" },
          { name: "Blood Test Results", date: "June 9, 2026", type: "IMAGE", size: "1.1 MB" },
          { name: "MRI Scan Report", date: "June 5, 2026", type: "PDF", size: "8.5 MB" }
        ].map(file => (
          <div key={file.name} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <button className="text-slate-400 hover:text-blue-600"><MoreVertical className="w-5 h-5" /></button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{file.name}</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">{file.date} &bull; {file.size}</p>
            <button className="w-full py-2 bg-slate-50 text-slate-700 font-bold rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
              View Document
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const ShareQRView = () => (
    <div className="max-w-[800px] mx-auto bg-white rounded-2xl border border-slate-200 p-10 shadow-sm text-center">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <QrCode className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Clinical Passport</h2>
      <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto">Allow your next specialist to instantly import your validated medical history and active recovery plan by scanning this code.</p>
      
      <div className="bg-white p-6 border-4 border-[#0F172A] rounded-3xl inline-block mb-10 shadow-xl">
        <div className="w-64 h-64 flex flex-wrap gap-[2px]">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className={`w-[19px] h-[19px] ${Math.random() > 0.4 ? 'bg-[#0F172A]' : 'bg-transparent'}`}></div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" /> Share Link instead
        </button>
        <button className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
          <Download className="w-5 h-5" /> Save Image
        </button>
      </div>
    </div>
  );

  const AlertsView = () => (
    <div className="max-w-[800px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        <button onClick={() => setNotifications(0)} className="text-sm font-bold text-blue-600 hover:text-blue-800">Mark all as read</button>
      </div>
      <div className="divide-y divide-slate-100">
        {[
          { title: "Medication Reminder", time: "10 mins ago", desc: "It's time to take your Paracetamol 650mg.", unread: notifications > 0 },
          { title: "Check-in Complete", time: "2 hours ago", desc: "Your daily voice check-in was logged successfully.", unread: notifications > 1 },
          { title: "New Document Uploaded", time: "1 day ago", desc: "Your Lab Results were successfully parsed by the AI Agent.", unread: false }
        ].map((alert, idx) => (
          <div key={idx} className={`p-6 flex gap-4 ${alert.unread ? 'bg-blue-50/50' : 'bg-white'}`}>
            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.unread ? 'bg-blue-600' : 'bg-transparent'}`}></div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-slate-900">{alert.title}</h3>
                <span className="text-xs text-slate-500 font-medium">{alert.time}</span>
              </div>
              <p className="text-sm text-slate-600">{alert.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-2">
        {['Profile Details', 'Notifications', 'Privacy & Security', 'Language'].map(item => (
          <button key={item} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm ${item === 'Notifications' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Notification Preferences</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Push Notifications</h3>
              <p className="text-sm text-slate-500">Receive alerts on your mobile device.</p>
            </div>
            <button onClick={() => setSettingsToggles({...settingsToggles, push: !settingsToggles.push})} className={`w-12 h-6 rounded-full transition-colors relative ${settingsToggles.push ? 'bg-green-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settingsToggles.push ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Email Updates</h3>
              <p className="text-sm text-slate-500">Daily summary of your recovery progress.</p>
            </div>
            <button onClick={() => setSettingsToggles({...settingsToggles, email: !settingsToggles.email})} className={`w-12 h-6 rounded-full transition-colors relative ${settingsToggles.email ? 'bg-green-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settingsToggles.email ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">SMS Reminders</h3>
              <p className="text-sm text-slate-500">Text message alerts for medications.</p>
            </div>
            <button onClick={() => setSettingsToggles({...settingsToggles, sms: !settingsToggles.sms})} className={`w-12 h-6 rounded-full transition-colors relative ${settingsToggles.sms ? 'bg-green-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settingsToggles.sms ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100">
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case "Dashboard": return <DashboardHome />;
      case "Recovery Plan": return <RecoveryPlanView />;
      case "Medications": return <MedicationsView />;
      case "Appointments": return <AppointmentsView />;
      case "Check-ins": return <CheckInsView />;
      case "Health Records": return <HealthRecordsView />;
      case "Share (QR)": return <ShareQRView />;
      case "Alerts": return <AlertsView />;
      case "Settings": return <SettingsView />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex h-full shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-transparent">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-[#2563EB]" strokeWidth={2.5} />
            <span className="font-bold text-2xl text-[#0F172A] tracking-tight">CuraPath</span>
          </div>
        </div>
        
        <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
          <SidebarItem icon={LayoutGrid} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SidebarItem icon={ClipboardCheck} label="Recovery Plan" active={activeTab === "Recovery Plan"} onClick={() => setActiveTab("Recovery Plan")} />
          <SidebarItem icon={Pill} label="Medications" active={activeTab === "Medications"} onClick={() => setActiveTab("Medications")} />
          <SidebarItem icon={Calendar} label="Appointments" active={activeTab === "Appointments"} onClick={() => setActiveTab("Appointments")} />
          <SidebarItem icon={CheckCircle2} label="Check-ins" active={activeTab === "Check-ins"} onClick={() => setActiveTab("Check-ins")} />
          <SidebarItem icon={FileText} label="Health Records" active={activeTab === "Health Records"} onClick={() => setActiveTab("Health Records")} />
          <SidebarItem icon={QrCode} label="Share (QR)" active={activeTab === "Share (QR)"} onClick={() => setActiveTab("Share (QR)")} />
          <SidebarItem icon={Bell} label="Alerts" active={activeTab === "Alerts"} onClick={() => { setActiveTab("Alerts"); setNotifications(0); }} badge={notifications} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Namaste, Rajesh <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Wishing you a smooth and speedy recovery.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-200">
              English <ChevronDown className="w-4 h-4" />
            </button>
            <div onClick={() => { setActiveTab("Alerts"); setNotifications(0); }} className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-slate-600" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">{notifications}</span>
              )}
            </div>
            <div onClick={() => setActiveTab("Settings")} className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
              <div className="h-10 w-10 bg-[#7C3AED] rounded-full flex items-center justify-center text-white font-bold">
                R
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900">Rajesh Kumar</p>
                <p className="text-xs text-slate-500 font-medium">Patient</p>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD AREA */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderTabContent()}
          </div>
        </main>

        {/* FOOTER - Fixed at bottom of scroll container */}


      </div>
    </div>
  );
}
