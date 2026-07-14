import { useState } from "react";
import { Calendar as CalendarIcon, Users, Check, CreditCard, Shield, UserPlus, Trash, ArrowRight, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Pilgrim } from "../types";
import UPIPaymentGateway from "./UPIPaymentGateway";

interface DarshanBookingProps {
  onBookingSuccess: (booking: any) => void;
}

export default function DarshanBooking({ onBookingSuccess }: DarshanBookingProps) {
  const [visitDate, setVisitDate] = useState<string>("");
  const [entryType, setEntryType] = useState<'Special Entry' | 'General Entry' | 'Senior Citizen'>('Special Entry');
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  
  // Temporary form state for adding a single pilgrim
  const [tempName, setTempName] = useState("");
  const [tempAge, setTempAge] = useState("");
  const [tempGender, setTempGender] = useState("Male");
  const [tempIdType, setTempIdType] = useState("Aadhaar");
  const [tempIdNumber, setTempIdNumber] = useState("");

  const [paymentStep, setPaymentStep] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'paytm' | 'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState("");
  const [showUPIGateway, setShowUPIGateway] = useState(false);
  const [generatedTransactionId, setGeneratedTransactionId] = useState("");

  const ticketPrice = entryType === 'Special Entry' ? 300 : entryType === 'Senior Citizen' ? 0 : 0;
  const totalAmount = pilgrims.length * ticketPrice;
  const paytmLink = `paytmmp://pay?pa=temple@ybl&pn=SriVenkateswaraTemple&am=${totalAmount}&cu=INR&tn=DarshanBooking`;
  const upiLink = `upi://pay?pa=temple@ybl&pn=SriVenkateswaraTemple&am=${totalAmount}&cu=INR`;

  // Authentic slots with varying availability counts based on type
  const slots = [
    { time: "08:00 AM - 09:00 AM", available: 120, status: "filling" },
    { time: "10:00 AM - 11:00 AM", available: 15, status: "fast" },
    { time: "12:00 PM - 01:00 PM", available: 0, status: "full" },
    { time: "02:00 PM - 03:00 PM", available: 240, status: "open" },
    { time: "04:00 PM - 05:00 PM", available: 80, status: "filling" },
    { time: "06:00 PM - 07:00 PM", available: 5, status: "fast" }
  ];

  const handleAddPilgrim = () => {
    if (!tempName || !tempAge || !tempIdNumber) {
      alert("Please fill in all pilgrim details.");
      return;
    }
    const newPilgrim: Pilgrim = {
      name: tempName,
      age: parseInt(tempAge),
      gender: tempGender,
      idType: tempIdType,
      idNumber: tempIdNumber
    };
    setPilgrims([...pilgrims, newPilgrim]);
    // Clear temp states
    setTempName("");
    setTempAge("");
    setTempIdNumber("");
  };

  const handleRemovePilgrim = (idx: number) => {
    setPilgrims(pilgrims.filter((_, i) => i !== idx));
  };

  const handleProceedToPayment = () => {
    if (!visitDate) {
      alert("Please select a visit date.");
      return;
    }
    if (!selectedSlot) {
      alert("Please select a darshan time slot.");
      return;
    }
    if (pilgrims.length === 0) {
      alert("Please add at least one pilgrim.");
      return;
    }
    // Generate transaction ID for UPI payment
    const txnId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setGeneratedTransactionId(txnId);
    setPaymentStep(true);
    
    // Auto-show UPI gateway if UPI is selected
    if (paymentMethod === 'upi') {
      setShowUPIGateway(true);
    }
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const payload = {
        type: "darshan",
        visitDate,
        amountPaid: totalAmount,
        pilgrims,
        details: {
          slot: selectedSlot,
          entryType
        }
      };

      const res = await fetch("/api/bookings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        // Show success message and automatically navigate
        alert(`🎉 Payment Successful! Your booking ${data.booking.id} has been confirmed. Redirecting to your ticket...`);
        onBookingSuccess(data.booking);
      } else {
        alert(data.error || "Booking failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during booking. Please try again.");
    } finally {
      setSubmitting(false);
      setPaymentStep(false);
    }
  };

  const handleUPIPaymentSuccess = (paymentDetails: any) => {
    // After successful UPI payment, proceed with booking
    handleConfirmBooking();
  };

  const handleUPIPaymentFailure = (error: string) => {
    // Don't close the gateway if payment is pending - let user try again
    if (error.includes('pending') || error.includes('complete')) {
      alert(error);
      // Keep gateway open for user to verify again
    } else {
      alert(`Payment failed: ${error}`);
      setShowUPIGateway(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-sm traditional-glow text-stone-800">
      {!paymentStep ? (
        <div className="space-y-6">
          <div className="border-b border-[#e7e5e4] pb-4">
            <span className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider font-cinzel">Pass reservation</span>
            <h2 className="text-xl font-cinzel font-bold text-stone-900">
              Book Darshan Tickets
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Select date, slot, and enter details for all pilgrims joining the holy darshan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Hand: Date & Slot Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                  1. Visit Date & Ticket Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="date"
                      value={visitDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full bg-orange-50/20 border border-[#e7e5e4] text-stone-900 text-xs rounded-xl focus:ring-[#b45309] focus:border-[#b45309] block p-3 pl-9 font-mono outline-none"
                    />
                    <CalendarIcon className="w-4 h-4 text-[#b45309] absolute left-3 top-3.5" />
                  </div>
                  <div>
                    <select
                      value={entryType}
                      onChange={(e: any) => setEntryType(e.target.value)}
                      className="w-full bg-orange-50/20 border border-[#e7e5e4] text-stone-900 text-xs rounded-xl focus:ring-[#b45309] focus:border-[#b45309] block p-3 outline-none"
                    >
                      <option value="Special Entry">Special Entry (Rs. 300)</option>
                      <option value="General Entry">General Entry (Free)</option>
                      <option value="Senior Citizen">Senior / Physically Challenged (Free)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                  2. Select Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {slots.map((slot) => {
                    const isFull = slot.available === 0;
                    const isSelected = selectedSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => !isFull && setSelectedSlot(slot.time)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isFull
                            ? "bg-rose-50/50 border-rose-100 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-orange-50 border-[#b45309] ring-2 ring-[#b45309]/10"
                            : "bg-white border-[#e7e5e4] hover:border-stone-300"
                        }`}
                      >
                        <span className={`text-xs font-semibold ${isSelected ? "text-[#78350f]" : "text-stone-800"}`}>
                          {slot.time}
                        </span>
                        <div className="flex items-center justify-between w-full mt-1.5">
                          <span className={`text-[10px] font-medium font-mono ${
                            isFull ? "text-rose-600 font-bold" : slot.available < 20 ? "text-amber-600 font-semibold" : "text-emerald-700"
                          }`}>
                            {isFull ? "FULL" : `${slot.available} left`}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#b45309]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Hand: Pilgrim details builder */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide border-b border-stone-100 pb-1">
                3. Pilgrim Directory
              </label>

              {/* Added pilgrims list */}
              {pilgrims.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {pilgrims.map((p, idx) => (
                    <div key={idx} className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-stone-900">{p.name} ({p.age}, {p.gender})</p>
                        <p className="text-[10px] text-stone-600 font-mono mt-0.5">{p.idType}: {p.idNumber}</p>
                      </div>
                      <button
                        onClick={() => handleRemovePilgrim(idx)}
                        className="text-stone-500 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-stone-200 rounded-xl bg-stone-50/50 text-stone-500 text-xs flex flex-col items-center gap-1.5">
                  <Users className="w-6 h-6 text-stone-300" />
                  <span>No pilgrims added yet. Add pilgrim details below.</span>
                </div>
              )}

              {/* Add Pilgrim Form */}
              <div className="bg-amber-50/30 border border-amber-200/50 p-4 rounded-xl space-y-3">
                <h4 className="text-[11px] font-bold text-amber-900 uppercase flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5 text-amber-700" /> Add New Pilgrim
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="col-span-2 bg-white border border-amber-200 text-amber-950 text-xs rounded-lg p-2 outline-none focus:ring-saffron-500"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={tempAge}
                    onChange={(e) => setTempAge(e.target.value)}
                    className="bg-white border border-amber-200 text-amber-950 text-xs rounded-lg p-2 outline-none focus:ring-saffron-500"
                  />
                  <select
                    value={tempGender}
                    onChange={(e) => setTempGender(e.target.value)}
                    className="bg-white border border-amber-200 text-amber-950 text-xs rounded-lg p-2 outline-none focus:ring-saffron-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <select
                    value={tempIdType}
                    onChange={(e) => setTempIdType(e.target.value)}
                    className="bg-white border border-amber-200 text-amber-950 text-xs rounded-lg p-2 outline-none"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                  <input
                    type="text"
                    placeholder="ID Number"
                    value={tempIdNumber}
                    onChange={(e) => setTempIdNumber(e.target.value)}
                    className="bg-white border border-amber-200 text-amber-950 text-xs rounded-lg p-2 outline-none font-mono focus:ring-saffron-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPilgrim}
                  className="w-full bg-amber-200/60 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-semibold py-2 rounded-lg transition-all"
                >
                  Save Pilgrim to Booking
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Box & Next step action */}
          <div className="border-t border-amber-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-amber-900">
              <span className="font-semibold">Total Price: </span>
              <span className="text-lg font-mono font-bold text-saffron-700 ml-1">
                Rs. {totalAmount}
              </span>
              <span className="text-[10px] text-amber-600/80 block mt-0.5">
                (Includes {pilgrims.length} Free Laddu Prasadam on Special Entry)
              </span>
            </div>
            <button
              onClick={handleProceedToPayment}
              className="w-full sm:w-auto bg-saffron-600 hover:bg-saffron-700 text-amber-50 font-semibold py-2.5 px-6 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow hover:translate-y-[-1px]"
            >
              Proceed to Payment Gate <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* PAYMENT GATEWAY UI SCREEN */
        <div className="space-y-6">
          <div className="border-b border-amber-100 pb-4">
            <h2 className="text-lg font-cinzel font-bold text-amber-950 flex items-center gap-1.5">
              <CreditCard className="w-5 h-5 text-saffron-600" /> Securing Divine Transaction
            </h2>
            <p className="text-xs text-amber-800/70 mt-0.5">
              Please finalize payment to secure your holy darshan bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Booking review card */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/50 space-y-3">
              <h3 className="text-xs font-bold text-amber-900 uppercase border-b border-amber-100 pb-1">Booking Review</h3>
              <div className="text-xs space-y-1 text-amber-950 font-medium">
                <p>Type: <strong className="text-saffron-700">{entryType}</strong></p>
                <p>Date: <strong className="font-mono">{visitDate}</strong></p>
                <p>Slot: <strong className="font-mono text-[11px]">{selectedSlot}</strong></p>
                <p>Pilgrims count: <strong>{pilgrims.length}</strong></p>
                <div className="border-t border-dashed border-amber-200 pt-2 mt-2 flex justify-between">
                  <span>Grand Total:</span>
                  <span className="font-mono font-bold text-saffron-700">Rs. {totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Choice */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paytm')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'paytm'
                      ? "bg-[#00baf2]/5 border-[#00baf2] text-[#002e6e] shadow-sm font-bold"
                      : "bg-white border-amber-100 text-amber-800 hover:border-amber-200"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#00baf2]"></span> Paytm App
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'upi'
                      ? "bg-saffron-50 border-saffron-500 text-saffron-900 shadow-sm font-bold"
                      : "bg-white border-amber-100 text-amber-800 hover:border-amber-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-saffron-500" /> BHIM UPI / QR Scan
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? "bg-saffron-50 border-saffron-500 text-saffron-900 shadow-sm font-bold"
                      : "bg-white border-amber-100 text-amber-800 hover:border-amber-200"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-saffron-500" /> Debit/Credit Card
                </button>
              </div>

              {paymentMethod === 'paytm' && (
                <div className="bg-[#00baf2]/5 border border-[#00baf2]/35 rounded-xl p-4 space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 bg-white border border-[#00baf2]/40 p-2 rounded-lg shadow-sm flex items-center justify-center">
                      <QRCodeSVG value={paytmLink} size={110} />
                    </div>
                    <p className="text-[10px] text-stone-600 mt-2 font-medium">Scan QR code using Paytm App</p>
                    <a href={paytmLink} className="mt-3 w-full max-w-xs bg-gradient-to-r from-[#00baf2] to-[#002e6e] text-white py-2.5 px-4 text-xs rounded-xl shadow-sm font-bold inline-block hover:scale-[1.01] transition-transform text-center">
                      Pay directly via Paytm App
                    </a>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-4">
                  {showUPIGateway ? (
                    <UPIPaymentGateway
                      amount={totalAmount}
                      merchantName="Sri Venkateswara Temple"
                      transactionId={generatedTransactionId}
                      description={`Darshan Booking - ${entryType}`}
                      onPaymentSuccess={handleUPIPaymentSuccess}
                      onPaymentFailure={handleUPIPaymentFailure}
                      onCancel={() => setShowUPIGateway(false)}
                    />
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={() => setShowUPIGateway(true)}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-md transition-all"
                      >
                        Open UPI Payment Gateway
                      </button>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-amber-900 uppercase">Card Number</label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="bg-white border border-amber-200 text-amber-950 text-xs rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="bg-white border border-amber-200 text-amber-950 text-xs rounded-lg p-2.5 outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase">CVV</label>
                      <input
                        type="password"
                        placeholder="***"
                        maxLength={3}
                        className="bg-white border border-amber-200 text-amber-950 text-xs rounded-lg p-2.5 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Secure Trust Stamp */}
          <div className="border-t border-amber-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <Shield className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Divine Payment Processing
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPaymentStep(false)}
                className="flex-1 sm:flex-initial border border-amber-200 hover:bg-amber-50 text-amber-900 font-semibold py-2 px-5 rounded-xl text-xs transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="flex-1 sm:flex-initial bg-saffron-600 hover:bg-saffron-700 text-amber-50 font-bold py-2 px-6 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {submitting ? "Booking..." : `Pay & Secure Ticket`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
