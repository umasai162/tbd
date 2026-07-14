import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Sparkles, Sun, Sunset, Info } from "lucide-react";
import { PanchangamData } from "../types";

export default function PanchangamCalendar() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [panchangam, setPanchangam] = useState<PanchangamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/panchangam?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setPanchangam(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching panchangam:", err);
        setLoading(false);
      });
  }, [selectedDate]);

  return (
    <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm traditional-glow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 opacity-60"></div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-100 pb-4 mb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-saffron-600 tracking-wider font-cinzel">Almanac</span>
          <h2 className="text-xl font-cinzel font-bold text-amber-950 flex items-center gap-2">
            Daily Panchangam
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-amber-800 font-medium">Select Date:</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-amber-50 border border-amber-200 text-amber-950 text-xs rounded-lg focus:ring-saffron-500 focus:border-saffron-500 block p-2 pl-8 font-mono outline-none"
            />
            <CalendarIcon className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-60 flex flex-col items-center justify-center text-amber-700/60 text-sm gap-2">
          <span className="animate-spin text-xl">☯</span>
          <span>Calculating planetary alignments...</span>
        </div>
      ) : panchangam ? (
        <div className="space-y-6">
          {/* Key details row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-widest mb-1">Tithi</span>
              <span className="text-sm font-semibold text-amber-950 font-cinzel">{panchangam.tithi}</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-widest mb-1">Nakshatram</span>
              <span className="text-sm font-semibold text-amber-950 font-cinzel">{panchangam.nakshatram}</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-widest mb-1">Sunrise</span>
              <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1 font-mono">
                <Sun className="w-4 h-4 text-amber-500" /> {panchangam.sunrise}
              </span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-widest mb-1">Sunset</span>
              <span className="text-sm font-semibold text-rose-700 flex items-center gap-1 font-mono">
                <Sunset className="w-4 h-4 text-amber-600" /> {panchangam.sunset}
              </span>
            </div>
          </div>

          {/* Times and Festivals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Planetary Kalam */}
            <div className="border border-amber-100 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-saffron-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-50 pb-2">
                <Clock className="w-3.5 h-3.5 text-saffron-600" /> Period timings
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-dashed border-amber-50">
                  <span className="text-amber-800 font-medium">Auspicious Muhurtham:</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    {panchangam.auspiciousTime}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-dashed border-amber-50">
                  <span className="text-amber-800 font-medium">Rahu Kalam:</span>
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-mono">
                    {panchangam.rahukalam}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-dashed border-amber-50">
                  <span className="text-amber-800 font-medium">Yamagandam:</span>
                  <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono">
                    {panchangam.yamagandam}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-amber-800 font-medium">Gulika Kalam:</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
                    {panchangam.gulikakalam}
                  </span>
                </div>
              </div>
            </div>

            {/* Festivals */}
            <div className="border border-amber-100 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-saffron-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-50 pb-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-saffron-600" /> Special Observances
                </h3>
                <div className="space-y-2">
                  {panchangam.festivals.map((fest, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="text-amber-500 mt-0.5">✦</span>
                      <span className="text-amber-950 font-medium font-cinzel">{fest}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 bg-amber-50 p-3 rounded-lg flex items-start gap-2 border border-amber-100">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  Auspicious periods are based on local sun position of the Devasthanam headquarters. Timings may vary slightly depending on your exact geographic latitude.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 text-red-500 text-xs">
          Failed to load astronomical data.
        </div>
      )}
    </div>
  );
}
