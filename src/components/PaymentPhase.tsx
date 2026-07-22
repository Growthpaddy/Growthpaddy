import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Mail,
  Building2,
  Send,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface PaymentPhaseProps {
  isTalentPaid: boolean;
  userName?: string;
  userEmail?: string;
  onPaymentComplete: () => void;
  onNextPhase: () => void;
}

export const PaymentPhase: React.FC<PaymentPhaseProps> = ({
  isTalentPaid,
  userName = 'Talent Candidate',
  userEmail = '',
  onPaymentComplete,
  onNextPhase,
}) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [selectedCurrencyTab, setSelectedCurrencyTab] = useState<'ALL' | 'NGN' | 'USD' | 'EUR' | 'GBP'>('ALL');
  const [payingState, setPayingState] = useState(false);

  const handleCopyAccount = (accNo: string, currencyCode: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedAccount(currencyCode);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleConfirmTransfer = () => {
    setPayingState(true);
    setTimeout(() => {
      setPayingState(false);
      onPaymentComplete();
    }, 1200);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello DSP Academy, I have completed my ₦35,000 Accreditation Pass bank transfer.\n\nName: ${userName}\nEmail: ${userEmail}\nPlease find attached my payment proof.`
  );

  const emailSubject = encodeURIComponent(`DSP Accreditation Pass Payment Proof - ${userName}`);
  const emailBody = encodeURIComponent(
    `Hello DSP Academy Team,\n\nI have completed my Accreditation Pass bank transfer.\n\nName: ${userName}\nEmail: ${userEmail}\nAccount: GTBank PLC\n\nPlease find attached my payment receipt.`
  );

  return (
    <div className="space-y-8 text-left font-sans" id="payment-phase-component">
      {isTalentPaid ? (
        <div className="p-8 text-center bg-emerald-50/50 border-4 border-emerald-600 max-w-2xl mx-auto space-y-6 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.3)]">
          <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border-2 border-neutral-950 flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <span className="text-[9.5px] font-mono font-black text-emerald-800 bg-emerald-100 px-3 py-1 border border-emerald-300 uppercase tracking-widest inline-block">
              ACCREDITATION PASS RECORDED
            </span>
            <h4 className="font-display font-black text-2xl uppercase tracking-tight text-neutral-950">
              DIRECT TRANSFER LOGGED & VERIFIED
            </h4>
            <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wider max-w-lg mx-auto leading-relaxed">
              Your Accreditation Pass (₦35,000 / $22 USD equivalent) is authorized. Ensure you have sent your payment receipt to complete manual badge indexing.
            </p>
          </div>

          {/* Proof Submission Action Card */}
          <div className="bg-white p-5 border-2 border-neutral-950 space-y-3 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-mono font-black text-neutral-900 uppercase tracking-wider block">
              SEND OR CONFIRM PAYMENT RECEIPT:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://wa.me/2348169664607?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3 px-4 text-xs uppercase tracking-wider border-2 border-neutral-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 animate-bounce" />
                <span>WhatsApp (+234 816 966 4607)</span>
              </a>
              <a
                href={`mailto:stanleypatrick3800@gmail.com?subject=${emailSubject}&body=${emailBody}`}
                className="flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white font-black py-3 px-4 text-xs uppercase tracking-wider border-2 border-neutral-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Email Receipt</span>
              </a>
            </div>
          </div>

          <button
            onClick={onNextPhase}
            className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-4 rounded-none text-xs uppercase tracking-widest cursor-pointer border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
          >
            <span>PROCEED TO BUILD PROJECT DOSSIER (PHASE 4)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Value Proposition & Rate Notice Banner */}
          <div className="bg-amber-50/90 border-2 border-amber-500/50 p-6 text-left space-y-4 relative shadow-[4px_4px_0px_0px_rgba(245,158,11,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
              <span className="text-[10px] font-mono font-black text-amber-950 uppercase tracking-widest bg-amber-200 px-3 py-1 border border-amber-400 inline-block">
                OFFICIAL BRAND BANK TRANSFER GATEWAY
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono font-black text-amber-900">
                <Zap className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>ONE-TIME FEE: ₦35,000 NGN | CURRENCY CONVERSIONS INCLUDED</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-2 text-xs font-semibold text-slate-800 leading-relaxed uppercase">
                <p className="font-extrabold text-neutral-950 text-sm">
                  ONE-TIME ₦35,000 FEE TO BE PLACED DIRECTLY IN FRONT OF RECRUITERS
                </p>
                <p className="text-slate-600 text-xs normal-case font-medium">
                  The ₦35,000 verification pass serves as a high-intent filter that locks down your verified slot directly in front of prospective employers and active recruiters. By securing accreditation, you bypass casual applicants and ensure top placement in our verified talent pool.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% REFUNDABLE upon securing your first role or within 90 days.</span>
                </div>
              </div>

              {/* Conversion Rate Index Table */}
              <div className="lg:col-span-5 bg-white border-2 border-neutral-950 p-3.5 space-y-2 text-[11px] font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block border-b pb-1">
                  CONVERTED CURRENCY FEES FOR ₦35,000:
                </span>
                <div className="space-y-1.5 font-bold">
                  <div className="flex justify-between items-center bg-emerald-50 px-2 py-1 border border-emerald-200 text-emerald-950">
                    <span>🇳🇬 NAIRA (NGN)</span>
                    <span className="font-black text-xs text-emerald-800">₦35,000 NGN</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 px-2 py-1 border border-blue-200 text-blue-950">
                    <span>🇺🇸 DOLLAR (USD)</span>
                    <span className="font-black text-xs text-blue-800">$22 USD <span className="text-[9px] font-normal text-slate-500">(@ ₦1,600/$1)</span></span>
                  </div>
                  <div className="flex justify-between items-center bg-purple-50 px-2 py-1 border border-purple-200 text-purple-950">
                    <span>🇪🇺 EURO (EUR)</span>
                    <span className="font-black text-xs text-purple-800">€21 EUR <span className="text-[9px] font-normal text-slate-500">(@ ₦1,650/€1)</span></span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50 px-2 py-1 border border-amber-200 text-amber-950">
                    <span>🇬🇧 POUNDS (GBP)</span>
                    <span className="font-black text-xs text-amber-800">£18 GBP <span className="text-[9px] font-normal text-slate-500">(@ ₦1,950/£1)</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Currency Filter Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-neutral-900 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>SELECT YOUR PREFERRED TRANSFER ACCOUNT CURRENCY:</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-500 hidden sm:inline">
                OFFICIAL GTBANK PLC BRAND ACCOUNTS
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: 'All Accounts (4)', flag: '🌐' },
                { key: 'NGN', label: 'Naira (₦35,000)', flag: '🇳🇬' },
                { key: 'USD', label: 'Dollar ($22)', flag: '🇺🇸' },
                { key: 'EUR', label: 'Euro (€21)', flag: '🇪🇺' },
                { key: 'GBP', label: 'Pounds (£18)', flag: '🇬🇧' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCurrencyTab(tab.key as any)}
                  className={`px-3.5 py-2 text-xs font-mono font-black uppercase border-2 transition-all cursor-pointer flex items-center gap-2 ${
                    selectedCurrencyTab === tab.key
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-[3px_3px_0px_0px_rgba(0,168,107,1)]'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-950'
                  }`}
                >
                  <span>{tab.flag}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4 Bank Account Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: NAIRA */}
            {(selectedCurrencyTab === 'ALL' || selectedCurrencyTab === 'NGN') && (
              <div className="bg-white border-4 border-neutral-950 p-6 text-left relative shadow-[8px_8px_0px_0px_rgba(0,168,107,1)] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b-2 border-neutral-200 pb-3">
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300 inline-block mb-1">
                        🇳🇬 NAIRA ACCOUNT
                      </span>
                      <h4 className="font-display font-black text-2xl text-emerald-950">
                        ₦35,000 <span className="text-xs font-mono text-neutral-500 font-bold uppercase">NGN</span>
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-black text-emerald-900 bg-emerald-50 px-2 py-1 border border-emerald-200">
                      LOCAL BASE FEE
                    </span>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                      <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Bank Name</span>
                      <span className="font-black text-sm text-neutral-950 uppercase">GTBank PLC</span>
                    </div>

                    <div className="bg-emerald-50/80 p-3 border-2 border-emerald-600 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-emerald-800 font-extrabold uppercase block">Account Number</span>
                        <span className="font-mono font-black text-xl text-neutral-950 tracking-wider">3003427369</span>
                      </div>
                      <button
                        onClick={() => handleCopyAccount('3003427369', 'NGN')}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-[10px] font-black px-3 py-2 uppercase border border-neutral-950 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedAccount === 'NGN' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">COPIED! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                      <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Account Name</span>
                      <span className="font-black text-xs text-neutral-950 uppercase tracking-wider">DSP ACADEMY</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 p-2 border border-neutral-200 text-center">
                  Fastest local bank transfer processing in Nigeria
                </div>
              </div>
            )}

            {/* CARD 2: DOLLAR */}
            {(selectedCurrencyTab === 'ALL' || selectedCurrencyTab === 'USD') && (
              <div className="bg-white border-4 border-neutral-950 p-6 text-left relative shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b-2 border-neutral-200 pb-3">
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-blue-800 bg-blue-100 px-2 py-0.5 border border-blue-300 inline-block mb-1">
                        🇺🇸 DOLLAR ACCOUNT
                      </span>
                      <h4 className="font-display font-black text-2xl text-blue-950">
                        $22 <span className="text-xs font-mono text-neutral-500 font-bold uppercase">USD</span>
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-black text-blue-900 bg-blue-50 px-2 py-1 border border-blue-200">
                      @ ₦1,600 / $1
                    </span>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                      <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Bank Name</span>
                      <span className="font-black text-sm text-neutral-950 uppercase">GTBank PLC</span>
                    </div>

                    <div className="bg-blue-50/80 p-3 border-2 border-blue-600 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-blue-800 font-extrabold uppercase block">Account Number</span>
                        <span className="font-mono font-black text-xl text-neutral-950 tracking-wider">3003427194</span>
                      </div>
                      <button
                        onClick={() => handleCopyAccount('3003427194', 'USD')}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-[10px] font-black px-3 py-2 uppercase border border-neutral-950 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedAccount === 'USD' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-blue-400">COPIED! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                      <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Account Name</span>
                      <span className="font-black text-xs text-neutral-950 uppercase tracking-wider">DSP ACADEMY</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 p-2 border border-neutral-200 text-center">
                  For international USD transfers & domiciliary wire
                </div>
              </div>
            )}

            {/* CARD 3: EURO */}
            {(selectedCurrencyTab === 'ALL' || selectedCurrencyTab === 'EUR') && (
              <div className="bg-white border-4 border-neutral-950 p-6 text-left relative shadow-[8px_8px_0px_0px_rgba(147,51,234,1)] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b-2 border-neutral-200 pb-3">
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-purple-800 bg-purple-100 px-2 py-0.5 border border-purple-300 inline-block mb-1">
                        🇪🇺 EURO ACCOUNT
                      </span>
                      <h4 className="font-display font-black text-2xl text-purple-950">
                        €21 <span className="text-xs font-mono text-neutral-500 font-bold uppercase">EUR</span>
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-black text-purple-900 bg-purple-50 px-2 py-1 border border-purple-200">
                      @ ₦1,650 / €1
                    </span>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                      <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Bank Name</span>
                      <span className="font-black text-sm text-neutral-950 uppercase">GTBank PLC</span>
                    </div>

                    <div className="bg-purple-50/80 p-3 border-2 border-purple-600 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-purple-800 font-extrabold uppercase block">Account Number</span>
                        <span className="font-mono font-black text-xl text-neutral-950 tracking-wider">3003427211</span>
                      </div>
                      <button
                        onClick={() => handleCopyAccount('3003427211', 'EUR')}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-[10px] font-black px-3 py-2 uppercase border border-neutral-950 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedAccount === 'EUR' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-purple-400">COPIED! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                      <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Account Name</span>
                      <span className="font-black text-xs text-neutral-950 uppercase tracking-wider">DSP ACADEMY</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 p-2 border border-neutral-200 text-center">
                  For European SEPA & Euro wire transfers
                </div>
              </div>
            )}

            {/* CARD 4: POUNDS */}
            {(selectedCurrencyTab === 'ALL' || selectedCurrencyTab === 'GBP') && (
              <div className="bg-white border-4 border-neutral-950 p-6 text-left relative shadow-[8px_8px_0px_0px_rgba(217,119,6,1)] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b-2 border-neutral-200 pb-3">
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-amber-900 bg-amber-100 px-2 py-0.5 border border-amber-300 inline-block mb-1">
                        🇬🇧 POUNDS ACCOUNT
                      </span>
                      <h4 className="font-display font-black text-2xl text-amber-950">
                        £18 <span className="text-xs font-mono text-neutral-500 font-bold uppercase">GBP</span>
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-black text-amber-900 bg-amber-50 px-2 py-1 border border-amber-200">
                      @ ₦1,950 / £1
                    </span>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                      <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Bank Name</span>
                      <span className="font-black text-sm text-neutral-950 uppercase">GTBank PLC</span>
                    </div>

                    <div className="bg-amber-50/80 p-3 border-2 border-amber-600 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-amber-800 font-extrabold uppercase block">Account Number</span>
                        <span className="font-mono font-black text-xl text-neutral-950 tracking-wider">3003427235</span>
                      </div>
                      <button
                        onClick={() => handleCopyAccount('3003427235', 'GBP')}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-[10px] font-black px-3 py-2 uppercase border border-neutral-950 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedAccount === 'GBP' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-400">COPIED! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-neutral-50 p-2.5 border border-neutral-200">
                      <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Account Name</span>
                      <span className="font-black text-xs text-neutral-950 uppercase tracking-wider">DSP ACADEMY</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 p-2 border border-neutral-200 text-center">
                  For UK Sterling wire & international transfers
                </div>
              </div>
            )}

          </div>

          {/* Transfer Confirmation Button */}
          <div className="bg-neutral-950 text-white p-6 border-4 border-neutral-950 space-y-4 text-left shadow-[8px_8px_0px_0px_rgba(0,168,107,1)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[9.5px] font-mono font-black text-emerald-400 uppercase tracking-widest block mb-1">
                  STEP 2: CONFIRMATION & PAYMENT PROOF
                </span>
                <h4 className="font-display font-black text-lg uppercase tracking-tight text-white">
                  COMPLETED YOUR BANK TRANSFER?
                </h4>
                <p className="text-xs text-neutral-400 font-medium max-w-xl mt-0.5">
                  Click below to log your transfer and immediately submit your receipt via WhatsApp or Email to authorize your permanent "VERIFIED PROFESSIONAL" badge.
                </p>
              </div>

              <button
                onClick={handleConfirmTransfer}
                disabled={payingState}
                className="w-full sm:w-auto bg-[#00A86B] hover:bg-emerald-500 text-white font-black py-4 px-8 text-xs uppercase tracking-widest cursor-pointer border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all shrink-0"
              >
                {payingState ? 'LOGGING SECURITY LEDGER...' : 'I HAVE COMPLETED MY TRANSFER ✓'}
              </button>
            </div>
          </div>

          {/* Post-Payment Proof Notification Banner (Animated & Direct Links) */}
          <div className="bg-emerald-50/90 border-4 border-emerald-600 p-6 text-left space-y-5 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.3)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center font-black border-2 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Send className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-black text-base uppercase text-emerald-950">
                  NOTIFY & SEND PAYMENT PROOF TO US
                </h4>
                <p className="text-xs text-emerald-900 font-semibold uppercase tracking-wider">
                  Direct automated notification links to our official verification staff
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/2348169664607?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 border-2 border-neutral-950 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-neutral-950 text-[#25D366] flex items-center justify-center shrink-0 border border-white">
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-black uppercase text-emerald-950 block">INSTANT MESSAGING</span>
                  <p className="font-black text-xs uppercase tracking-wider truncate">WhatsApp: +234 816 966 4607</p>
                  <span className="text-[10px] text-emerald-950 font-medium block">Send receipt image for instant verification</span>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-950 shrink-0" />
              </a>

              {/* Email Button */}
              <a
                href={`mailto:stanleypatrick3800@gmail.com?subject=${emailSubject}&body=${emailBody}`}
                className="group relative bg-neutral-950 hover:bg-neutral-800 text-white p-4 border-2 border-neutral-950 shadow-[5px_5px_0px_0px_rgba(16,185,129,1)] hover:shadow-none transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0 border border-neutral-950">
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-black uppercase text-emerald-400 block">OFFICIAL SUPPORT EMAIL</span>
                  <p className="font-black text-xs uppercase tracking-wider truncate">stanleypatrick3800@gmail.com</p>
                  <span className="text-[10px] text-neutral-400 font-medium block">Email payment receipt or PDF confirmation</span>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
              </a>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
