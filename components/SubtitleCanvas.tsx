import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Line } from 'react-konva';
import { Ayah, Surah } from '../types/quran';
import { Settings, Sliders, Palette, Type, Clock } from 'lucide-react';
import { formatTime } from '../lib/audio';

interface SubtitleCanvasProps {
  surah: Surah | null;
  ayah: Ayah | null;
  currentTime: number;
  duration: number;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  arabicColor: string;
  setArabicColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

// Convert 1, 2, 3 to Arabic numerals: ١, ٢, ٣
function toArabicIndic(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((d) => arabicDigits[parseInt(d, 10)] ?? d)
    .join('');
}

export const SubtitleCanvas: React.FC<SubtitleCanvasProps> = ({
  surah,
  ayah,
  currentTime,
  duration,
  arabicFontSize,
  setArabicFontSize,
  arabicColor,
  setArabicColor,
  backgroundColor,
  setBackgroundColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 360, height: 640, scale: 360 / 1080 });
  const [showSettings, setShowSettings] = useState(false);

  // Default internal resolution: 1080 x 1920 (9:16)
  const VIRTUAL_WIDTH = 1080;
  const VIRTUAL_HEIGHT = 1920;

  // Responsive scaling to fit container while strictly keeping 9:16 ratio
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Calculate max width and height fitting in the container with 9:16 ratio
      let targetHeight = clientHeight - 24; // padding
      let targetWidth = targetHeight * (9 / 16);

      if (targetWidth > clientWidth - 24) {
        targetWidth = clientWidth - 24;
        targetHeight = targetWidth * (16 / 9);
      }

      // Bound minimum sizes
      targetWidth = Math.max(240, targetWidth);
      targetHeight = Math.max(426, targetHeight);

      const scale = targetWidth / VIRTUAL_WIDTH;

      setStageDimensions({
        width: targetWidth,
        height: targetHeight,
        scale,
      });
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const surahNameLatin = surah ? (surah.name_latin || surah.name).toUpperCase() : 'SURAT';
  const surahNameArabic = surah?.name_arabic || '';
  const ayahArabText = ayah ? ayah.arab : 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ';
  const ayahNumberStr = ayah ? toArabicIndic(ayah.ayah_number) : '١';

  // Internal font size scaled to 1080 canvas width
  // When arabicFontSize is 70px in UI, canvas internal size is ~70px
  const internalFontSize = arabicFontSize;

  const BG_COLOR_OPTIONS = [
    { label: 'Dark Charcoal', value: '#0B0F0D' },
    { label: 'Deep Emerald', value: '#081710' },
    { label: 'Obsidian Night', value: '#070908' },
    { label: 'Navy Midnight', value: '#0A111E' },
  ];

  const TEXT_COLOR_OPTIONS = [
    { label: 'Pure White', value: '#FFFFFF' },
    { label: 'Warm Cream', value: '#FEF3C7' },
    { label: 'Golden Amber', value: '#FCD34D' },
    { label: 'Emerald Mint', value: '#6EE7B7' },
  ];

  const FONT_SIZE_STEPS = [40, 50, 60, 70, 80, 90, 100];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 relative">
      {/* Top Bar for Canvas Preview Controls */}
      <div className="flex items-center justify-between pb-3 px-1 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Preview Canvas
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-900/50">
            9:16 · 1080×1920
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio position indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#121814] px-2.5 py-1 rounded-lg border border-emerald-950">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showSettings
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#121814] hover:bg-[#18221b] text-slate-300 border-emerald-950'
            }`}
            title="Pengaturan Canvas"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Overlay Drawer */}
      {showSettings && (
        <div className="absolute top-12 right-2 z-30 w-72 bg-[#121814]/95 backdrop-blur-md border border-emerald-800/60 rounded-xl p-4 shadow-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Canvas Settings
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Arabic Font Size Slider (40px - 100px) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-emerald-400" />
                Arabic Font Size
              </span>
              <span className="font-mono text-emerald-400 font-semibold">{arabicFontSize}px</span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={10}
              value={arabicFontSize}
              onChange={(e) => setArabicFontSize(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[#1a251f] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono px-0.5">
              {FONT_SIZE_STEPS.map((s) => (
                <span
                  key={s}
                  onClick={() => setArabicFontSize(s)}
                  className={`cursor-pointer hover:text-emerald-400 ${
                    arabicFontSize === s ? 'text-emerald-400 font-bold' : ''
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Arabic Color */}
          <div className="space-y-1.5">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              Arabic Color
            </span>
            <div className="flex items-center gap-2">
              {TEXT_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setArabicColor(c.value)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    arabicColor === c.value ? 'ring-2 ring-emerald-400 scale-110' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
              <input
                type="color"
                value={arabicColor}
                onChange={(e) => setArabicColor(e.target.value)}
                className="w-6 h-6 rounded border border-slate-700 cursor-pointer bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-1.5">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              Background Color
            </span>
            <div className="flex items-center gap-2">
              {BG_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setBackgroundColor(c.value)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    backgroundColor === c.value ? 'ring-2 ring-emerald-400 scale-110' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-6 h-6 rounded border border-slate-700 cursor-pointer bg-transparent"
                title="Custom color"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Container maintaining 9:16 aspect ratio */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center min-h-0 bg-[#090d0b] rounded-2xl border border-emerald-950/60 p-3 overflow-hidden shadow-inner"
      >
        <div
          className="relative rounded-xl overflow-hidden shadow-2xl border border-emerald-900/40"
          style={{
            width: `${stageDimensions.width}px`,
            height: `${stageDimensions.height}px`,
          }}
        >
          <Stage
            width={stageDimensions.width}
            height={stageDimensions.height}
            scaleX={stageDimensions.scale}
            scaleY={stageDimensions.scale}
          >
            <Layer>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={VIRTUAL_WIDTH}
                height={VIRTUAL_HEIGHT}
                fill={backgroundColor}
              />

              {/* Subtle Islamic Geometric Header Border */}
              <Group x={0} y={160}>
                {/* Thin decorative rule */}
                <Line
                  points={[120, 0, 960, 0]}
                  stroke="#10B981"
                  strokeWidth={2}
                  opacity={0.3}
                />
                
                {/* Surah Latin Header */}
                <Text
                  text={surahNameLatin}
                  x={120}
                  y={40}
                  width={840}
                  align="center"
                  fontSize={40}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontStyle="bold"
                  fill="#10B981"
                  letterSpacing={6}
                />

                {/* Surah Arabic Calligraphy */}
                {surahNameArabic && (
                  <Text
                    text={surahNameArabic}
                    x={120}
                    y={100}
                    width={840}
                    align="center"
                    fontSize={52}
                    fontFamily="'Amiri', 'Scheherazade New', serif"
                    fill="#34D399"
                    opacity={0.8}
                  />
                )}

                <Line
                  points={[240, 190, 840, 190]}
                  stroke="#10B981"
                  strokeWidth={1}
                  opacity={0.2}
                />
              </Group>

              {/* Central Content: Arabic Ayah Text */}
              <Group x={80} y={480}>
                <Text
                  text={ayahArabText}
                  x={0}
                  y={0}
                  width={920}
                  align="center"
                  fontSize={internalFontSize}
                  fontFamily="'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif"
                  fill={arabicColor}
                  lineHeight={2.2}
                  wrap="word"
                  padding={20}
                  shadowColor="rgba(0,0,0,0.6)"
                  shadowBlur={10}
                  shadowOffsetX={0}
                  shadowOffsetY={4}
                />
              </Group>

              {/* Bottom Ornate Ayah Number Indicator */}
              <Group x={VIRTUAL_WIDTH / 2} y={1500}>
                {/* Outer decorative ring */}
                <Circle
                  radius={64}
                  stroke="#10B981"
                  strokeWidth={2.5}
                  opacity={0.5}
                />
                <Circle
                  radius={56}
                  stroke="#34D399"
                  strokeWidth={1}
                  opacity={0.3}
                />
                {/* Arabic Indic Ayah Number */}
                <Text
                  text={ayahNumberStr}
                  x={-50}
                  y={-32}
                  width={100}
                  align="center"
                  fontSize={46}
                  fontFamily="'Amiri', 'Scheherazade New', serif"
                  fontStyle="bold"
                  fill="#34D399"
                />
              </Group>

              {/* Footer Studio Subtitle Label */}
              <Text
                text="MUROTTAL SYNC STUDIO"
                x={120}
                y={1800}
                width={840}
                align="center"
                fontSize={24}
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fill="#475569"
                letterSpacing={5}
                opacity={0.6}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};
