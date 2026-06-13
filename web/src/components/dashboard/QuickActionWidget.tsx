import { UploadCloud, Bot, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const actions = [
  {
    to: "/upload",
    icon: UploadCloud,
    label: "Upload Document",
    sublabel: "Prescriptions, reports, or notes",
    color: "text-alan-indigo",
    bg: "bg-alan-indigo/5 border-alan-indigo/30",
    iconBg: "text-alan-indigo",
  },
  {
    to: "/coach",
    icon: Bot,
    label: "AI Recovery Coach",
    sublabel: "Ask about your medications or care",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    iconBg: "text-purple-600",
  },
  {
    to: "/reminders",
    icon: Bell,
    label: "Manage Reminders",
    sublabel: "Set medication & appointment alerts",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    iconBg: "text-amber-600",
  },
];

export function QuickActionWidget() {
  return (
    <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map(({ to, icon: Icon, label, sublabel, bg, iconBg }) => (
        <Card key={to} className={`border-dashed border-2 ${bg} hover:scale-[1.02] transition-all cursor-pointer group`}>
          <Link to={to} className="block w-full h-full">
            <CardContent className="flex flex-col items-center justify-center p-5 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Icon className={`h-5 w-5 ${iconBg}`} />
              </div>
              <p className={`text-sm font-semibold ${iconBg}`}>{label}</p>
              <p className={`text-xs opacity-70 ${iconBg}`}>{sublabel}</p>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
