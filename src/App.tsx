import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Send, 
  RefreshCw, 
  ChevronLeft, 
  Info, 
  HelpCircle, 
  FileText, 
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { 
  AppMode, 
  ServiceType, 
  PurposeType, 
  Message, 
  KB, 
  COMMON_INFO, 
  KENDALA 
} from './constants';
import { getGroundedResponse } from './services/geminiService';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for Mode B & C
  const [currentService, setCurrentService] = useState<ServiceType | null>(null);
  const [currentPurpose, setCurrentPurpose] = useState<PurposeType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showKendala, setShowKendala] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, role: 'user' | 'bot') => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      role,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleReset = () => {
    setMode(AppMode.LANDING);
    setMessages([]);
    setCurrentService(null);
    setCurrentPurpose(null);
    setCurrentStep(0);
    setShowKendala(false);
  };

  const handleModeSelect = (selectedMode: AppMode) => {
    setMode(selectedMode);
    if (selectedMode === AppMode.MODE_A) {
      addMessage("Halo! Aku siap membantumu terkait layanan administrasi yang ada di fakultas. Jadi apa yang bisa kubantu?", 'bot');
    } else if (selectedMode === AppMode.MODE_B || selectedMode === AppMode.MODE_C) {
      addMessage("Halo!. Aku siap membantumu terkait layanan administrasi yang ada di fakultas. Pilih salah satu dari layanan di bawah ini.", 'bot');
    }
  };

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;
    
    addMessage(text, 'user');
    setInputText('');
    setIsLoading(true);

    // Grounding search for manual typing in all modes
    const response = await getGroundedResponse(text);
    addMessage(response, 'bot');
    setIsLoading(false);
  };

  const handleServiceSelect = (service: ServiceType) => {
    setCurrentService(service);
    addMessage(getServiceLabel(service), 'user');
    
    if (service === ServiceType.SURAT_AKTIF) {
      addMessage("Buat Surat Keterangan Aktif Kuliah, untuk apa?", 'bot');
    } else {
      startServiceFlow(service);
    }
  };

  const handlePurposeSelect = (purpose: PurposeType) => {
    setCurrentPurpose(purpose);
    addMessage(purpose === PurposeType.LOMBA ? "Lomba" : "Non-Lomba", 'user');
    startServiceFlow(currentService!, purpose);
  };

  const startServiceFlow = (service: ServiceType, purpose?: PurposeType) => {
    if (mode === AppMode.MODE_B) {
      addMessage("Pilih salah satu dari ke 5 tombol ini", 'bot');
    } else if (mode === AppMode.MODE_C) {
      setCurrentStep(1);
      const kbData = getKBData(service, purpose);
      const step = kbData.steps[0];
      addMessage(`Langkah 1/${kbData.steps.length}: ${step.title}\n\n${step.content}`, 'bot');
    }
  };

  const handleLayananAwal = () => {
    setCurrentService(null);
    setCurrentPurpose(null);
    setCurrentStep(0);
    setShowKendala(false);
    addMessage("Pilih salah satu dari layanan di bawah ini.", 'bot');
  };

  const handleModeBAction = (action: string) => {
    if (action === 'Layanan Awal') {
      handleLayananAwal();
      return;
    }
    addMessage(action, 'user');
    const kbData = getKBData(currentService!, currentPurpose || undefined);
    
    switch (action) {
      case 'Cara Buat Surat':
        addMessage(kbData.prosedur, 'bot');
        break;
      case 'Estimasi Proses':
        addMessage(COMMON_INFO.estimasi, 'bot');
        break;
      case 'Kontak Bantuan':
        const contact = (currentService === ServiceType.REKOMENDASI || currentService === ServiceType.BEASISWA_GANDA) 
          ? COMMON_INFO.kontak.kemahasiswaan 
          : COMMON_INFO.kontak.akademik;
        addMessage(contact, 'bot');
        break;
      case 'Unduh dokumen template':
        addMessage(`Silakan unduh template di sini: ${kbData.template}`, 'bot');
        break;
      case 'Ubah Kebutuhan':
        if (currentService === ServiceType.SURAT_AKTIF) {
          setCurrentPurpose(null);
          addMessage("Buat Surat Keterangan Aktif Kuliah, untuk apa?", 'bot');
        } else {
          setCurrentService(null);
          setCurrentPurpose(null);
          addMessage("Pilih salah satu dari layanan di bawah ini.", 'bot');
        }
        break;
    }
  };

  const handleModeCAction = (action: string) => {
    if (action === 'Layanan Awal') {
      handleLayananAwal();
      return;
    }
    addMessage(action, 'user');
    const kbData = getKBData(currentService!, currentPurpose || undefined);
    
    if (action === 'Saya mengalami kendala') {
      setShowKendala(true);
      addMessage("Apa kendala yang Anda alami?", 'bot');
      return;
    }

    if (action === 'Kontak Bantuan') {
      const contact = (currentService === ServiceType.REKOMENDASI || currentService === ServiceType.BEASISWA_GANDA) 
        ? COMMON_INFO.kontak.kemahasiswaan 
        : COMMON_INFO.kontak.akademik;
      addMessage(contact, 'bot');
      return;
    }

    if (action === 'Ubah Kebutuhan') {
      setCurrentPurpose(null);
      setCurrentStep(0);
      addMessage("Buat Surat Keterangan Aktif Kuliah, untuk apa?", 'bot');
      return;
    }

    if (action === 'Unduh dokumen template') {
      addMessage(`Silakan unduh template di sini: ${kbData.template}`, 'bot');
      return;
    }

    if (action.startsWith('Coba lagi')) {
      setShowKendala(false);
      const step = kbData.steps[currentStep - 1];
      addMessage(`Langkah ${currentStep}/${kbData.steps.length}: ${step.title}\n\n${step.content}`, 'bot');
      return;
    }

    // Next Step Logic
    if (currentStep < kbData.steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const step = kbData.steps[nextStep - 1];
      addMessage(`Langkah ${nextStep}/${kbData.steps.length}: ${step.title}\n\n${step.content}`, 'bot');
    } else {
      // End State
      let endMsg = `Selesai 🎉\n\n${COMMON_INFO.estimasi}`;
      if (currentService === ServiceType.REKOMENDASI || currentService === ServiceType.BEASISWA_GANDA) {
        endMsg += `\n\nInfo tracking: ${COMMON_INFO.tracking}`;
      }
      const contact = (currentService === ServiceType.REKOMENDASI || currentService === ServiceType.BEASISWA_GANDA) 
        ? COMMON_INFO.kontak.kemahasiswaan 
        : COMMON_INFO.kontak.akademik;
      endMsg += `\n\n${contact}`;
      
      addMessage(endMsg, 'bot');
      setCurrentStep(0);
      setCurrentService(null);
      setCurrentPurpose(null);
    }
  };

  const handleKendalaSelect = (kendala: string) => {
    addMessage(kendala, 'user');
    
    const contact = (currentService === ServiceType.REKOMENDASI || currentService === ServiceType.BEASISWA_GANDA) 
      ? "WA Center kemahasiswaan : 08xxx" 
      : "WA Center akademik 08xxxxxxxxx";

    let solusi = "";
    switch (kendala) {
      case 'Link tidak bisa dibuka (404)':
        solusi = `Hubungi ${contact} untuk menanyakan apakah ada perubahan tautan.`;
        break;
      case 'Halaman loading terus':
        solusi = "Silakan coba muat ulang halaman, pastikan koneksi internet Anda stabil atau ganti ke koneksi internet yang lain.";
        break;
      case 'Izin Akses ditolak':
        solusi = "Pastikan kamu login dengan akun google student.ub.ac.id untuk mengakses tautan.";
        break;
      case 'Tidak bisa upload/isi kolom':
        solusi = "Pastikan format inputan sesuai atau ukuran file tidak terlalu besar, dan koneksi stabil. Coba ulang.";
        break;
      case 'Tidak paham bagian tertentu':
        solusi = "Baca instruksi di atas kolom tersebut. Jika masih bingung, silakan hubungi kontak bantuan.";
        break;
      case 'Tidak bisa klik Kirim':
        solusi = "Pastikan semua kolom yang terdapat tanda * wajib terisi. Lihat ke seluruhan bagian form untuk melihat error.";
        break;
      default:
        solusi = `Silakan hubungi ${contact} untuk bantuan lebih lanjut.`;
    }
    
    addMessage(`Solusi: ${solusi}`, 'bot');
  };

  const getKBData = (service: ServiceType, purpose?: PurposeType) => {
    if (service === ServiceType.SURAT_AKTIF) {
      return KB[ServiceType.SURAT_AKTIF][purpose || PurposeType.NON_LOMBA];
    }
    return KB[service as keyof typeof KB] as any;
  };

  const getServiceLabel = (service: ServiceType) => {
    switch (service) {
      case ServiceType.SURAT_AKTIF: return "Surat Keterangan Aktif Kuliah";
      case ServiceType.BEASISWA_GANDA: return "Surat Keterangan tidak menerima beasiswa ganda";
      case ServiceType.REKOMENDASI: return "Surat rekomendasi PKL/beasiswa/lomba";
      case ServiceType.TRANSKRIP: return "Cetak Transkrip Nilai";
      default: return "";
    }
  };

  if (mode === AppMode.LANDING) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        >
          <div className="bg-indigo-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <MessageCircle size={32} />
            </div>
            <h1 className="text-xl font-bold mb-1">FILKOM Admin Chatbot</h1>
            <p className="text-indigo-100 text-xs">Pilih mode interaksi untuk memulai bantuan administrasi.</p>
          </div>
          
          <div className="p-5 space-y-3">
            <button 
              onClick={() => handleModeSelect(AppMode.MODE_A)}
              className="w-full p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl flex items-center gap-4 transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm text-slate-900">Mode A</div>
                <div className="text-[10px] text-slate-500">One-Shot / Free Typing</div>
              </div>
              <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-500" size={18} />
            </button>

            <button 
              onClick={() => handleModeSelect(AppMode.MODE_B)}
              className="w-full p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl flex items-center gap-4 transition-all group"
            >
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Info size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm text-slate-900">Mode B</div>
                <div className="text-[10px] text-slate-500">Informational Assistant</div>
              </div>
              <ArrowRight className="ml-auto text-slate-300 group-hover:text-emerald-500" size={18} />
            </button>

            <button 
              onClick={() => handleModeSelect(AppMode.MODE_C)}
              className="w-full p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-2xl flex items-center gap-4 transition-all group"
            >
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm text-slate-900">Mode C</div>
                <div className="text-[10px] text-slate-500">Task Coach (Step-by-Step)</div>
              </div>
              <ArrowRight className="ml-auto text-slate-300 group-hover:text-amber-500" size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans max-w-2xl mx-auto border-x border-slate-200 shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <button onClick={handleReset} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h2 className="font-bold text-sm text-slate-900 leading-tight">FILKOM Admin</h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {mode === AppMode.MODE_A ? 'Mode A' : mode === AppMode.MODE_B ? 'Mode B' : 'Mode C'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold transition-all"
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide bg-slate-50">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[88%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                <div 
                  className="whitespace-pre-wrap leading-relaxed markdown-body text-[13px]"
                  dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
                />
                <div className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Quick Replies inside Chat Area */}
        {(mode === AppMode.MODE_B || mode === AppMode.MODE_C) && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 pt-2"
          >
            {!currentService && (
              <>
                <QuickReply onClick={() => handleServiceSelect(ServiceType.SURAT_AKTIF)} label="Surat Keterangan Aktif Kuliah" icon={<FileText size={14}/>} color="indigo" />
                <QuickReply onClick={() => handleServiceSelect(ServiceType.BEASISWA_GANDA)} label="Surat Keterangan tidak menerima beasiswa ganda" icon={<AlertCircle size={14}/>} color="emerald" />
                <QuickReply onClick={() => handleServiceSelect(ServiceType.REKOMENDASI)} label="Surat rekomendasi PKL/beasiswa/lomba" icon={<CheckCircle2 size={14}/>} color="amber" />
                <QuickReply onClick={() => handleServiceSelect(ServiceType.TRANSKRIP)} label="Cetak Transkrip Nilai" icon={<FileText size={14}/>} color="rose" />
              </>
            )}

            {currentService === ServiceType.SURAT_AKTIF && !currentPurpose && (
              <>
                <QuickReply onClick={() => handlePurposeSelect(PurposeType.LOMBA)} label="Lomba" color="indigo" />
                <QuickReply onClick={() => handlePurposeSelect(PurposeType.NON_LOMBA)} label="Non-Lomba" color="indigo" />
              </>
            )}

            {mode === AppMode.MODE_B && currentService && (currentService !== ServiceType.SURAT_AKTIF || currentPurpose) && (
              <>
                <QuickReply onClick={() => handleModeBAction('Cara Buat Surat')} label="Cara Buat Surat" color="indigo" />
                <QuickReply onClick={() => handleModeBAction('Estimasi Proses')} label="Estimasi Proses" color="indigo" />
                <QuickReply onClick={() => handleModeBAction('Kontak Bantuan')} label="Kontak Bantuan" color="indigo" />
                {currentService === ServiceType.BEASISWA_GANDA && (
                  <QuickReply onClick={() => handleModeBAction('Unduh dokumen template')} label="Unduh dokumen template" icon={<Download size={14}/>} color="emerald" />
                )}
                {currentService === ServiceType.SURAT_AKTIF && (
                  <QuickReply onClick={() => handleModeBAction('Ubah Kebutuhan')} label="Ubah Kebutuhan" color="slate" />
                )}
                <QuickReply onClick={() => handleModeBAction('Layanan Awal')} label="Layanan Awal" color="slate" />
              </>
            )}

            {mode === AppMode.MODE_C && currentStep > 0 && !showKendala && (
              <>
                <QuickReply 
                  onClick={() => handleModeCAction(getKBData(currentService!, currentPurpose || undefined).steps[currentStep-1].action)} 
                  label={getKBData(currentService!, currentPurpose || undefined).steps[currentStep-1].action} 
                  color="indigo" 
                />
                <QuickReply onClick={() => handleModeCAction('Saya mengalami kendala')} label="Saya mengalami kendala" color="rose" />
                {currentService === ServiceType.SURAT_AKTIF ? (
                  <QuickReply onClick={() => handleModeCAction('Ubah Kebutuhan')} label="Ubah Kebutuhan" color="slate" />
                ) : (
                  <QuickReply onClick={() => handleModeCAction('Kontak Bantuan')} label="Kontak Bantuan" color="indigo" />
                )}
                {currentService === ServiceType.BEASISWA_GANDA && (
                  <QuickReply onClick={() => handleModeCAction('Unduh dokumen template')} label="Unduh dokumen template" icon={<Download size={14}/>} color="emerald" />
                )}
                <QuickReply onClick={() => handleModeCAction('Layanan Awal')} label="Layanan Awal" color="slate" />
              </>
            )}

            {mode === AppMode.MODE_C && showKendala && (
              <>
                {KENDALA[`step${currentStep}` as keyof typeof KENDALA]?.map(k => (
                  <QuickReply key={k} onClick={() => handleKendalaSelect(k)} label={k} color="rose" />
                ))}
                <QuickReply onClick={() => handleModeCAction(`Coba lagi (kembali ke langkah ${currentStep})`)} label="Kembali ke langkah" color="slate" />
                {currentService !== ServiceType.SURAT_AKTIF && (
                  <QuickReply onClick={() => handleModeCAction('Kontak Bantuan')} label="Kontak Bantuan" color="indigo" />
                )}
                {currentService === ServiceType.BEASISWA_GANDA && (
                  <QuickReply onClick={() => handleModeCAction('Unduh dokumen template')} label="Unduh dokumen template" icon={<Download size={14}/>} color="emerald" />
                )}
              </>
            )}
          </motion.div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Bar */}
      <footer className="bg-white border-t border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ketik pesan Anda..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}

interface QuickReplyProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  color?: string;
}

const QuickReply: React.FC<QuickReplyProps> = ({ label, onClick, icon, color = 'indigo' }) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all whitespace-nowrap shadow-sm ${colors[color]}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
