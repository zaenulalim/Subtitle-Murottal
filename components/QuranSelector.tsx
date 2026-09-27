import React, { useState, useMemo } from 'react';
import { Surah } from '../types/quran';
import { Search, ChevronDown, Check, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';

interface QuranSelectorProps {
  surahs: Surah[];
  selectedSurah: Surah | null;
  onSelectSurah: (surah: Surah) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const QuranSelector: React.FC<QuranSelectorProps> = ({
  surahs,
  selectedSurah,
  onSelectSurah,
  isLoading,
  error,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Format surah number: "01 — Al-Fatihah"
  const formatSurahLabel = (s: Surah) => {
    const num = s.number.toString().padStart(2, '0');
    return `${num} — ${s.name_latin || s.name}`;
  };

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.toLowerCase().trim();
    return surahs.filter((s) => {
      const matchNumber = s.number.toString() === q || s.number.toString().padStart(2, '0') === q;
      const matchLatin = (s.name_latin || '').toLowerCase().includes(q);
      const matchName = (s.name || '').toLowerCase().includes(q);
      const matchTrans = (s.translation || '').toLowerCase().includes(q);
      const matchArabic = (s.name_arabic || '').includes(q);
      return matchNumber || matchLatin || matchName || matchTrans || matchArabic;
    });
  }, [surahs, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-[#121814] border border-emerald-950/60 flex flex-col items-center justify-center min-h-[140px] text-center space-y-3">
        <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
        <p className="text-xs font-medium text-emerald-300/80">Memuat daftar surat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-[#121814] border border-red-950/50 flex flex-col items-center justify-center min-h-[140px] text-center space-y-3">
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
    <div className="flex flex-col space-y-3">
      {/* Dropdown Toggle Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#121814] hover:bg-[#161f1a] border border-emerald-900/30 hover:border-emerald-600/40 text-left transition-all duration-150 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center shrink-0 text-emerald-400 font-medium text-xs">
              {selectedSurah ? selectedSurah.number.toString().padStart(2, '0') : '--'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">Pilih Surat</span>
              <span className="block text-sm font-semibold text-white truncate">
                {selectedSurah ? formatSurahLabel(selectedSurah) : 'Pilih Surat Al-Qur\'an'}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu & Search */}
        {isOpen && (
          <div className="absolute z-40 mt-1.5 w-full bg-[#121814] border border-emerald-800/50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-80">
            {/* Search Input */}
            <div className="p-2.5 border-b border-emerald-950 bg-[#0e1410] sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-emerald-400/80 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik Al-Fatihah, Fatihah, atau nomor..."
                  className="w-full bg-[#162019] text-xs text-white placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg border border-emerald-900/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Surah List */}
            <div className="overflow-y-auto divide-y divide-emerald-950/40 flex-1">
              {filteredSurahs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Surat tidak ditemukan
                </div>
              ) : (
                filteredSurahs.map((surah) => {
                  const isSelected = selectedSurah?.number === surah.number;
                  return (
                    <button
                      key={surah.number}
                      type="button"
                      onClick={() => {
                        onSelectSurah(surah);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between p-3 text-left transition-colors duration-150 ${
                        isSelected
                          ? 'bg-emerald-900/30 text-white'
                          : 'hover:bg-emerald-950/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono text-emerald-400/80 w-6 shrink-0">
                          {surah.number.toString().padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-100 truncate">
                            {surah.name_latin || surah.name}
                          </span>
                          <span className="block text-[11px] text-slate-400 truncate">
                            {surah.translation} · {surah.number_of_ayahs} Ayat
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-arabic text-emerald-400/90 dir-rtl">
                          {surah.name_arabic || surah.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Surah Metadata Card as requested in Section 7 */}
      {selectedSurah && (
        <div className="p-3.5 rounded-xl bg-[#121814]/90 border border-emerald-900/30 text-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-bold font-arabic text-emerald-300 leading-snug">
                {selectedSurah.name_arabic || selectedSurah.name}
              </p>
              <h3 className="text-sm font-semibold text-white mt-0.5">
                {selectedSurah.name_latin || selectedSurah.name}
              </h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-medium">
              {selectedSurah.revelation}
            </span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-950 flex items-center justify-between text-xs text-slate-300">
            <span className="text-slate-400">{selectedSurah.translation}</span>
            <span className="font-medium text-emerald-400 font-mono">
              {selectedSurah.number_of_ayahs} Ayat
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
