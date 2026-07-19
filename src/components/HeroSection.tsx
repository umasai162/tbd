import { useState, useEffect } from "react";
import { Calendar, BookOpen, HeartHandshake, ShoppingBag, Search, Sparkles, Sun, Clock, Star } from "lucide-react";

// Weekly Darshan Schedule
const weeklySchedule: Record<string, { title: string; time?: string; description: string; badge: string; badgeColor: string }> = {
  Monday:    { title: "Normal Darshanam",       description: "Regular darshan open for all pilgrims throughout the day.",                          badge: "Open All Day",   badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  Tuesday:   { title: "Normal Darshanam",       description: "Regular darshan open for all pilgrims throughout the day.",                          badge: "Open All Day",   badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  Wednesday: { title: "Normal Darshanam",       description: "Regular darshan open for all pilgrims throughout the day.",                          badge: "Open All Day",   badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  Thursday:  { title: "Nijarupa Darshanam",     description: "Special Nijarupa Darshanam — Lord Venkateswara in his original divine form.",        badge: "Special Seva",   badgeColor: "bg-amber-100 text-amber-800 border-amber-200" },
  Friday:    { title: "Suprabhatam Seva",       time: "4:00 AM", description: "Sacred early morning Suprabhatam — divine awakening of Lord Venkateswara.",  badge: "4:00 AM Start",  badgeColor: "bg-orange-100 text-orange-800 border-orange-200" },
  Saturday:  { title: "Nitya Annaprasadam Seva", time: "Afternoon: 11:30 AM - 3:00 PM | Night: 6:30 PM - 9:30 PM", description: "Sacred distribution of free holy meals (Annaprasadam) to all visiting devotees.", badge: "Annaprasadam", badgeColor: "bg-amber-100 text-amber-800 border-amber-200" },
  Sunday:    { title: "Normal Darshanam",       description: "Regular darshan open for all pilgrims. Expect heavy crowds on weekends.",             badge: "Open All Day",   badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

interface HeroSectionProps {
  onNavigate: (tab: string) => void;
  liveStats: any;
}

export default function HeroSection({ onNavigate, liveStats }: HeroSectionProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      title: "Sri Venkateswara Swamy Temple",
      subtitle: "The Sacred Abode on Seven Hills (Tirumala)",
      desc: "Experience divine light at the world's most-visited holy shrine, nested in the tranquil Seshachalam range of Chittoor Hills.",
      img: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk3dktjLv8vlCzQQfJ8BQ_U5kQK65J_AbO18JNeivtsTKpUFD4UiF39uHr4M1JCB0ava57sBxaoeRXN8XyB0DcdSql-DBpbDcLdf0lZWN-bek6KOvDfR8n5anuKXyOo0th0RG-V=s1600"
    },
    {
      title: "Sri Bhramaramba Mallikarjuna Temple",
      subtitle: "The Divine Jyotirlinga and Shakti Peetha (Srisailam)",
      desc: "Settle your mind in the deep spiritual forests of Srisailam, where Lord Shiva and Goddess Parvati reside as supreme protectors.",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Sri Kalahasteeswara Swamy Temple",
      subtitle: "The Holy Vayu Linga of Panchabhuta (Srikalahasti)",
      desc: "Perform Rahu-Ketu Pujas and release cosmic obstacles in the ancient, wind-swept stone corridors of Srikalahasti.",
      img: "https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const actions = [
    { id: "darshan", label: "Special Darshan (Rs 100)", desc: "Reserve date and time slots", icon: Calendar, color: "from-orange-500 to-orange-700" },
    { id: "sevas", label: "Book Holy Pujas / Sevas", desc: "Suprabhatam, Kalyanotsavam, Archana", icon: BookOpen, color: "from-amber-500 to-amber-700" },
    { id: "donations", label: "Digital e-Hundi & Trusts", desc: "Support Annadanam & Gosala", icon: HeartHandshake, color: "from-red-500 to-red-700" },
    { id: "prasadam", label: "Pre-order Laddus & Food", desc: "Bypass counters, collect with vouchers", icon: ShoppingBag, color: "from-emerald-600 to-emerald-800" },
    { id: "check", label: "Verify & Print passes", desc: "Lookup tickets with Aadhaar / ID", icon: Search, color: "from-[#b45309] to-[#78350f]" }
  ];

  return (
    <div className="space-y-8 text-stone-800">
      {/* 1. STUNNING DYNAMIC SLIDESHOW HERO */}
      <div className="relative h-[380px] rounded-3xl overflow-hidden shadow-lg border border-[#e7e5e4] bg-[#78350f] text-white">
        {/* Dynamic sliding background */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
          <img
            src={slides[slideIndex].img}
            alt={slides[slideIndex].title}
            className="w-full h-full object-cover opacity-35 scale-105 transition-all duration-[6s] hover:scale-100"
          />
        </div>
        {/* Divine overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#78350f] via-[#78350f]/40 to-transparent"></div>

        {/* Slide Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 space-y-3 max-w-3xl">
          <span className="text-[#d97706] font-cinzel text-xs font-bold tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 animate-spin text-orange-200" />
            OFFICIAL HOLY DEVASTHANAMS PREVIEW
          </span>
          <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold tracking-tight leading-none text-white">
            {slides[slideIndex].title}
          </h2>
          <p className="text-orange-100 font-medium text-xs sm:text-sm font-cinzel">
            {slides[slideIndex].subtitle}
          </p>
          <p className="text-stone-100 text-xs sm:text-xs leading-relaxed font-sans max-w-2xl">
            {slides[slideIndex].desc}
          </p>
        </div>

        {/* Dots indicators */}
        <div className="absolute bottom-6 right-6 sm:right-10 flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full border transition-all ${slideIndex === idx ? "bg-[#d97706] border-[#d97706] scale-110" : "bg-transparent border-stone-200/50"
                }`}
            ></button>
          ))}
        </div>
      </div>


      {/* TODAY'S DARSHAN SCHEDULE */}
      {(() => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        const schedule = weeklySchedule[today];
        const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return (
          <div className="bg-white border border-[#e7e5e4] rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#78350f] to-[#b45309] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-orange-200 animate-spin" style={{ animationDuration: "8s" }} />
                <span className="font-cinzel text-white font-bold text-sm tracking-wide">Today's Darshan Schedule</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white text-[10px] font-semibold">{today}</span>
              </div>
            </div>

            <div className="p-5 flex flex-col sm:flex-row gap-5">
              {/* Today's highlight */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 shrink-0">
                    <Star className="w-5 h-5 text-[#b45309]" />
                  </div>
                  <div>
                    <h4 className="font-cinzel font-bold text-stone-900 text-base leading-tight">{schedule.title}</h4>
                    <p className="text-stone-600 text-xs mt-1 leading-relaxed">{schedule.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${schedule.badgeColor}`}>
                    {schedule.badge}
                  </span>
                  {schedule.time && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#78350f] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                      <Clock className="w-3 h-3" /> {schedule.time.startsWith("Afternoon") ? "" : "Starts at "}{schedule.time}
                    </span>
                  )}
                </div>
              </div>

              {/* Weekly mini calendar strip */}
              <div className="shrink-0">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">This Week</p>
                <div className="flex gap-1.5">
                  {allDays.map((day) => {
                    const s = weeklySchedule[day];
                    const isToday = day === today;
                    const isSpecial = s.badge !== "Open All Day";
                    return (
                      <div
                        key={day}
                        className={`flex flex-col items-center px-2 py-2 rounded-xl border transition-all ${
                          isToday
                            ? "bg-[#b45309] border-[#78350f] shadow-md scale-105"
                            : isSpecial
                            ? "bg-amber-50 border-amber-200"
                            : "bg-stone-50 border-stone-100"
                        }`}
                      >
                        <span className={`text-[9px] font-bold ${isToday ? "text-orange-200" : "text-stone-400"}`}>
                          {day.slice(0, 3).toUpperCase()}
                        </span>
                        <span className={`mt-1 text-[8px] font-semibold text-center leading-tight w-8 ${
                          isToday ? "text-white" : isSpecial ? "text-amber-700" : "text-stone-600"
                        }`}>
                          {s.title.split(" ")[0]}
                        </span>
                        {s.time && (
                          <span className={`text-[7px] mt-0.5 font-mono ${isToday ? "text-orange-200" : "text-orange-600"}`}>
                            {s.time}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. BENTO QUICK LINKS GRID */}

      <div className="space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider font-cinzel">Quick Actions</span>
          <h3 className="text-lg font-cinzel font-bold text-stone-900">
            Secure Pilgrimage Services Online
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => onNavigate(act.id)}
                className="group relative border border-[#e7e5e4] bg-white rounded-2xl p-5 text-left transition-all duration-300 hover:border-[#b45309] hover:shadow-md hover:translate-y-[-2px] flex items-start gap-4 cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-orange-50 text-[#b45309] group-hover:bg-[#b45309] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-cinzel text-xs font-bold text-stone-900 group-hover:text-[#b45309] transition-colors leading-tight">
                    {act.label}
                  </h4>
                  <p className="text-[10px] text-stone-600 leading-normal font-sans">
                    {act.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
