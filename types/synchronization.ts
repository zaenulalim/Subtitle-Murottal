import { Ayah } from './quran';

export interface AyahTiming {
  ayahNumber: number;
  start: number;
  end: number;
}

export interface SynchronizationEngine {
  getTiming(ayahs: Ayah[]): Promise<AyahTiming[]>;
}
