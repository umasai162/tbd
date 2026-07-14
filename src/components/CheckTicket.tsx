import React, { useState } from "react";
import { Search, Calendar, Users, XCircle, Printer, Download, ArrowRight, CheckCircle2 } from "lucide-react";
import { Booking } from "../types";

export default function CheckTicket() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/bookings?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this holy booking? Cancelled transactions are refunded within 3 working days.")) {
      return;
    }

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Booking cancelled successfully.");
        // Refresh search results
        handleSearch();
      } else {
        alert(data.error || "Cancellation failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling booking.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-sm traditional-glow text-stone-800">
      <div className="border-b border-[#e7e5e4] pb-4 mb-5">
        <span className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider font-cinzel">Verification center</span>
        <h2 className="text-xl font-cinzel font-bold text-stone-900 flex items-center gap-1.5">
          <Search className="w-5 h-5 text-[#b45309]" /> Verify, Print & Manage Tickets
        </h2>
        <p className="text-xs text-stone-600 mt-1">
          Enter your Aadhaar Number, Transaction ID, Pilgrim Name, or Booking Reference ID to download passes or request cancellations.
        </p>
      </div>

      {/* Search Input bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Aadhaar Number, Name, BK-9831A, TXN-..."
            className="w-full bg-orange-50/20 border border-stone-200 text-stone-900 text-xs rounded-xl p-3.5 pl-10 outline-none focus:ring-1 focus:ring-[#b45309] font-mono"
          />
          <Search className="w-4 h-4 text-[#b45309] absolute left-3 top-4" />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-[#b45309] hover:bg-[#78350f] text-white font-semibold px-6 py-3 rounded-xl text-xs transition-all flex items-center gap-1 shadow-md disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Searching..." : "Lookup"}
        </button>
      </form>

      {/* Results Rendering */}
      {searched && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
              <span className="animate-spin text-xl">☯</span>
              <span>Retrieving reservation details...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {results.map((booking) => {
                const isConfirmed = booking.status === "CONFIRMED";
                return (
                  <div key={booking.id} className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm relative bg-orange-50/10">
                    
                    {/* Top Status Header */}
                    <div className={`p-4 flex items-center justify-between text-xs border-b ${
                      isConfirmed ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
                    }`}>
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        {isConfirmed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                        {booking.status}
                      </span>
                      <span className="font-mono text-[10px] bg-white border px-2 py-0.5 rounded shadow-sm text-stone-800 font-bold">
                        {booking.type.toUpperCase()} VOUCHER
                      </span>
                    </div>

                    {/* Ticket Layout Core */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      {/* Left: Booking and Date */}
                      <div className="space-y-3 md:col-span-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Booking ID</span>
                            <p className="font-mono font-bold text-stone-900 text-sm mt-0.5">{booking.id}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Transaction Ref</span>
                            <p className="font-mono text-stone-900 text-xs mt-0.5">{booking.transactionId}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Created on</span>
                            <p className="text-stone-900 font-medium mt-0.5">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="border-t border-stone-100 pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#b45309]" />
                            <span>Visit Date: <strong className="font-mono text-stone-900">{booking.visitDate}</strong></span>
                          </div>
                          {booking.details.slot && (
                            <div className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded font-mono text-[10px] font-semibold text-stone-800">
                              Slot: {booking.details.slot}
                            </div>
                          )}
                        </div>

                        {/* Extra Details dynamic based on type */}
                        <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                          {booking.type === 'darshan' && (
                            <p className="text-stone-800 font-semibold">Darshan Entry: <strong className="text-[#b45309]">{booking.details.entryType}</strong></p>
                          )}
                          {booking.type === 'seva' && (
                            <p className="text-stone-800 font-semibold">Scheduled Seva: <strong className="text-[#b45309]">{booking.details.sevaName} ({booking.details.deity})</strong></p>
                          )}
                          {booking.type === 'accommodation' && (
                            <p className="text-stone-800 font-semibold">Lodging: <strong className="text-[#b45309]">{booking.details.guesthouseName} - {booking.details.roomType} ({booking.details.durationDays} Day)</strong></p>
                          )}
                          {booking.type === 'prasadam' && (
                            <div>
                              <p className="text-stone-800 font-bold uppercase tracking-wider text-[10px] mb-1.5">Ordered Prasadams:</p>
                              <div className="space-y-1 pl-1">
                                {booking.details.items?.map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between max-w-sm text-stone-900 font-medium font-mono text-[11px]">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>Rs.{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Pilgrims details list */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Registered Pilgrims ({booking.pilgrims.length})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {booking.pilgrims.map((pilgrim, idx) => (
                              <div key={idx} className="bg-white border border-stone-200 p-2 rounded-xl text-[11px] text-stone-900 font-medium">
                                <span className="font-bold">{pilgrim.name}</span> ({pilgrim.age} yrs, {pilgrim.gender})
                                <p className="text-[9px] text-[#b45309] font-mono mt-0.5">{pilgrim.idType}: {pilgrim.idNumber}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Graphic Barcode / Action buttons */}
                      <div className="flex flex-col items-center justify-center p-4 border-l border-stone-200 gap-4">
                        {/* Visual QR Code barcode */}
                        <div className="w-28 h-28 bg-white border border-stone-200 p-2.5 rounded-xl shadow-sm flex flex-col justify-center items-center">
                          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_4px)] opacity-95"></div>
                          <span className="font-mono text-[9px] text-stone-600 mt-1.5 font-bold tracking-widest">{booking.id}</span>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <button
                            onClick={() => window.print()}
                            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold py-2 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print Pass
                          </button>
                          {isConfirmed && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 font-semibold py-2 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel Pass
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50 text-stone-500 text-xs">
              No booking records matches the search query: <strong className="font-mono text-[#b45309]">"{query}"</strong>. 
              <p className="mt-1 text-[11px] text-stone-400">Please verify Aadhaar card number or Transaction ID and search again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
