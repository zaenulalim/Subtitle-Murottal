import { Ayah } from '../../types/quran';
import { AyahTiming, SynchronizationEngine } from './types';

/**
 * NoAlignmentEngine (Phase 1 Foundation)
 * 
 * In Phase 1, no artificial or mock timings are generated.
 * This class establishes the contract for Phase 2, where it will be replaced
 * by ArabicAlignmentEngine with authentic speech-to-text / acoustic forced alignment.
 */
export class NoAlignmentEngine implements SynchronizationEngine {
  /**
   * Returns empty timing list as mandated by Phase 1 specification.
   * Strictly avoids artificial calculations (e.g. duration / ayah count or character ratios).
   */
  async getTiming(_ayahs: Ayah[]): Promise<AyahTiming[]> {
    return [];
  }
}

export const noAlignmentEngine = new NoAlignmentEngine();
