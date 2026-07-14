import React, { useState } from "react";
import { HeartHandshake, Check, Shield, FileText, Printer, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Donation } from "../types";

export default function DonationSection() {
  const [amount, setAmount] = useState<string>("1000");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [scheme, setScheme] = useState("Annadanam Trust (Free Sacred Meals)");

  const [submitting, setSubmitting] = useState(false);
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);

  // Paytm & UPI integration state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paytm' | 'upi' | 'card'>('paytm');
  const [upiId, setUpiId] = useState("");

  const schemes = [
    {
      name: "Annadanam Trust (Free Sacred Meals)",
      desc: "Supports serving free, unlimited hygienic sacred meals to over 100,000 visiting pilgrims every single day.",
      exemption: "Eligible for 50% Tax Exemption under Sec 80G."
    },
    {
      name: "Pranadanam Trust (Healthcare & Hospitals)",
      desc: "Sponsors free advanced surgeries, dialysis, cancer treatments, and ICU care for impoverished patients at Devasthanam hospitals.",
      exemption: "Eligible for 50% Tax Exemption under Sec 80G."
    },
    {
      name: "Gosamrakshana Trust (Holy Cow Welfare)",
      desc: "Funds the shelter, green fodder, veterinary care, and protection of over 4,000 cows in Devasthanam-run Gosalas.",
      exemption: "Eligible for 50% Tax Exemption under Sec 80G."
    },
    {
      name: "General Temple E-Hundi",
      desc: "Direct anonymous or acknowledged contributions to the general temple gold plating, renovation, and operational funds.",
      exemption: "Non-Exempt."
    }
  ];

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !email || !amount) {
      alert("Please fill in your name, email and the donation amount.");
      return;
    }
    const amtVal = parseFloat(amount);
    if (isNaN(amtVal) || amtVal <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }
    setShowPayment(true);
  };

  const handleDonate = async () => {
    const amtVal = parseFloat(amount);
    setSubmitting(true);
    try {
      const payload = {
        donorName,
        email,
        phone,
        panNumber,
        amount: amtVal,
        scheme
      };

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setCompletedDonation(data.donation);
        // Clear inputs
        setAmount("1000");
        setDonorName("");
        setEmail("");
        setPhone("");
        setPanNumber("");
        setShowPayment(false);
      } else {
        alert(data.error || "Donation failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting donation.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentSchemeInfo = schemes.find((s) => s.name === scheme) || schemes[0];
  const amtVal = parseFloat(amount) || 0;
  
  // Custom Paytm Deep Link
  const paytmLink = `paytmmp://pay?pa=temple@ybl&pn=SriVenkateswaraTemple&am=${amtVal}&cu=INR&tn=Donation`;
  // Generic BHIM UPI link
  const upiLink = `upi://pay?pa=temple@ybl&pn=SriVenkateswaraTemple&am=${amtVal}&cu=INR`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-sm traditional-glow text-stone-800">
      {!completedDonation ? (
        <div className="space-y-6">
          <div className="border-b border-[#e7e5e4] pb-4">
            <span className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider font-cinzel">E-Hundi & Seva Trusts</span>
            <h2 className="text-xl font-cinzel font-bold text-stone-900 flex items-center gap-1.5">
              <HeartHandshake className="w-5 h-5 text-[#b45309] animate-pulse" /> E-Donation & Trust Sponsoring
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Offer your financial contributions digitally. Your donations help fund sacred services, free public distribution of meals, cows welfare, and hospitals.
            </p>
          </div>

          {!showPayment ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <form onSubmit={handleProceedToPayment} className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-700 uppercase">1. Sponsoring Scheme / Trust</label>
                    <select
                      value={scheme}
                      onChange={(e) => setScheme(e.target.value)}
                      className="bg-orange-50/20 border border-stone-200 text-stone-900 text-xs rounded-xl p-3 outline-none focus:ring-[#b45309] focus:border-[#b45309]"
                    >
                      {schemes.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-700 uppercase">2. Donation Amount (Rs)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter Custom Amount"
                      className="bg-orange-50/20 border border-stone-200 text-stone-900 text-xs rounded-xl p-3 outline-none font-mono focus:ring-[#b45309] focus:border-[#b45309] font-bold"
                    />
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-2">
                  {["500", "1000", "5000", "10000", "25000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        amount === preset
                          ? "bg-[#b45309] border-[#b45309] text-white shadow-sm"
                          : "bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-800"
                      }`}
                    >
                      Rs. {preset}
                    </button>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-4">
                  <label className="block text-[10px] font-bold text-stone-700 uppercase mb-2">3. Donor Personal Particulars</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Donor Full Name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none focus:ring-[#b45309]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono focus:ring-[#b45309]"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Number (Optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono focus:ring-[#b45309]"
                    />
                    <input
                      type="text"
                      placeholder="PAN Card Number (for Tax Claim)"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value)}
                      className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono uppercase focus:ring-[#b45309]"
                    />
                  </div>
                </div>

                {/* Secure payment callout */}
                <div className="bg-stone-50 p-3 rounded-lg flex items-start gap-2 border border-stone-200">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-stone-600 leading-relaxed">
                    All transactions are 100% secure. Devasthanam Board is a registered charitable religious trust. Sponsoring certificates are sent instantly to registered emails.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#b45309] hover:bg-[#78350f] text-white font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    Proceed to Payment Gate <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Scheme Description Sideboard */}
              <div className="bg-orange-50/20 rounded-xl p-5 border border-[#e7e5e4] flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-cinzel text-xs font-bold text-[#78350f] border-b border-[#e7e5e4] pb-1.5 uppercase">Scheme Specifications</h3>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-stone-900">{currentSchemeInfo.name}</span>
                    <p className="text-[11px] text-stone-600 leading-relaxed pt-1">{currentSchemeInfo.desc}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e7e5e4] bg-[#fffbeb] p-3 rounded-lg text-center border">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wide block mb-0.5">Tax Exemption Status</span>
                  <span className="text-xs font-semibold text-emerald-700 font-cinzel">{currentSchemeInfo.exemption}</span>
                </div>
              </div>
            </div>
          ) : (
            /* PAYMENT OPTIONS STEP */
            <div className="space-y-6">
              <div className="bg-orange-50/10 p-4 border border-orange-100 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-stone-900 block">Sponsorship: {scheme}</span>
                  <span className="text-stone-600 font-medium">Donor: {donorName} ({email})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 uppercase block font-bold">Total Amount</span>
                  <span className="text-lg font-mono font-bold text-[#b45309]">Rs. {amount}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Method selector */}
                <div className="flex flex-col gap-2 md:col-span-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase mb-1">Choose Payment Method</span>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paytm')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'paytm'
                        ? "bg-[#00baf2]/5 border-[#00baf2] text-[#002e6e] ring-2 ring-[#00baf2]/20 font-bold"
                        : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <span className="text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00baf2]" /> Paytm App Direct
                    </span>
                    <span className="text-[9px] bg-[#00baf2] text-white px-1.5 py-0.5 rounded font-mono font-bold">Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? "bg-orange-50 border-[#b45309] text-[#78350f] ring-2 ring-[#b45309]/10 font-bold"
                        : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <span className="text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#b45309]" /> BHIM UPI QR Code
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? "bg-stone-50 border-stone-800 text-stone-900 ring-2 ring-stone-900/10 font-bold"
                        : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <span className="text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-700" /> Credit / Debit Card
                    </span>
                  </button>
                </div>

                {/* Method Panel details */}
                <div className="md:col-span-2 bg-stone-50/55 border border-stone-200/60 rounded-2xl p-5">
                  {paymentMethod === 'paytm' && (
                    <div className="space-y-4 text-center">
                      <div className="max-w-xs mx-auto space-y-3 bg-white p-4 border border-stone-200 rounded-xl shadow-sm">
                        <span className="text-[10px] font-bold text-[#002e6e] uppercase tracking-wider block">Paytm Merchant Checkout</span>
                        <div className="w-32 h-32 mx-auto border border-[#00baf2] rounded-lg p-2 flex items-center justify-center relative bg-[#00baf2]/5">
                          <QRCodeSVG value={paytmLink} size={110} />
                        </div>
                        <p className="text-[10px] text-stone-600">Scan using <strong>Paytm App</strong> on your phone</p>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        {/* Direct Mobile Deep Link Button */}
                        <a 
                          href={paytmLink}
                          className="w-full max-w-xs py-3 px-6 rounded-xl bg-gradient-to-r from-[#00baf2] to-[#002e6e] text-white font-bold text-xs shadow-md transition-all text-center hover:shadow-lg hover:scale-[1.01] block"
                        >
                          Pay Directly via Paytm App
                        </a>
                        <span className="text-[9px] text-stone-400 font-medium">Click above to open Paytm app directly if on mobile</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 text-center">
                      <div className="max-w-xs mx-auto space-y-3 bg-white p-4 border border-stone-200 rounded-xl shadow-sm">
                        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Scan via any UPI App</span>
                        <div className="w-32 h-32 mx-auto border border-stone-200 rounded-lg p-2 flex items-center justify-center">
                          <QRCodeSVG value={upiLink} size={110} />
                        </div>
                        <p className="text-[10px] text-stone-600">Supports GPay, PhonePe, Paytm, or BHIM</p>
                      </div>

                      <div className="flex flex-col gap-2 max-w-xs mx-auto text-left">
                        <label className="text-[9px] font-bold text-stone-700 uppercase">Enter UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="devotee@upi"
                          className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono focus:ring-[#b45309]"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3 max-w-md mx-auto">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-stone-700 uppercase">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-stone-700 uppercase">Expiration</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="bg-white border border-stone-200 text-stone-900 text-xs rounded-lg p-2.5 outline-none font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-stone-700 uppercase">CVV</label>
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

              {/* Action buttons */}
              <div className="border-t border-stone-200 pt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer border border-stone-200"
                >
                  Back to Details
                </button>
                
                <button
                  type="button"
                  onClick={handleDonate}
                  disabled={submitting}
                  className="bg-[#b45309] hover:bg-[#78350f] text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  {submitting ? "Securing Donation..." : "Confirm & Complete Donation"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
            <Check className="w-5 h-5 bg-emerald-505 text-emerald-500 rounded-full" />
            <div>
              <p className="font-semibold">Sponsorship Successfully Received!</p>
              <p className="text-[11px]">Thank you for your generous contribution. A receipt has been generated below.</p>
            </div>
          </div>

          {/* Certificate Print Area */}
          <div id="print-receipt" className="border-4 border-double border-[#b45309] p-8 rounded-2xl bg-orange-50/10 text-center space-y-6 relative max-w-2xl mx-auto traditional-glow">
            {/* Watermark/Border accents */}
            <div className="absolute inset-2 border border-stone-200 pointer-events-none rounded-xl"></div>
            <div className="text-3xl text-orange-200 opacity-25 absolute inset-0 flex items-center justify-center select-none font-bold">ॐ</div>

            <div className="space-y-1 relative">
              <h1 className="font-cinzel text-base font-extrabold text-[#78350f] tracking-wide">
                SRI VENKATESWARA TRUST BOARD
              </h1>
              <p className="text-[9px] tracking-widest text-[#b45309] font-bold uppercase">
                Holy Devasthanams Administration
              </p>
            </div>

            <div className="w-16 h-0.5 bg-[#b45309] mx-auto"></div>

            <div className="space-y-4">
              <h2 className="font-cinzel text-lg font-bold text-stone-900 tracking-wide italic">
                Donation Acknowledgement
              </h2>

              <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
                With divine grace, the Board gratefully acknowledges the generous contribution of 
                <strong className="text-stone-900 block text-sm font-semibold my-1 font-cinzel">{completedDonation.donorName}</strong> 
                sponsoring the sum of 
                <strong className="text-[#b45309] block text-lg font-mono font-bold my-1">Rs. {completedDonation.amount}</strong> 
                allocated towards the noble activities of the 
                <strong className="text-stone-900 block text-xs font-semibold my-1">{completedDonation.scheme}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] text-stone-500 border-t border-dashed border-stone-200 pt-4 max-w-md mx-auto font-mono">
              <div className="text-left">
                <p>Receipt ID: <strong className="text-stone-900 font-bold">{completedDonation.id}</strong></p>
                <p>Txn Ref: <strong className="text-stone-900">{completedDonation.transactionId}</strong></p>
              </div>
              <div className="text-right">
                <p>Date: <strong>{new Date(completedDonation.date).toLocaleDateString()}</strong></p>
                {completedDonation.panNumber && <p>PAN Number: <strong>{completedDonation.panNumber}</strong></p>}
              </div>
            </div>

            <div className="pt-4 flex justify-between items-end max-w-md mx-auto">
              <div className="text-left">
                <p className="text-[8px] text-stone-400 uppercase font-mono">Verified Stamp</p>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                  <Shield className="w-3 h-3" /> OFFICIAL SECURE
                </span>
              </div>
              <div className="text-right">
                <div className="border-b border-stone-300 w-24 mb-1"></div>
                <p className="text-[8px] text-stone-500 uppercase tracking-widest font-bold">Executive Officer</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setCompletedDonation(null)}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-2 px-5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Make Another Donation
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#b45309] hover:bg-[#78350f] text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Certificate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
