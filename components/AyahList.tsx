import React from 'react';
import { Ayah, Surah } from '../types/quran';
import { RefreshCw, AlertCircle, Volume2, CheckCircle2 } from 'lucide-react';

interface AyahListProps {
  surah: Surah | null;
  ayahs: Ayah[];
  selectedAyah: Ayah | null;
  onSelectAyah: (ayah: Ayah) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const AyahList: React.FC<AyahListProps> = ({
  surah,
  ayahs,
  selectedAyah,
  onSelectAyah,
  isLoading,
  error,
  onRetry,
}) => {
  if (!surah) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 rounded-xl bg-[#121814]/40 border border-emerald-950/40">
        <p className="text-xs">Pilih surat di atas untuk menampilkan daftar ayat</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 rounded-xl bg-[#121814]/40 border border-emerald-950/40">
        <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
        <p className="text-xs font-medium text-emerald-300/80">Memuat ayat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-xl bg-[#121814] border border-red-950/50">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-xs text-slate-300 font-medium whitespace-pre-line">
          Gagal mengambil data Al-Qur'an.{"\n"}Silakan coba lagi.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header showing Surah Name in uppercase */}
      <div className="pb-2.5 mb-2 border-b border-emerald-950/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Daftar Ayat
          </span>
          <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wide">
            {surah.name_latin || surah.name}
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {ayahs.length} Ayat
        </span>
      </div>

      {/* Scrollable List of Ayahs */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
        {ayahs.map((ayah) => {
          const isActive = selectedAyah?.ayah_number === ayah.ayah_number;
          return (
            <div
              key={ayah.id || `${ayah.surah_number}-${ayah.ayah_number}`}
              onClick={() => onSelectAyah(ayah)}
              className={`p-3.5 rounded-xl cursor-pointer transition-all duration-150 border text-left ${
                isActive
                  ? 'bg-[#152119] border-emerald-500/70 ring-1 ring-emerald-500/40 shadow-lg'
                  : 'bg-[#121814] border-emerald-950/60 hover:bg-[#161f1a] hover:border-emerald-800/40'
              }`}
            >
              {/* Ayah Title & Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                  isActive ? 'text-emerald-300' : 'text-slate-400'
                }`}>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  Ayat {ayah.ayah_number}
                </span>

                {ayah.audio_url && (
                  <span className={`text-[10px] flex items-center gap-1 ${
                    isActive ? 'text-emerald-400 font-medium' : 'text-slate-500'
                  }`}>
                    <Volume2 className="w-3 h-3" />
                    Audio
                  </span>
                )}
              </div>

              {/* Arabic Text (API authentic with harakat) */}
              <p 
                dir="rtl"
                className={`font-arabic text-right text-lg leading-loose mb-2 ${
                  isActive ? 'text-emerald-100 font-medium' : 'text-slate-200'
                }`}
                style={{ direction: 'rtl' }}
              >
                {ayah.arab}
              </p>

              {/* Indonesian Translation */}
              {ayah.translation && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {ayah.translation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
