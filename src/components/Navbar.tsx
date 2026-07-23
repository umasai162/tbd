import React from "react";
import { Compass, Calendar, BookOpen, HeartHandshake, ShoppingBag, Search, Image } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  liveStats: any;
}

export default function Navbar({ activeTab, setActiveTab, liveStats }: NavbarProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Compass },
    { id: "darshan", label: "Darshan Tickets", icon: Calendar },
    { id: "sevas", label: "Seva Bookings", icon: BookOpen },
    { id: "donations", label: "E-Donation & Hundi", icon: HeartHandshake },
    { id: "prasadam", label: "Prasadam Laddu", icon: ShoppingBag },
    { id: "gallery", label: "Divine Gallery", icon: Image },
    { id: "check", label: "Verify Ticket", icon: Search }
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    if (lang === "en") {
      // Reset to English by clearing the googtrans cookie
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    } else {
      // Set Google Translate cookie to the selected language
      document.cookie = `googtrans=/en/${lang}; path=/`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    }
    window.location.reload();
  };

  // Read the current active language from the googtrans cookie
  const getCurrentLang = (): string => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
    return match ? match[1] : "en";
  };

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
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-[#78350f]">
              <img src="/gallery/logo.png" alt="Sri Venkateswara Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-[#78350f] text-sm sm:text-base leading-tight" style={{ fontFamily: 'serif' }}>
                శ్రీ తిరుమల బాలాజీ దివ్యక్షేత్రం
              </p>
            </div>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] uppercase font-bold text-[#78350f] tracking-wider hidden md:inline">🌐</span>
            <select
              onChange={handleLanguageChange}
              value={getCurrentLang()}
              className="bg-orange-50/50 border border-orange-200 text-[#78350f] text-xs rounded-xl px-3 py-2 font-bold outline-none cursor-pointer focus:ring-1 focus:ring-[#b45309]"
            >
              <option value="en">🇮🇳 English</option>
              <option value="te">🌸 తెలుగు</option>
              <option value="hi">🕉 हिन्दी</option>
            </select>
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${isActive
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
