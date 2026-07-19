import { useEffect, useState } from "react";

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"rising" | "glow" | "fadeout">("rising");

  useEffect(() => {
    // Phase 1: Deity rises in (1.5s)
    const t1 = setTimeout(() => setPhase("glow"), 1500);
    // Phase 2: Golden glow (1s)
    const t2 = setTimeout(() => setPhase("fadeout"), 2800);
    // Phase 3: Fade out and call onDone
    const t3 = setTimeout(() => onDone(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === "fadeout" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at center, #1a0a00 0%, #0d0500 60%, #000 100%)",
      }}
    >
      {/* Outer divine rays */}
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute origin-bottom"
            style={{
              width: "2px",
              height: "45vh",
              background: "linear-gradient(to top, rgba(255,180,0,0.6), transparent)",
              transform: `rotate(${i * 30}deg) translateY(-50%)`,
              animation: `pulse 2s ease-in-out ${i * 0.1}s infinite alternate`,
              opacity: phase === "rising" ? 0 : 0.7,
              transition: "opacity 1s ease",
            }}
          />
        ))}
      </div>

      {/* Golden halo ring */}
      <div
        className="absolute rounded-full border-2 border-yellow-400/30"
        style={{
          width: "320px",
          height: "320px",
          boxShadow: phase === "glow" || phase === "fadeout"
            ? "0 0 80px 40px rgba(255,180,0,0.25), 0 0 160px 80px rgba(255,140,0,0.1)"
            : "none",
          transition: "box-shadow 1.2s ease",
        }}
      />
      <div
        className="absolute rounded-full border border-yellow-300/20"
        style={{
          width: "380px",
          height: "380px",
          animation: "spin 12s linear infinite",
        }}
      />

      {/* Deity Image - rising from below */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          transform: phase === "rising" ? "translateY(60px) scale(0.85)" : "translateY(0) scale(1)",
          opacity: phase === "rising" ? 0 : 1,
          transition: "transform 1.4s cubic-bezier(0.34,1.56,0.64,1), opacity 1.2s ease",
        }}
      >
        {/* Om symbol above */}
        <div
          className="text-yellow-400 font-bold mb-3"
          style={{
            fontSize: "2.5rem",
            fontFamily: "serif",
            textShadow: "0 0 20px rgba(255,200,0,0.8), 0 0 40px rgba(255,150,0,0.5)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          ॐ
        </div>

        {/* Deity photo in golden frame */}
        <div
          className="relative rounded-full overflow-hidden border-4 border-yellow-500 shadow-2xl"
          style={{
            width: "200px",
            height: "200px",
            boxShadow: "0 0 40px rgba(255,180,0,0.6), 0 0 80px rgba(255,120,0,0.3), inset 0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <img
            src="/gallery/photo1.jpg"
            alt="Sri Venkateswara Swamy"
            className="w-full h-full object-cover object-top"
            style={{ filter: "brightness(1.1) contrast(1.05)" }}
          />
          {/* Golden overlay shimmer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(ellipse at 30% 20%, rgba(255,220,100,0.15) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Temple name */}
        <div className="mt-5 text-center space-y-1">
          <h1
            className="text-yellow-300 font-bold tracking-widest uppercase"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1rem",
              textShadow: "0 0 15px rgba(255,200,0,0.8)",
              letterSpacing: "0.25em",
            }}
          >
            Sri Venkateswara
          </h1>
          <p
            className="text-yellow-500/80 tracking-wider"
            style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.3em" }}
          >
            HOLY DEVASTHANAMS
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full bg-yellow-400"
              style={{
                width: "8px",
                height: "8px",
                animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      </div>

      {/* Lotus petals at bottom */}
      <div className="absolute bottom-8 flex gap-3 opacity-40">
        {["🪷","✨","🪷"].map((e, i) => (
          <span key={i} style={{ fontSize: "1.2rem", animation: `pulse 2s ease-in-out ${i * 0.3}s infinite` }}>{e}</span>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
