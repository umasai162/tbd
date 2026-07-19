import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import DarshanBooking from "./components/DarshanBooking";
import SevaBooking from "./components/SevaBooking";
import DonationSection from "./components/DonationSection";
import PrasadamOrder from "./components/PrasadamOrder";
import CheckTicket from "./components/CheckTicket";
import PanchangamCalendar from "./components/PanchangamCalendar";
import ChatGuide from "./components/ChatGuide";
import Gallery from "./components/Gallery";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [liveStats, setLiveStats] = useState<any>(null);
  
  // High comfort state to highlight newly booked tickets
  const [successBooking, setSuccessBooking] = useState<any>(null);

  // Music player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.3); // Default 30% volume
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const DEVOTIONAL_TRACKS = [
    { id: 1, name: "Divine Temple Flute", src: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Indian_flute_music.ogg" },
    { id: 2, name: "Calming Yaman Sitar", src: "https://upload.wikimedia.org/wikipedia/commons/2/24/Sitar_Improvisation_in_Raga_Yaman.ogg" },
    { id: 3, name: "Sacred Singing Bowl", src: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Tibetan_Singing_Bowl_-_Calming_Music.ogg" }
  ];

  useEffect(() => {
    // Fetch live statistics from our full-stack Express server
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setLiveStats(data))
      .catch((err) => console.error("Error fetching live stats:", err));
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Autoplay on first user interaction and attempt immediate autoplay
  useEffect(() => {
    // Try immediate autoplay first
    const attemptImmediateAutoplay = () => {
      if (audioRef.current && !isMusicPlaying) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => {
          setIsMusicPlaying(true);
          console.log("🎵 Music started automatically");
        }).catch((err) => {
          console.log("Autoplay blocked, waiting for user interaction:", err);
        });
      }
    };

    // Attempt immediate autoplay
    attemptImmediateAutoplay();

    // Fallback: start on first user interaction
    const startAudioOnInteraction = () => {
      if (audioRef.current && !isMusicPlaying) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => {
          setIsMusicPlaying(true);
          console.log("🎵 Music started on user interaction");
        }).catch((err) => {
          console.log("Autoplay blocked on interaction:", err);
        });
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener("click", startAudioOnInteraction);
      window.removeEventListener("touchstart", startAudioOnInteraction);
      window.removeEventListener("keydown", startAudioOnInteraction);
      window.removeEventListener("scroll", startAudioOnInteraction);
    };

    window.addEventListener("click", startAudioOnInteraction);
    window.addEventListener("touchstart", startAudioOnInteraction);
    window.addEventListener("keydown", startAudioOnInteraction);
    window.addEventListener("scroll", startAudioOnInteraction);

    return cleanupListeners;
  }, [isMusicPlaying, volume]);

  const handleBookingSuccess = (booking: any) => {
    setSuccessBooking(booking);
    // Switch to verify ticket tab to show the boarding pass!
    setActiveTab("check");
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {
        setIsMusicPlaying(false);
      });
    }
  };

  const playTrackIdx = (idx: number) => {
    setCurrentTrackIdx(idx);
    setIsMusicPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = DEVOTIONAL_TRACKS[idx].src;
      audioRef.current.load();
      // Ensure volume is set
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch((err) => {
        console.error("Playback failed for selected track:", err);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-stone-800 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Background Peace Music (hidden audio element) */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src={DEVOTIONAL_TRACKS[currentTrackIdx].src}
      />
      
      {/* 1. Navbars and Scroll announcements */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} liveStats={liveStats} />

      {/* 2. Main Page Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 space-y-8">
        
        {/* Dynamic component routing based on selected tab */}
        <div className="transition-all duration-300">
          {activeTab === "home" && (
            <div className="space-y-8">
              <HeroSection onNavigate={setActiveTab} liveStats={liveStats} />
              <PanchangamCalendar />
            </div>
          )}

          {activeTab === "darshan" && (
            <DarshanBooking onBookingSuccess={handleBookingSuccess} />
          )}

          {activeTab === "sevas" && (
            <SevaBooking onBookingSuccess={handleBookingSuccess} />
          )}

          {activeTab === "donations" && (
            <DonationSection />
          )}

          {activeTab === "prasadam" && (
            <PrasadamOrder onBookingSuccess={handleBookingSuccess} />
          )}

          {activeTab === "gallery" && (
            <Gallery />
          )}

          {activeTab === "check" && (
            <div className="space-y-6">
              {successBooking && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs flex flex-col gap-1">
                  <p className="font-bold text-sm">Divine Reservation Successful! ॐ</p>
                  <p>Your booking has been synced with the Temple logs. Print your ticket or save the transaction ID below.</p>
                </div>
              )}
              <CheckTicket />
            </div>
          )}
        </div>
      </main>

      {/* 3. Footer (hidden on mobile to not interfere with bottom nav) */}
      <footer className="hidden sm:block bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="font-cinzel text-xs font-bold text-stone-100 tracking-wider">SRI VENKATESWARA HOLY DEVASTHANAMS</h4>
            <p className="text-[10px] uppercase font-mono">Official Devotional Services Administration Portal • © 2026</p>
          </div>
          <div className="text-[10px] space-y-1 md:text-right">
            <p>Managed by Department of Endowments, Govt. of Andhra Pradesh, India</p>
            <p>Under strict compliance of temple rules, dress codes, and tradition guidelines.</p>
          </div>
        </div>
      </footer>

      {/* 4. Premium Floating Music Player Widget */}
      <div 
        className={`fixed bottom-20 sm:bottom-6 left-4 z-50 bg-white/95 backdrop-blur-md border border-orange-200/50 rounded-2xl shadow-xl transition-all duration-300 flex flex-col traditional-glow text-stone-800 p-3.5 ${
          isPlayerExpanded ? "w-64" : "w-12 h-12 overflow-hidden cursor-pointer"
        }`}
        onClick={() => {
          if (!isPlayerExpanded) {
            setIsPlayerExpanded(true);
          }
        }}
      >
        {!isPlayerExpanded ? (
          <div className="flex items-center justify-center w-full h-full relative group">
            {/* Spinning disk or Note */}
            <div className={`w-8 h-8 rounded-full border border-orange-300 flex items-center justify-center text-white bg-[#b45309] ${isMusicPlaying ? 'animate-spin' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            {isMusicPlaying && (
              <span className="absolute inset-0 rounded-full border-2 border-orange-300 animate-ping opacity-35"></span>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orange-100 pb-1.5">
              <span className="font-cinzel text-[9px] font-bold text-[#b45309] tracking-wider">Divine Ambient Player</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlayerExpanded(false);
                }} 
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Track Info */}
            <div className="text-center py-1">
              <p className="text-xs font-semibold text-stone-900 leading-snug">{DEVOTIONAL_TRACKS[currentTrackIdx].name}</p>
              <span className="text-[9px] text-[#b45309]/80 font-medium font-mono uppercase tracking-widest mt-0.5 block">
                {isMusicPlaying ? "Playing Ambient Sound" : "Paused"}
              </span>
            </div>

            {/* Sound Wave Animation & Main Controls */}
            <div className="flex items-center justify-center gap-4 py-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  playTrackIdx((currentTrackIdx - 1 + DEVOTIONAL_TRACKS.length) % DEVOTIONAL_TRACKS.length);
                }}
                className="p-1 hover:bg-orange-50 rounded-lg text-stone-600 hover:text-[#b45309] transition-colors"
                title="Previous track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMusic();
                }}
                className="w-10 h-10 rounded-full bg-[#b45309] hover:bg-[#78350f] text-white flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95"
                title={isMusicPlaying ? "Pause" : "Play"}
              >
                {isMusicPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                )}
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  playTrackIdx((currentTrackIdx + 1) % DEVOTIONAL_TRACKS.length);
                }}
                className="p-1 hover:bg-orange-50 rounded-lg text-stone-600 hover:text-[#b45309] transition-colors"
                title="Next track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/>
                </svg>
              </button>
            </div>

            {/* Wave equalizer animation */}
            <div className="h-4 flex items-end justify-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const heights = ["h-2", "h-4", "h-3", "h-1", "h-4", "h-2", "h-3"];
                return (
                  <div 
                    key={i} 
                    className={`w-1 bg-gradient-to-t from-[#b45309] to-orange-400 rounded-full transition-all duration-300 ${heights[i]} ${
                      isMusicPlaying ? "animate-pulse animate-duration-500" : "opacity-30"
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                );
              })}
            </div>

            {/* Volume & Selectors */}
            <div className="space-y-2 border-t border-orange-100 pt-2 text-[10px]">
              <div className="flex items-center justify-between text-stone-500">
                <span className="font-semibold uppercase tracking-wider">Select Track</span>
              </div>
              <select
                value={currentTrackIdx}
                onChange={(e) => {
                  e.stopPropagation();
                  playTrackIdx(parseInt(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-orange-50/40 border border-orange-100 text-stone-900 rounded-lg p-1.5 outline-none font-semibold text-[11px] focus:ring-1 focus:ring-[#b45309]"
              >
                {DEVOTIONAL_TRACKS.map((t, idx) => (
                  <option key={t.id} value={idx}>{t.name}</option>
                ))}
              </select>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 text-stone-500 pt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  {volume > 0 ? (
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  ) : null}
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    e.stopPropagation();
                    setVolume(parseFloat(e.target.value));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#b45309]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around py-1.5 px-1">
          {[
            { id: "home", label: "Home", icon: "🏛️" },
            { id: "darshan", label: "Darshan", icon: "🙏" },
            { id: "sevas", label: "Sevas", icon: "📿" },
            { id: "donations", label: "Donate", icon: "💝" },
            { id: "prasadam", label: "Prasad", icon: "🍬" },
            { id: "gallery", label: "Gallery", icon: "🖼️" },
            { id: "check", label: "Tickets", icon: "🎫" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "text-[#b45309] bg-orange-50"
                  : "text-stone-500"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="text-[9px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 6. Divine Floating Assistant Chatbot (Gemini AI powered) */}
      <ChatGuide />
    </div>
  );
}

