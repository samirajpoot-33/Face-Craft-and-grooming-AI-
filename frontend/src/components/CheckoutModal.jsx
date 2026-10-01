import React, { useState } from 'react';
import { Loader2, Lock, X, Copy, Check } from 'lucide-react';

export default function CheckoutModal({ plan, onClose, onSuccess }) {
  if (!plan) return null;

  const [txId, setTxId] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // --- ADMIN DETAILS (HARDCODED FOR NOW) ---
  const binancePayId = '727800261'; 
  const usdtAddress = 'TSbgtZuXnszxCxw14dDRkrbLzoRPB2i2LL';
  const qrCodeUrl = '/Qr-Code.jpeg'; // Placeholder QR
  // -----------------------------------------

  function getBackendOrigin() {
    return window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txId.trim()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getBackendOrigin()}/api/membership/submit-manual-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: plan.id,
          txId: txId.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Failed to submit transaction.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setStatus('error');
      setErrorMessage('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/85 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-yellow-500/5 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/5 relative flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-yellow-500">Manual</span> Checkout
            </h3>
            <p className="text-slate-400 text-xs mt-1">Pay with Crypto (USDT)</p>
          </div>
          <button 
            onClick={onClose}
            disabled={status === 'submitting' || status === 'success'}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 flex flex-col items-center overflow-y-auto">
          {/* Plan Summary */}
          <div className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center mb-6 shrink-0">
            <div>
              <div className="text-sm font-bold text-white">{plan.name}</div>
              <div className="text-xs text-slate-400">{plan.description}</div>
            </div>
            <div className="text-xl font-black text-yellow-500">{plan.price} <span className="text-xs font-normal text-slate-500">USDT</span></div>
          </div>

          {(status === 'idle' || status === 'error' || status === 'submitting') && (
            <div className="flex flex-col items-center w-full space-y-6">
              
              {/* Payment Instructions */}
              <div className="w-full bg-slate-800/30 rounded-xl p-4 border border-yellow-500/10">
                <p className="text-xs text-slate-300 text-center mb-4">
                  Please send exactly <strong className="text-yellow-500">{plan.price} USDT</strong> to the account below.
                </p>
                
                <div className="flex justify-center mb-4">
                    <img src={qrCodeUrl} alt="Binance QR" className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg bg-white p-2 object-contain shadow-sm border border-slate-700" />
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-950 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Binance Pay ID</div>
                      <div className="text-sm font-mono text-white">{binancePayId}</div>
                    </div>
                    <button onClick={() => handleCopy(binancePayId)} className="text-slate-400 hover:text-white transition">
                      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 flex justify-between items-center">
                    <div className="overflow-hidden">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">USDT (TRC20) Address</div>
                      <div className="text-sm font-mono text-white truncate max-w-[200px]">{usdtAddress}</div>
                    </div>
                    <button onClick={() => handleCopy(usdtAddress)} className="text-slate-400 hover:text-white transition shrink-0 ml-2">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    Transaction ID (TxID)
                  </label>
                  <input
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="Enter your Binance TxID..."
                    required
                    disabled={status === 'submitting'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition disabled:opacity-50 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 text-center">
                    After you send the payment, paste the Transaction ID here so we can verify it.
                  </p>
                </div>

                {status === 'error' && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting' || !txId.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest border border-white/10 shadow-lg shadow-yellow-500/5 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {status === 'submitting' ? (
                    <><Loader2 className="animate-spin" size={14} /> Submitting...</>
                  ) : (
                    'Submit Payment for Verification'
                  )}
                </button>
              </form>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center py-8 space-y-4 animate-scale-up w-full">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check size={40} className="text-emerald-500 animate-draw" />
              </div>
              <h4 className="text-2xl font-black text-white text-center">Payment Submitted!</h4>
              <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed">
                Thank you! Your Transaction ID has been sent to the admin. 
                <br/><br/>
                Your credits/premium will be added to your account as soon as the admin verifies the payment.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-xs py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-widest transition mt-4"
              >
                Return to Pricing
              </button>
            </div>
          )}

          {/* Secure indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-white/5 w-full text-slate-500 text-[10px] shrink-0">
            <Lock size={12} />
            <span>Secured via Manual Crypto Transfer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
