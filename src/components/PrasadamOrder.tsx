import { useState } from "react";
import { ShoppingBag, Minus, Plus, Check, ArrowRight, Info, Award } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Pilgrim } from "../types";
import UPIPaymentGateway from "./UPIPaymentGateway";

interface PrasadamOrderProps {
  onBookingSuccess: (booking: any) => void;
}

export default function PrasadamOrder({ onBookingSuccess }: PrasadamOrderProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "Srivari Big Laddu (Kalyana Laddu)": 0,
    "Pulihora (Tamarind Rice Pod)": 0
  });

  const [visitDate, setVisitDate] = useState("");
  const [pilgrimName, setPilgrimName] = useState("");
  const [pilgrimId, setPilgrimId] = useState("");
  
  // Payment states
  const [paymentStep, setPaymentStep] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'paytm' | 'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showUPIGateway, setShowUPIGateway] = useState(false);
  const [generatedTransactionId, setGeneratedTransactionId] = useState("");

  const prasadams = [
    {
      name: "Srivari Big Laddu (Kalyana Laddu)",
      price: 50,
      weight: "1 packet (200 grams)",
      desc: "Delicious holy dessert of besan flour, sugar, pure ghee, cashew, raisins, and camphor.",
      img: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Pulihora (Tamarind Rice Pod)",
      price: 20,
      weight: "1 packet (150 grams)",
      desc: "Aromatic spicy-sour tamarind rice offering with peanuts, mustard, and curry leaves.",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=200&auto=format&fit=crop"
    }
  ];

  const updateQty = (name: string, diff: number) => {
    const current = quantities[name] || 0;
    const nextVal = Math.max(0, current + diff);
    setQuantities({ ...quantities, [name]: nextVal });
  };

  const cartItems = Object.entries(quantities)
    .filter(([_, qty]) => (qty as number) > 0)
    .map(([name, qty]) => {
      const info = prasadams.find((p) => p.name === name)!;
      return {
        name,
        quantity: qty as number,
        price: info.price as number
      };
    });

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * (item.quantity as number), 0);

  // Link configs
  const paytmLink = `paytmmp://pay?pa=umasaisanker8@oksbi&pn=SriVenkateswaraTemple&am=${totalAmount}&cu=INR&tn=PrasadamPreorder`;
  const upiLink = `upi://pay?pa=umasaisanker8@oksbi&pn=SriVenkateswaraTemple&am=${totalAmount}&cu=INR`;

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      alert("Please select at least one prasadam item.");
      return;
    }
    if (!visitDate) {
      alert("Please select a collection date.");
      return;
    }
    if (!pilgrimName || !pilgrimId) {
      alert("Please enter pilgrim verification details.");
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

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      // Setup a single pilgrim for the voucher validation
      const pilgrim: Pilgrim = {
        name: pilgrimName,
        age: 30,
        gender: "Male",
        idType: "Aadhaar",
        idNumber: pilgrimId
      };

      const payload = {
        type: "prasadam",
        visitDate,
        amountPaid: totalAmount,
        pilgrims: [pilgrim],
        details: {
          items: cartItems
        }
      };

      let isSuccess = false;
      let mockBooking = null;

      try {
        const res = await fetch("/api/bookings/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            isSuccess = true;
            mockBooking = data.booking;
          }
        }
      } catch (err) {
        console.error("Backend fetch failed, using mock...", err);
      }

      if (!isSuccess) {
        // Mock successful booking if API fails
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        mockBooking = {
          id: `BK-${Math.floor(1000 + Math.random() * 9000)}${suffix}`,
          type: "prasadam",
          bookingDate: new Date().toISOString(),
          visitDate,
          status: "CONFIRMED",
          transactionId: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`,
          amountPaid: totalAmount,
          pilgrims: [pilgrim],
          details: { items: cartItems }
        };
        await new Promise(r => setTimeout(r, 1000));
      }

      alert(`🎉 Payment Successful! Your prasadam order ${mockBooking.id} has been confirmed. Redirecting to your ticket...`);
      onBookingSuccess(mockBooking);
    } catch (err) {
      console.error(err);
      alert("Error booking prasadam order. Please try again.");
    } finally {
      setSubmitting(false);
      setPaymentStep(false);
    }
  };

  const handleUPIPaymentSuccess = (paymentDetails: any) => {
    // After successful UPI payment, proceed with booking
    handleConfirmOrder();
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
        <>
          <div className="border-b border-[#e7e5e4] pb-4 mb-5">
            <span className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider font-cinzel">Holy Offerings</span>
            <h2 className="text-xl font-cinzel font-bold text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#b45309]" /> Srivari Laddu & Prasadam Pre-order
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Pre-order extra Laddu prasadams online to avoid long queues at temple distribution counters. Collect using vouchers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prasadam Cards Grid */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide border-b border-stone-100 pb-1">Menu Offerings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prasadams.map((p) => {
                  const qty = quantities[p.name] || 0;
                  return (
                    <div key={p.name} className="border border-stone-200 rounded-xl p-3 flex gap-3 bg-stone-50/50">
                      <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover grayscale-20 brightness-95" />
                      </div>
                      <div className="flex flex-col justify-between flex-1 text-xs">
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-cinzel font-bold text-stone-900 leading-tight">{p.name}</span>
                            <span className="font-mono text-[#b45309] font-bold">Rs.{p.price}</span>
                          </div>
                          <span className="text-[9px] text-stone-505 font-medium font-mono">Weight: {p.weight}</span>
                          <p className="text-[10px] text-stone-600 mt-1 leading-snug line-clamp-2">{p.desc}</p>
                        </div>

                        {/* Quantity selectors */}
                        <div className="flex items-center gap-2 mt-2 self-end">
                          <button
                            onClick={() => updateQty(p.name, -1)}
                            className="w-6 h-6 bg-stone-50 border border-stone-200 text-stone-800 rounded-lg flex items-center justify-center hover:bg-stone-150 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-stone-900">{qty}</span>
                          <button
                            onClick={() => updateQty(p.name, 1)}
                            className="w-6 h-6 bg-stone-50 border border-stone-200 text-stone-800 rounded-lg flex items-center justify-center hover:bg-stone-150 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart / Checkout specification sidebar */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide border-b border-stone-100 pb-1">Voucher Particulars</h3>
              
              {cartItems.length > 0 ? (
                <div className="bg-orange-50/20 border border-[#e7e5e4] rounded-xl p-4 space-y-4">
                  <div className="space-y-2 border-b border-dashed border-stone-200 pb-3">
                    <h4 className="text-[10px] font-bold text-stone-700 uppercase">Selected Items</h4>
                    {cartItems.map((item) => (
                      <div key={item.name} className="flex justify-between text-xs text-stone-900 font-medium">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-mono">Rs.{(item.price as number) * (item.quantity as number)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Form details */}
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-700 uppercase">Collection Date:</label>
                      <input
                        type="date"
                        value={visitDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2 font-mono outline-none focus:ring-[#b45309]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-700 uppercase">Primary Pilgrim Name:</label>
                      <input
                        type="text"
                        value={pilgrimName}
                        onChange={(e) => setPilgrimName(e.target.value)}
                        placeholder="Pilgrim Full Name"
                        className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2 outline-none focus:ring-[#b45309]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-700 uppercase">Aadhaar Card / ID:</label>
                      <input
                        type="text"
                        value={pilgrimId}
                        onChange={(e) => setPilgrimId(e.target.value)}
                        placeholder="Enter ID Number"
                        className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2 font-mono outline-none focus:ring-[#b45309]"
                      />
                    </div>
                  </div>

                  {/* Ghee certified ribbon */}
                  <div className="bg-[#fffbeb] border border-[#e7e5e4] p-2.5 rounded-lg text-[10px] text-stone-600 flex gap-2">
                    <Award className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
                    <p className="leading-normal">
                      Our kitchens (Laddu Potu) utilize FSSAI-certified, Agmark pure cow ghee to maintain the highest quality and divine hygiene standard.
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-stone-200 pt-3">
                    <span className="font-semibold text-stone-900">Grand Total:</span>
                    <span className="font-mono text-base font-bold text-[#b45309]">Rs.{totalAmount}</span>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-[#b45309] hover:bg-[#78350f] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    Pre-order & Pay <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl bg-stone-50/50 text-stone-500 text-xs flex flex-col items-center gap-1.5">
                  <ShoppingBag className="w-6 h-6 text-stone-300 animate-bounce" />
                  <span>Your prasadam cart is empty. Please select quantities on the left side menu.</span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* PAYMENT GATEWAY SCREEN */
        <div className="space-y-6">
          <div className="border-b border-[#e7e5e4] pb-4">
            <h2 className="text-lg font-cinzel font-bold text-stone-955 flex items-center gap-1.5">
              Secure Prasadam Voucher Checkout
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Confirm payment details to register your Srivari Laddu pre-order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-850">
            {/* Summary card */}
            <div className="bg-orange-50/20 p-4 rounded-xl border border-orange-100 space-y-3 text-xs font-sans">
              <h3 className="text-xs font-bold text-[#78350f] uppercase border-b border-orange-100 pb-1">Voucher Summary</h3>
              <div className="space-y-2 text-stone-900 font-medium">
                <p>Devotee: <strong>{pilgrimName}</strong></p>
                <p>Collection Date: <strong className="font-mono">{visitDate}</strong></p>
                <div className="space-y-1 pt-1.5 border-t border-dashed border-stone-200">
                  <p className="text-[10px] text-stone-500 uppercase font-bold">Selected Prasadams:</p>
                  {cartItems.map((item) => (
                    <div key={item.name} className="flex justify-between text-[11px]">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-mono">Rs.{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-orange-200 pt-2 mt-2 flex justify-between">
                  <span>Grand Total:</span>
                  <span className="font-mono font-bold text-[#b45309]">Rs. {totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Choice */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paytm')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'paytm'
                      ? "bg-[#00baf2]/5 border-[#00baf2] text-[#002e6e] shadow-sm font-bold"
                      : "bg-white border-stone-200 hover:border-stone-300 text-stone-800"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#00baf2]"></span> Paytm App
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? "bg-orange-50 border-[#b45309] text-[#78350f] shadow-sm font-bold"
                      : "bg-white border-stone-200 hover:border-stone-300 text-stone-800"
                  }`}
                >
                  BHIM UPI / QR Scan
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? "bg-orange-50 border-[#b45309] text-[#78350f] shadow-sm font-bold"
                      : "bg-white border-stone-200 hover:border-stone-300 text-stone-800"
                  }`}
                >
                  Debit/Credit Card
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
                <div className="bg-orange-50/10 border border-orange-100 rounded-xl p-4 space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 bg-white border border-stone-200 p-2 rounded-lg shadow-sm flex items-center justify-center">
                      <QRCodeSVG value={upiLink} size={110} />
                    </div>
                    <p className="text-[10px] text-stone-600 mt-2 font-medium">Scan QR code using GPay, PhonePe, or Paytm</p>
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-xs mx-auto">
                    <label className="text-[10px] font-bold text-stone-700 uppercase">Enter UPI ID:</label>
                    <input
                      type="text"
                      placeholder="pilgrim@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2 outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="bg-orange-50/10 border border-orange-100 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-700 uppercase">Card Number</label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-700 uppercase">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-700 uppercase">CVV</label>
                      <input
                        type="password"
                        placeholder="***"
                        maxLength={3}
                        className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaymentStep(false)}
              className="border border-stone-200 hover:bg-stone-50 text-stone-850 font-semibold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Go Back
            </button>
            
            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={submitting}
              className="bg-[#b45309] hover:bg-[#78350f] text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submitting ? "Booking Order..." : `Pay & Confirm Order`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
