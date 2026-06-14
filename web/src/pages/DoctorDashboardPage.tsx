import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDB, PatientState, Medication } from "@/lib/db";
import { 
  LayoutGrid, Users, Calendar, QrCode, Bell, BarChart2, MessageSquare, Settings, LogOut, 
  Search, ChevronDown, HeartPulse, CheckCircle2, AlertTriangle, User, FileText, Plus,
  MoreVertical, Clock, X, Activity, Filter, Download, ScanLine
} from "lucide-react";

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
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r={radius} stroke="#F1F5F9" strokeWidth="6" fill="none" />
        <circle cx="50%" cy="50%" r={radius} stroke="#10B981" strokeWidth="6" fill="none" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
        <span className="text-[10px] text-slate-500 font-medium">On Track</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, current, total, icon: Icon }: any) => {
  const pct = (current / total) * 100;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-600 flex items-center gap-1.5 font-medium">
           <Icon className="w-3.5 h-3.5 text-slate-400" />
           {label}
        </span>
        <span className="text-slate-400 font-medium"><strong className="text-slate-700">{current}</strong> / {total}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

export default function DoctorDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { db, updatePatient } = useDB();
  
  const selectedPatient = db.patients[0];

  const [activeTab, setActiveTab] = useState("Overview");
  const [messages, setMessages] = useState(3);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", time: "1x Daily", type: "Prescription", stock: "30 left" });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dosage) return;
    const med: Medication = { id: Math.random().toString(), ...newMed };
    updatePatient(selectedPatient.id, { medications: [...(selectedPatient.medications || []), med] });
    setNewMed({ name: "", dosage: "", time: "1x Daily", type: "Prescription", stock: "30 left" });
    setShowAddMedModal(false);
  };

  // --- TAB SUB-VIEWS ---

  const OverviewTab = () => (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex justify-between items-center cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveTab("Appointments")}>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-blue-500" /> Today's Appointments</h3>
            <p className="text-3xl font-black text-slate-900 mb-1">12</p>
            <p className="text-xs text-slate-500 font-medium">3 upcoming</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100"><Calendar className="w-6 h-6 text-blue-600" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex justify-between items-center cursor-pointer hover:border-green-300 transition-colors" onClick={() => setActiveTab("Patients")}>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-green-500" /> Active Patients</h3>
            <p className="text-3xl font-black text-slate-900 mb-1">48</p>
            <p className="text-xs text-slate-500 font-medium">7 new this week</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-100"><Users className="w-6 h-6 text-green-600" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex justify-between items-center cursor-pointer hover:border-orange-300 transition-colors" onClick={() => setActiveTab("Alerts & Follow-ups")}>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2"><Bell className="w-4 h-4 text-orange-500" /> Pending Follow-ups</h3>
            <p className="text-3xl font-black text-slate-900 mb-1">6</p>
            <p className="text-xs text-slate-500 font-medium">Require attention</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100"><Bell className="w-6 h-6 text-orange-600" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex justify-between items-center cursor-pointer hover:border-purple-300 transition-colors" onClick={() => setActiveTab("Alerts & Follow-ups")}>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-purple-500" /> Critical Alerts</h3>
            <p className="text-3xl font-black text-slate-900 mb-1">2</p>
            <p className="text-xs text-slate-500 font-medium">High priority</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100"><AlertTriangle className="w-6 h-6 text-purple-600" /></div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-900">Today's Appointments</h2>
            <button onClick={() => setActiveTab("Appointments")} className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="flex-1 space-y-4">
            {[
              { time: "09:30 AM", name: "Rajesh Kumar", procedure: "Total Knee Replacement", status: "Confirmed", bg: "bg-green-100 text-green-700" },
              { time: "10:15 AM", name: "Sunita Patel", procedure: "Appendectomy Follow-up", status: "Confirmed", bg: "bg-green-100 text-green-700" },
              { time: "11:00 AM", name: "Arjun Mehta", procedure: "ACL Reconstruction", status: "Upcoming", bg: "bg-blue-100 text-blue-700" },
              { time: "12:00 PM", name: "Meena Iyer", procedure: "Hip Replacement", status: "Upcoming", bg: "bg-blue-100 text-blue-700" },
              { time: "02:00 PM", name: "Vikram Singh", procedure: "Fracture Follow-up", status: "Upcoming", bg: "bg-blue-100 text-blue-700" }
            ].map((appt, idx) => (
              <div key={idx} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border-b border-slate-50 last:border-0 pb-3">
                <div className="w-16 text-xs font-bold text-blue-600 shrink-0">{appt.time}</div>
                <div className="h-10 w-10 bg-slate-200 rounded-full overflow-hidden shrink-0"><img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${appt.name}`} alt={appt.name} className="w-full h-full object-cover bg-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{appt.name}</p>
                  <p className="text-xs text-slate-500 truncate">{appt.procedure}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${appt.bg} shrink-0`}>{appt.status}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab("Appointments")} className="mt-4 w-full py-2.5 border border-slate-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> View Full Schedule
          </button>
        </div>

        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">Patient Overview</h2>
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveTab("Patients")} className="text-xs font-bold text-blue-600 hover:text-blue-800">View Full Profile</button>
                <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0"><img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedPatient?.name || "Patient"}`} alt="Avatar" className="w-full h-full object-cover bg-white" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedPatient?.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{selectedPatient?.age} Years, {selectedPatient?.gender} • ID: {selectedPatient?.id}</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium flex items-center gap-2"><FileText className="w-4 h-4" /> Procedure</span><span className="font-bold text-slate-900">{selectedPatient?.procedure}</span></div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> Surgery Date</span><span className="font-bold text-slate-900">12 May 2026</span></div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-slate-500 font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> Next Appointment</span><span className="font-bold text-slate-900">24 May 2026, 09:30 AM</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium flex items-center gap-2"><HeartPulse className="w-4 h-4" /> Status</span><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">Recovering Well</span></div>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 relative">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Recovery Progress</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="shrink-0"><DonutChart percentage={72} /></div>
                  <div className="flex-1 w-full space-y-1">
                    <ProgressBar label="Medications" current={selectedPatient?.medications?.length || 0} total={10} icon={CheckCircle2} />
                    <ProgressBar label="Appointments" current={3} total={5} icon={Calendar} />
                    <ProgressBar label="Check-ins" current={7} total={10} icon={CheckCircle2} />
                    <ProgressBar label="Goals" current={4} total={6} icon={CheckCircle2} />
                  </div>
                </div>
                <button onClick={() => setShowAddMedModal(true)} className="absolute top-4 right-4 bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 flex items-center gap-1 shadow-sm transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Rx
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6"><h2 className="text-base font-bold text-slate-900">Recent Check-ins</h2><button className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</button></div>
              <div className="space-y-4">
                {[
                  { date: "21 May 2026, 09:00 AM", status: "Normal", bg: "bg-green-100 text-green-700", note: "Patient reported no pain, doing well.", icon: CheckCircle2, iconCol: "text-green-500" },
                  { date: "19 May 2026, 09:00 AM", status: "Monitored", bg: "bg-orange-100 text-orange-700", note: "Mild swelling reported in right knee.", icon: AlertTriangle, iconCol: "text-orange-500" },
                  { date: "17 May 2026, 09:00 AM", status: "Normal", bg: "bg-green-100 text-green-700", note: "Exercises completed as advised.", icon: CheckCircle2, iconCol: "text-green-500" }
                ].map((chk, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <chk.icon className={`w-4 h-4 mt-1 shrink-0 ${chk.iconCol}`} />
                    <div className="flex-1"><div className="flex justify-between items-start mb-1"><p className="text-xs font-bold text-slate-900">{chk.date}</p><span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${chk.bg}`}>{chk.status}</span></div><p className="text-xs text-slate-500">{chk.note}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6"><h2 className="text-base font-bold text-slate-900">Shared Records (QR)</h2><button onClick={() => setActiveTab("Shared Records")} className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</button></div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <div><p className="text-xs font-medium text-slate-500">Last Shared:</p><p className="text-sm font-bold text-slate-900">21 May 2026, 10:15 AM</p></div>
                  <div><p className="text-xs font-medium text-slate-500">Shared with:</p><p className="text-sm font-bold text-slate-900">Dr. Neha Verma</p></div>
                  <div><p className="text-xs font-medium text-slate-500">Purpose:</p><p className="text-sm font-bold text-slate-900">Orthopaedic Consultation</p></div>
                </div>
                <div className="shrink-0 flex flex-col items-center">
                  <div className="bg-white p-1 border border-slate-200 rounded-lg mb-2"><div className="w-16 h-16 flex flex-wrap gap-[1px]">{Array.from({ length: 64 }).map((_, i) => (<div key={i} className={`w-[7px] h-[7px] ${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-transparent'}`}></div>))}</div></div>
                  <span className="text-[10px] text-slate-500 font-medium">Scan to View</span>
                </div>
              </div>
              <button onClick={() => setActiveTab("Shared Records")} className="mt-4 w-full py-2 border border-slate-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"><QrCode className="w-4 h-4" /> View Shared Record</button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ALERT ROW */}
      <div className="bg-transparent mt-2">
        <div className="flex justify-between items-center mb-4"><h2 className="text-base font-bold text-slate-900">Alerts & Reminders</h2><button onClick={() => setActiveTab("Alerts & Follow-ups")} className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</button></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab("Alerts & Follow-ups")} className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors"><div className="flex items-start gap-3"><Bell className="w-5 h-5 text-red-500 mt-0.5 shrink-0" /><div><p className="text-sm font-bold text-slate-900">High pain level reported by Sunita Patel</p><p className="text-xs text-slate-500 mt-1">21 May 2026, 08:45 AM</p></div></div><ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 shrink-0" /></div>
          <div onClick={() => setActiveTab("Alerts & Follow-ups")} className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-orange-50 transition-colors"><div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" /><div><p className="text-sm font-bold text-slate-900">Medication adherence below 50% for Arjun Mehta</p><p className="text-xs text-slate-500 mt-1">21 May 2026, 08:20 AM</p></div></div><ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 shrink-0" /></div>
          <div onClick={() => setActiveTab("Alerts & Follow-ups")} className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"><div className="flex items-start gap-3"><div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">i</div><div><p className="text-sm font-bold text-slate-900">Vikram Singh missed check-in</p><p className="text-xs text-slate-500 mt-1">20 May 2026, 09:00 AM</p></div></div><ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 shrink-0" /></div>
        </div>
      </div>
    </div>
  );

  const PatientsTab = () => (
    <div className="max-w-[1400px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Patient Roster</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search ID or Name" className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500" />
          </div>
          <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50"><Filter className="w-4 h-4" /> Filter</button>
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-sm font-bold text-slate-500">
            <th className="pb-4 pl-4">Patient</th>
            <th className="pb-4">ID</th>
            <th className="pb-4">Procedure</th>
            <th className="pb-4">Surgery Date</th>
            <th className="pb-4">Status</th>
            <th className="pb-4">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {db.patients.map(p => (
            <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-4 pl-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 rounded-full overflow-hidden"><img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} className="w-full h-full object-cover bg-white" /></div>
                <p className="font-bold text-slate-900">{p.name}</p>
              </td>
              <td className="font-medium text-slate-600">{p.id}</td>
              <td className="font-medium text-slate-600">{p.procedure}</td>
              <td className="font-medium text-slate-600">12 May 2026</td>
              <td><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Recovering Well</span></td>
              <td><button onClick={() => alert("Opening Patient Medical File...")} className="text-blue-600 font-bold hover:text-blue-800">View File</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const AppointmentsTab = () => (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Schedule</h2>
          <p className="text-slate-500 font-medium">Manage your clinic and video consultations.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"><Plus className="w-5 h-5" /> New Appointment</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {[
          { time: "09:30 AM", name: "Rajesh Kumar", type: "In-Person", reason: "Total Knee Replacement Follow-up" },
          { time: "10:15 AM", name: "Sunita Patel", type: "Video Call", reason: "Incision Healing Check" },
          { time: "11:00 AM", name: "Arjun Mehta", type: "In-Person", reason: "ACL Reconstruction" }
        ].map((a, i) => (
          <div key={i} className="border-b border-slate-100 last:border-0 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-6">
              <div className="text-center bg-slate-100 rounded-xl px-4 py-2 border border-slate-200"><p className="font-bold text-slate-900">{a.time}</p></div>
              <div>
                <p className="font-bold text-slate-900 text-lg">{a.name}</p>
                <p className="text-slate-500 font-medium">{a.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.type === 'Video Call' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{a.type}</span>
              <button onClick={() => alert(`Viewing details for ${a.name}...`)} className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-white shadow-sm">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SharedRecordsTab = () => (
    <div className="max-w-[1000px] mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
      <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">QR Import Engine</h2>
      <p className="text-slate-500 font-medium mb-8 max-w-lg mx-auto">Scan a patient's CuraPath Clinical Passport to instantly import their verified medical history, active prescriptions, and recovery timelines into your system.</p>
      <div onClick={() => alert("WebCam activated for QR scanning!")} className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-16 max-w-lg mx-auto flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-colors">
        <ScanLine className="w-12 h-12 text-slate-400 mb-4" />
        <p className="font-bold text-slate-600">Click to Activate WebCam</p>
      </div>
    </div>
  );

  const AlertsTab = () => (
    <div className="max-w-[1000px] mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Clinical Alerts & Triage</h2>
      <div className="space-y-4">
        <div className="border border-red-200 bg-red-50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4"><AlertTriangle className="w-8 h-8 text-red-500 shrink-0" /><div><p className="font-bold text-slate-900 text-lg">High Pain Logged (8/10)</p><p className="text-slate-600 font-medium">Sunita Patel • Post-Op Day 3 • 21 May, 08:45 AM</p></div></div>
          <button onClick={() => alert("Opening Sunita Patel's clinical chart...")} className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-red-700 w-full md:w-auto">Review Chart</button>
        </div>
        <div className="border border-orange-200 bg-orange-50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4"><Clock className="w-8 h-8 text-orange-500 shrink-0" /><div><p className="font-bold text-slate-900 text-lg">Medication Non-Adherence</p><p className="text-slate-600 font-medium">Arjun Mehta • Missed 3 doses in 48 hrs</p></div></div>
          <button onClick={() => alert("Automated WhatsApp reminder sent to Arjun Mehta.")} className="bg-white border border-orange-300 text-orange-700 font-bold px-6 py-2 rounded-lg hover:bg-orange-100 w-full md:w-auto">Send Reminder</button>
        </div>
      </div>
    </div>
  );

  const MessagesTab = () => (
    <div className="max-w-[1200px] mx-auto h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden">
      <div className="w-1/3 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900 flex justify-between items-center">
          Inbox {messages > 0 && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">{messages}</span>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {['Rajesh Kumar', 'Sunita Patel', 'Arjun Mehta'].map((name, i) => (
            <div key={i} onClick={() => setMessages(0)} className="p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden"><img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}`} className="w-full h-full object-cover bg-white"/></div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${i===0 && messages>0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{name}</p>
                <p className="text-xs text-slate-500 truncate">I had a quick question regarding...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-medium">Select a conversation to view messages</p>
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500">
      <BarChart2 className="h-16 w-16 mb-4 opacity-20" />
      <h2 className="text-xl font-bold text-slate-700">Analytics Engine</h2>
      <p>Data visualization modules are currently being aggregated.</p>
    </div>
  );

  const SettingsTab = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500">
      <Settings className="h-16 w-16 mb-4 opacity-20" />
      <h2 className="text-xl font-bold text-slate-700">Provider Settings</h2>
      <p>Configure clinic hours, notification triggers, and staff access.</p>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case "Overview": return <OverviewTab />;
      case "Patients": return <PatientsTab />;
      case "Appointments": return <AppointmentsTab />;
      case "Shared Records": return <SharedRecordsTab />;
      case "Alerts":
      case "Alerts & Follow-ups": return <AlertsTab />;
      case "Messages": return <MessagesTab />;
      case "Analytics": return <AnalyticsTab />;
      case "Settings": return <SettingsTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex h-full shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-[#2563EB]" strokeWidth={2.5} />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-[#0F172A] leading-tight tracking-tight">CuraPath</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Doctor Dashboard</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
          <SidebarItem icon={LayoutGrid} label="Overview" active={activeTab === "Overview"} onClick={() => setActiveTab("Overview")} />
          <SidebarItem icon={Users} label="Patients" active={activeTab === "Patients"} onClick={() => setActiveTab("Patients")} />
          <SidebarItem icon={Calendar} label="Appointments" active={activeTab === "Appointments"} onClick={() => setActiveTab("Appointments")} />
          <SidebarItem icon={QrCode} label="Shared Records (QR)" active={activeTab === "Shared Records"} onClick={() => setActiveTab("Shared Records")} />
          <SidebarItem icon={Bell} label="Alerts & Follow-ups" active={activeTab === "Alerts & Follow-ups"} onClick={() => setActiveTab("Alerts & Follow-ups")} />
          <SidebarItem icon={BarChart2} label="Analytics" active={activeTab === "Analytics"} onClick={() => setActiveTab("Analytics")} />
          <SidebarItem icon={MessageSquare} label="Messages" active={activeTab === "Messages"} onClick={() => { setActiveTab("Messages"); setMessages(0); }} badge={messages} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Good Morning, Dr. Amit Sharma <span className="text-xl">👋</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Here's what's happening with your patients today.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search patients..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64 bg-slate-50" />
            </div>
            <div onClick={() => setActiveTab("Alerts & Follow-ups")} className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">5</span>
            </div>
            <div onClick={() => setActiveTab("Settings")} className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
              <div className="h-10 w-10 bg-slate-200 rounded-full overflow-hidden shrink-0"><img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Amit`} alt="Avatar" className="w-full h-full object-cover bg-white" /></div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900">Dr. Amit Sharma</p>
                <p className="text-xs text-slate-500 font-medium">Orthopaedic Surgeon</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD AREA */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
            {renderTabContent()}
          </div>
        </main>

       
      </div>

      {/* ADD MEDICATION MODAL */}
      {showAddMedModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add New Prescription</h2>
              <button onClick={() => setShowAddMedModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddMedication} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Medication Name</label>
                <input required autoFocus type="text" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Ibuprofen" value={newMed.name} onChange={(e) => setNewMed({...newMed, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dosage</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. 400mg" value={newMed.dosage} onChange={(e) => setNewMed({...newMed, dosage: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Frequency</label>
                  <select className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 bg-white" value={newMed.time} onChange={(e) => setNewMed({...newMed, time: e.target.value})}>
                    <option>1x Daily</option><option>2x Daily</option><option>3x Daily</option><option>As Needed</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddMedModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save & Push to Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
