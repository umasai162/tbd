import { useState, useEffect } from "react";
import { Compass, Calendar, BookOpen, HeartHandshake, ShoppingBag, Search, Sparkles, AlertCircle, Sun } from "lucide-react";

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
    { id: "darshan", label: "Special Darshan (Rs 300)", desc: "Reserve date and time slots", icon: Calendar, color: "from-orange-500 to-orange-700" },
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
              className={`w-2.5 h-2.5 rounded-full border transition-all ${
                slideIndex === idx ? "bg-[#d97706] border-[#d97706] scale-110" : "bg-transparent border-stone-200/50"
              }`}
            ></button>
          ))}
        </div>
      </div>



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
