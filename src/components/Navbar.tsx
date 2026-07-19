import { Compass, Calendar, BookOpen, Hotel, HeartHandshake, ShoppingBag, Search, ShieldCheck } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  liveStats: any;
}

export default function Navbar({ activeTab, setActiveTab, liveStats }: NavbarProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Compass },
    { id: "darshan", label: "Darshan Tickets", icon: Calendar },
    { id: "check", label: "Verify Ticket", icon: Search }
  ];

  return (
    <header className="w-full bg-[#fffbeb] border-b border-[#e7e5e4] backdrop-blur-md sticky top-0 z-40">
      {/* Dynamic News Ticker bar at the very top */}
      <div className="w-full bg-[#78350f] text-white py-1.5 px-4 text-xs font-medium relative overflow-hidden flex items-center shadow-inner">
        <span className="bg-[#d97706] text-white px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider text-[10px] mr-3 shrink-0">
          Announcements
        </span>
        <div className="overflow-hidden w-full relative h-4">
          <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap absolute flex gap-12 text-[11px]">
            {liveStats?.announcements?.map((ann: string, i: number) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#d97706] rounded-full"></span>
                {ann}
              </span>
            )) || <span>Welcome to Sri Venkateswara Holy Devasthanams Pilgrim Portal. Traditional dress code is mandatory.</span>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand area */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="w-12 h-12 bg-[#b45309] rounded-full flex items-center justify-center text-white font-cinzel text-xl font-bold shadow-lg border-2 border-[#78350f]">
              ॐ
            </div>
            <div>
              <h1 className="font-cinzel text-lg sm:text-xl font-bold text-[#b45309] tracking-tight leading-tight">
                DEVASHTHANAMS PORTAL
              </h1>
              <p className="text-[10px] tracking-widest text-[#78350f] font-medium font-cinzel">
                SRI VENKATESWARA HOLY TRUST
              </p>
            </div>
          </div>

          {/* Quick Status Indicator */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-stone-700 bg-white py-1.5 px-4 rounded-full border border-stone-200 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>General wait: <strong className="text-[#b45309] font-semibold">{liveStats?.liveWaitTimeGeneral || "4 Hours"}</strong></span>
            </div>
            <div className="w-px h-3 bg-stone-300"></div>
            <div>
              <span>Special Darshan: <strong className="text-[#b45309] font-semibold">{liveStats?.liveWaitTimeSpecial || "45 mins"}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab-based Main Navigation (desktop only — mobile uses bottom nav) */}
        <div className="hidden sm:flex overflow-x-auto no-scrollbar border-t border-stone-200/60 py-1 gap-1 -mx-4 sm:mx-0 px-4 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#b45309] text-white shadow-md transform -translate-y-0.5"
                    : "text-stone-700 hover:bg-orange-50 hover:text-[#b45309]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-orange-200" : "text-[#d97706]"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded CSS for marquee animation inside Tailwind v4 framework */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
}
