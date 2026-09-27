/**
 * Audio helpers and presets for Murottal Sync Studio
 */

export const PLAYBACK_RATES: number[] = [0.5, 0.75, 1, 1.25, 1.5];

/**
 * Format seconds into mm:ss format (e.g. 03:25)
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ss = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  return `${mm}:${ss}`;
}
