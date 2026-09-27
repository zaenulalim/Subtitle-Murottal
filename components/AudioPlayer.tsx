import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  AlertCircle,
  Music2
} from 'lucide-react';
import { formatTime, PLAYBACK_RATES } from '../lib/audio';

interface AudioPlayerProps {
  audioUrl?: string;
  surahName?: string;
  ayahNumber?: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  surahName,
  ayahNumber,
  currentTime,
  setCurrentTime,
  duration,
  setDuration,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Synchronization loop using requestAnimationFrame as required in Section 16
  const startAnimationLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animationLoop = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    };

    animationFrameRef.current = requestAnimationFrame(animationLoop);
  }, [setCurrentTime]);

  const stopAnimationLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Sync state whenever audioUrl changes
  useEffect(() => {
    stopAnimationLoop();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(null);

    if (!audioUrl) {
      setIsLoadingAudio(false);
      return;
    }

    setIsLoadingAudio(true);
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }

    return () => {
      stopAnimationLoop();
    };
  }, [audioUrl, setCurrentTime, setDuration, stopAnimationLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimationLoop();
    };
  }, [stopAnimationLoop]);

  // Audio element listeners
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    setIsLoadingAudio(false);
  };

  const handleCanPlay = () => {
    setIsLoadingAudio(false);
  };

  const handleAudioError = () => {
    setIsLoadingAudio(false);
    setIsPlaying(false);
    stopAnimationLoop();
    setAudioError('Audio untuk ayat ini tidak tersedia.');
  };

  const handleEnded = () => {
    setIsPlaying(false);
    stopAnimationLoop();
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Playback handlers
  const handlePlay = async () => {
    if (!audioRef.current || !audioUrl) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      startAnimationLoop();
    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsPlaying(false);
      stopAnimationLoop();
      setAudioError('Audio untuk ayat ini tidak tersedia.');
    }
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    stopAnimationLoop();
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    stopAnimationLoop();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="bg-[#121814] border-t border-emerald-950/80 px-4 py-3 select-none">
      {/* Hidden Native HTMLAudioElement */}
      <audio
        ref={audioRef}
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onError={handleAudioError}
        onEnded={handleEnded}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Ayah & Track Info */}
        <div className="flex items-center gap-3 w-full md:w-64 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center shrink-0 text-emerald-400">
            <Music2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-100 truncate">
              {surahName ? `${surahName} : Ayat ${ayahNumber ?? 1}` : 'Pilih Ayat'}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {isLoadingAudio ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Memuat audio...
                </span>
              ) : audioError ? (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {audioError}
                </span>
              ) : audioUrl ? (
                <span className="text-emerald-500/90 font-mono">Audio Murottal Siap</span>
              ) : (
                'Tidak ada audio yang dipilih'
              )}
            </p>
          </div>
        </div>

        {/* Central Controls: Play, Pause, Stop, Seekbar */}
        <div className="flex-1 w-full max-w-2xl flex flex-col items-center gap-1.5">
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Stop Button */}
            <button
              type="button"
              onClick={handleStop}
              disabled={!audioUrl || isLoadingAudio}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950/40 disabled:opacity-40 transition-colors"
              title="Stop"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={!audioUrl || isLoadingAudio}
              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 disabled:opacity-40 transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Seekbar and Current Time / Duration */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.05}
                value={currentTime}
                onChange={handleSeek}
                disabled={!audioUrl || duration === 0}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[#18231c] rounded-lg disabled:opacity-40"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400 w-10 text-left shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Tools: Volume & Speed Presets */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-emerald-400 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 accent-emerald-500 cursor-pointer h-1.5 bg-[#18231c] rounded-lg"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Playback Speed Segmented Buttons as specified in Section 9 */}
          <div className="flex items-center bg-[#0d1410] border border-emerald-950 rounded-lg p-0.5">
            {PLAYBACK_RATES.map((rate) => {
              const isActive = playbackRate === rate;
              return (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950/40'
                  }`}
                >
                  {rate}x
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
