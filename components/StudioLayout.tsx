import React, { useState, useEffect, useCallback } from 'react';
import { Surah, Ayah, SurahDetail } from '../types/quran';
import { getSurahs, getSurah } from '../lib/myquran';
import { QuranSelector } from './QuranSelector';
import { AyahList } from './AyahList';
import { SubtitleCanvas } from './SubtitleCanvas';
import { AudioPlayer } from './AudioPlayer';
import { Disc3, Layers } from 'lucide-react';

export const StudioLayout: React.FC = () => {
  // Surah list state
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isSurahsLoading, setIsSurahsLoading] = useState(true);
  const [surahsError, setSurahsError] = useState<string | null>(null);

  // Selected Surah & Ayahs state
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isAyahsLoading, setIsAyahsLoading] = useState(false);
  const [ayahsError, setAyahsError] = useState<string | null>(null);

  // Selected Ayah state
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);

  // Canvas Settings State
  const [arabicFontSize, setArabicFontSize] = useState<number>(70);
  const [arabicColor, setArabicColor] = useState<string>('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState<string>('#0B0F0D');

  // Audio Timing State (shared with Canvas for Phase 2 readiness)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Fetch all 114 Surahs
  const fetchSurahsList = useCallback(async () => {
    setIsSurahsLoading(true);
    setSurahsError(null);
    try {
      const data = await getSurahs();
      setSurahs(data);

      // Auto-select Al-Fatihah (Surah 1) on initial load as test requirement
      if (data.length > 0 && !selectedSurah) {
        const firstSurah = data[0];
        setSelectedSurah(firstSurah);
        loadSurahAyahs(firstSurah.number);
      }
    } catch (err: any) {
      setSurahsError(err.message || "Gagal mengambil data Al-Qur'an. Silakan coba lagi.");
    } finally {
      setIsSurahsLoading(false);
    }
  }, []);

  // Fetch Ayahs for a given Surah
  const loadSurahAyahs = async (surahNumber: number) => {
    setIsAyahsLoading(true);
    setAyahsError(null);
    try {
      const detail: SurahDetail = await getSurah(surahNumber);
      setAyahs(detail.ayahs || []);
      
      // Auto-select Ayah 1 of the selected surah
      if (detail.ayahs && detail.ayahs.length > 0) {
        setSelectedAyah(detail.ayahs[0]);
      } else {
        setSelectedAyah(null);
      }
    } catch (err: any) {
      setAyahsError(err.message || "Gagal mengambil data Al-Qur'an. Silakan coba lagi.");
      setAyahs([]);
      setSelectedAyah(null);
    } finally {
      setIsAyahsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurahsList();
  }, [fetchSurahsList]);

  // Handle Surah Selection change
  const handleSelectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setCurrentTime(0);
    setDuration(0);
    loadSurahAyahs(surah.number);
  };

  // Handle Ayah Selection change
  const handleSelectAyah = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0F0D] text-slate-100 font-sans">
      {/* Top Bar Header */}
      <header className="h-14 border-b border-emerald-950/80 bg-[#121814]/90 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Disc3 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Murottal Sync Studio
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                Phase 1
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="hidden sm:flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Format: 9:16 Vertical Video</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Desktop Sidebar (320px) / Mobile Top section */}
        <aside className="w-full md:w-[340px] shrink-0 border-b md:border-b-0 md:border-r border-emerald-950/80 bg-[#0e1410] p-4 flex flex-col space-y-4 overflow-y-auto max-h-[40vh] md:max-h-none md:h-full">
          <div className="pb-1">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Quran Source
            </h2>
            <p className="text-[11px] text-slate-500">
              Data resmi myQuran v3 API
            </p>
          </div>

          {/* Surah Selector */}
          <QuranSelector
            surahs={surahs}
            selectedSurah={selectedSurah}
            onSelectSurah={handleSelectSurah}
            isLoading={isSurahsLoading}
            error={surahsError}
            onRetry={fetchSurahsList}
          />

          {/* Ayah List */}
          <AyahList
            surah={selectedSurah}
            ayahs={ayahs}
            selectedAyah={selectedAyah}
            onSelectAyah={handleSelectAyah}
            isLoading={isAyahsLoading}
            error={ayahsError}
            onRetry={() => selectedSurah && loadSurahAyahs(selectedSurah.number)}
          />
        </aside>

        {/* Center: Canvas Preview (9:16) */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 p-3 sm:p-5 bg-[#0B0F0D]">
          <SubtitleCanvas
            surah={selectedSurah}
            ayah={selectedAyah}
            currentTime={currentTime}
            duration={duration}
            arabicFontSize={arabicFontSize}
            setArabicFontSize={setArabicFontSize}
            arabicColor={arabicColor}
            setArabicColor={setArabicColor}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
          />
        </main>
      </div>

      {/* Bottom: Audio Player (HTML5 Audio with requestAnimationFrame sync loop) */}
      <footer className="shrink-0 z-20">
        <AudioPlayer
          audioUrl={selectedAyah?.audio_url || selectedSurah?.audio_url}
          surahName={selectedSurah?.name_latin || selectedSurah?.name}
          ayahNumber={selectedAyah?.ayah_number}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          duration={duration}
          setDuration={setDuration}
        />
      </footer>
    </div>
  );
};
