import { Ayah, MyQuranApiResponse, Surah, SurahDetail } from '../types/quran';

export const MYQURAN_BASE_URL = 'https://api.myquran.com/v3';

// Standard 114 Surah Arabic names in authentic Uthmani calligraphy script
export const SURAH_ARABIC_NAMES: Record<number, string> = {
  1: 'الفَاتِحَة',
  2: 'البَقَرَة',
  3: 'آلِ عِمْرَان',
  4: 'النِّسَاء',
  5: 'المَائِدَة',
  6: 'الأَنْعَام',
  7: 'الأَعْرَاف',
  8: 'الأَنْفَال',
  9: 'التَّوْبَة',
  10: 'يُونُس',
  11: 'هُود',
  12: 'يُوسُف',
  13: 'الرَّعْد',
  14: 'إِبْرَاهِيم',
  15: 'الحِجْر',
  16: 'النَّحْل',
  17: 'الإِسْرَاء',
  18: 'الكَهْف',
  19: 'مَرْيَم',
  20: 'طه',
  21: 'الأَنْبِيَاء',
  22: 'الحَجّ',
  23: 'المُؤْمِنُون',
  24: 'النُّور',
  25: 'الفُرْقَان',
  26: 'الشُّعَرَاء',
  27: 'النَّمْل',
  28: 'القَصَص',
  29: 'العَنْكَبُوت',
  30: 'الرُّوم',
  31: 'لُقْمَان',
  32: 'السَّجْدَة',
  33: 'الأَحْزَاب',
  34: 'سَبَأ',
  35: 'فَاطِر',
  36: 'يس',
  37: 'الصَّافَّات',
  38: 'ص',
  39: 'الزُّمَر',
  40: 'غَافِر',
  41: 'فُصِّلَت',
  42: 'الشُّورَى',
  43: 'الزُّخْرُف',
  44: 'الدُّخَان',
  45: 'الجَاثِيَة',
  46: 'الأَحْقَاف',
  47: 'مُحَمَّد',
  48: 'الفَتْح',
  49: 'الحُجُرَات',
  50: 'ق',
  51: 'الذَّارِيَات',
  52: 'الطُّور',
  53: 'النَّجْم',
  54: 'القَمَر',
  55: 'الرَّحْمَن',
  56: 'الوَاقِعَة',
  57: 'الحَدِيد',
  58: 'المُجَادَلَة',
  59: 'الحَشْر',
  60: 'المُمْتَحَنَة',
  61: 'الصَّفّ',
  62: 'الجُمُعَة',
  63: 'المُنَافِقُون',
  64: 'التَّغَابُن',
  65: 'الطَّلَاق',
  66: 'التَّحْرِيم',
  67: 'المُلْك',
  68: 'القَلَم',
  69: 'الحَاقَّة',
  70: 'المَعَارِج',
  71: 'نُوح',
  72: 'الجِنّ',
  73: 'المُزَّمِّل',
  74: 'المُدَّثِّر',
  75: 'القِيَامَة',
  76: 'الإِنْسَان',
  77: 'المُرْسَلَات',
  78: 'النَّبَأ',
  79: 'النَّازِعَات',
  80: 'عَبَس',
  81: 'التَّكْوِير',
  82: 'الانْفِطَار',
  83: 'المُطَفِّفِين',
  84: 'الانْشِقَاق',
  85: 'البُرُوج',
  86: 'الطَّارِق',
  87: 'الأَعْلَى',
  88: 'الغَاشِيَة',
  89: 'الفَجْر',
  90: 'البَلَد',
  91: 'الشَّمْس',
  92: 'اللَّيْل',
  93: 'الضُّحَى',
  94: 'الشَّرْح',
  95: 'التِّين',
  96: 'العَلَق',
  97: 'القَدْر',
  98: 'البَيِّنَة',
  99: 'الزَّلْزَلَة',
  100: 'العَادِيَات',
  101: 'القَارِعَة',
  102: 'التَّكَاثُر',
  103: 'العَصْر',
  104: 'الهُمَزَة',
  105: 'الفِيل',
  106: 'قُرَيْش',
  107: 'المَاعُون',
  108: 'الكَوْثَر',
  109: 'الكَافِرُون',
  110: 'النَّصْر',
  111: 'المَسَد',
  112: 'الإِخْلَاص',
  113: 'الفَلَق',
  114: 'النَّاس'
};

const DEFAULT_ERROR_MESSAGE = "Gagal mengambil data Al-Qur'an. Silakan coba lagi.";

/**
 * Determine endpoint URL based on execution environment:
 * In browser: calls proxy `/api/quran/...`
 * In Node / Server: calls direct `MYQURAN_BASE_URL` with safe User-Agent
 */
function isClientEnvironment(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Fetch list of all 114 Surahs
 */
export async function getSurahs(): Promise<Surah[]> {
  try {
    const url = isClientEnvironment() 
      ? '/api/quran/surahs' 
      : `${MYQURAN_BASE_URL}/quran`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MurottalSyncStudio/1.0',
    };

    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${DEFAULT_ERROR_MESSAGE}`);
    }

    const json: MyQuranApiResponse<Surah[]> = await res.json();
    if (!json || json.status === false || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(json?.message || DEFAULT_ERROR_MESSAGE);
    }

    return json.data.map((surah) => ({
      ...surah,
      name_arabic: SURAH_ARABIC_NAMES[surah.number] || surah.name,
    }));
  } catch (err: any) {
    console.error('Error fetching surahs:', err);
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }
}

/**
 * Fetch detail of a single Surah with all Ayahs
 */
export async function getSurah(surahNumber: number): Promise<SurahDetail> {
  try {
    const url = isClientEnvironment() 
      ? `/api/quran/surah/${surahNumber}` 
      : `${MYQURAN_BASE_URL}/quran/${surahNumber}`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MurottalSyncStudio/1.0',
    };

    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${DEFAULT_ERROR_MESSAGE}`);
    }

    const json: MyQuranApiResponse<SurahDetail> = await res.json();
    if (!json || json.status === false || !json.data || !Array.isArray(json.data.ayahs)) {
      throw new Error(json?.message || DEFAULT_ERROR_MESSAGE);
    }

    return {
      ...json.data,
      name_arabic: SURAH_ARABIC_NAMES[json.data.number] || json.data.name,
    };
  } catch (err: any) {
    console.error(`Error fetching surah ${surahNumber}:`, err);
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }
}

/**
 * Fetch detail of a single Ayah
 */
export async function getAyah(surahNumber: number, ayahNumber: number): Promise<Ayah> {
  try {
    const url = isClientEnvironment() 
      ? `/api/quran/ayah/${surahNumber}/${ayahNumber}` 
      : `${MYQURAN_BASE_URL}/quran/${surahNumber}/${ayahNumber}`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MurottalSyncStudio/1.0',
    };

    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${DEFAULT_ERROR_MESSAGE}`);
    }

    const json: MyQuranApiResponse<Ayah> = await res.json();
    if (!json || json.status === false || !json.data) {
      throw new Error(json?.message || DEFAULT_ERROR_MESSAGE);
    }

    return json.data;
  } catch (err: any) {
    console.error(`Error fetching ayah ${surahNumber}:${ayahNumber}:`, err);
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }
}
