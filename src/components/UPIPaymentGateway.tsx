import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, XCircle, Clock, Smartphone, AlertCircle, Loader2 } from "lucide-react";

interface UPIPaymentGatewayProps {
  amount: number;
  merchantName: string;
  transactionId: string;
  description: string;
  onPaymentSuccess: (paymentDetails: any) => void;
  onPaymentFailure: (error: string) => void;
  onCancel: () => void;
}

export default function UPIPaymentGateway({
  amount,
  merchantName,
  transactionId,
  description,
  onPaymentSuccess,
  onPaymentFailure,
  onCancel
}: UPIPaymentGatewayProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [showManualEntry, setShowManualEntry] = useState(false);

  // UPI Apps configuration
  const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: '🟢', color: 'bg-green-50 border-green-200' },
    { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50 border-purple-200' },
    { id: 'paytm', name: 'Paytm', color: 'bg-blue-50 border-blue-200' },
    { id: 'bhim', name: 'BHIM UPI', color: 'bg-orange-50 border-orange-200' }
  ];

  // Generate UPI deep link
  const generateUPILink = (appId?: string) => {
    const pa = 'temple@ybl'; // Merchant UPI ID
    const pn = merchantName;
    const am = amount;
    const cu = 'INR';
    const tn = description;
    const tr = transactionId;
    
    const baseUrl = appId === 'gpay' ? 'tez://upi/pay' : 
                   appId === 'phonepe' ? 'phonepe://upi/pay' :
                   appId === 'paytm' ? 'paytmmp://pay' :
                   appId === 'bhim' ? 'bhim://upi/pay' : 'upi://pay';
    
    return `${baseUrl}?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}&tr=${tr}`;
  };

  // Generate QR code value
  const qrCodeValue = `upi://pay?pa=temple@ybl&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}&tr=${transactionId}`;

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setPaymentStatus('failed');
      onPaymentFailure('Payment timeout');
    }
  }, [countdown, paymentStatus]);

  // Real payment verification with backend API
  const verifyPayment = async () => {
    setPaymentStatus('processing');
    
    try {
      // Call backend to verify payment
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          amount,
          method: 'UPI'
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.status === 'SUCCESS') {
        setPaymentStatus('success');
        onPaymentSuccess({
          transactionId,
          amount,
          timestamp: new Date().toISOString(),
          method: 'UPI',
          status: 'SUCCESS'
        });
      } else if (data.status === 'PENDING') {
        // Payment is still pending, keep processing status
        setPaymentStatus('processing');
        onPaymentFailure(data.message || 'Payment is pending. Please complete payment and verify again.');
      } else {
        setPaymentStatus('failed');
        onPaymentFailure(data.message || 'Payment verification failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      onPaymentFailure('Payment verification failed. Please try again.');
    }
  };

  const handleAppSelection = (appId: 'gpay' | 'phonepe' | 'paytm' | 'bhim') => {
    setSelectedApp(appId);
    const upiLink = generateUPILink(appId);
    window.location.href = upiLink;
    
    // Start payment verification after redirect
    setTimeout(() => {
      verifyPayment();
    }, 5000);
  };

  const handleManualPayment = () => {
    if (!upiId || !upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g., user@upi)');
      return;
    }
    
    // For manual UPI payment, we need to wait for actual payment
    // Show instructions and then verify payment
    alert(`Please complete the payment of ₹${amount} to temple@ybl using your UPI app. After payment, click "I have completed payment" to verify.`);
    
    setPaymentStatus('processing');
    // Don't auto-approve - wait for user to confirm payment
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (paymentStatus === 'success') {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Payment Successful!</h3>
        <p className="text-emerald-700 text-sm mb-4">Your payment of ₹{amount} has been processed successfully.</p>
        <div className="bg-white rounded-lg p-3 text-xs text-emerald-800 font-mono">
          Transaction ID: {transactionId}
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-12 h-12 text-rose-600" />
        </div>
        <h3 className="text-xl font-bold text-rose-900 mb-2">Payment Failed</h3>
        <p className="text-rose-700 text-sm mb-4">The payment could not be completed. Please try again.</p>
        <button
          onClick={() => {
            setPaymentStatus('pending');
            setCountdown(300);
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-6 rounded-lg text-sm"
        >
          Try Again
        </button>
        <button
          onClick={onCancel}
          className="ml-2 border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold py-2 px-6 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-blue-900 mb-2">Processing Payment</h3>
        <p className="text-blue-700 text-sm">Please wait while we verify your payment...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Smartphone className="w-5 h-5 text-[#b45309]" />
          <h3 className="text-lg font-bold text-stone-900">UPI Payment Gateway</h3>
        </div>
        <p className="text-sm text-stone-600">Pay securely using any UPI app</p>
      </div>

      {/* Amount Display */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 text-center border border-amber-200">
        <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">Amount to Pay</p>
        <p className="text-3xl font-bold text-[#b45309] font-mono">₹{amount}</p>
        <p className="text-xs text-amber-600 mt-1">{description}</p>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 mb-6 text-sm">
        <Clock className="w-4 h-4 text-amber-600" />
        <span className="text-amber-700 font-medium">Expires in: {formatTime(countdown)}</span>
      </div>

      {/* QR Code Section */}
      <div className="bg-stone-50 rounded-xl p-6 mb-6 text-center border border-stone-200">
        <p className="text-xs font-semibold text-stone-700 uppercase mb-3">Scan QR Code</p>
        <div className="w-48 h-48 bg-white border-2 border-stone-200 rounded-lg p-3 mx-auto flex items-center justify-center shadow-sm">
          <QRCodeSVG value={qrCodeValue} size={170} />
        </div>
        <p className="text-xs text-stone-600 mt-3">Scan using any UPI app (GPay, PhonePe, Paytm, BHIM)</p>
      </div>

      {/* Quick App Selection */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-stone-700 uppercase mb-3">Or Pay Directly</p>
        <div className="grid grid-cols-2 gap-3">
          {upiApps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppSelection(app.id as any)}
              className={`${app.color} border-2 rounded-xl p-4 text-center hover:shadow-md transition-all active:scale-95`}
            >
              <div className="text-2xl mb-1">{app.icon}</div>
              <p className="text-xs font-semibold text-stone-800">{app.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Manual UPI ID Entry */}
      <div className="border-t border-stone-200 pt-4">
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="w-full flex items-center justify-center gap-2 text-sm text-[#b45309] font-semibold hover:text-[#78350f] transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
          {showManualEntry ? 'Hide Manual Entry' : 'Enter UPI ID Manually'}
        </button>
        
        {showManualEntry && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1.5">
                Enter UPI ID
              </label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-white border border-stone-300 text-stone-900 text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#b45309] focus:border-transparent font-mono"
              />
            </div>
            <button
              onClick={handleManualPayment}
              className="w-full bg-[#b45309] hover:bg-[#78350f] text-white font-semibold py-3 rounded-lg text-sm transition-colors"
            >
              Pay ₹{amount} via UPI
            </button>
            {paymentStatus === 'processing' && (
              <button
                onClick={verifyPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2"
              >
                I have completed payment - Verify
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        className="w-full mt-4 border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold py-2 rounded-lg text-sm transition-colors"
      >
        Cancel Payment
      </button>

      {/* Security Note */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        <span>100% Secure Payment via NPCI</span>
      </div>
    </div>
  );
}
