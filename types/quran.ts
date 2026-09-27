export interface Surah {
  number: number;
  name: string;
  name_latin: string;
  number_of_ayahs: number;
  translation: string;
  revelation: string;
  audio_url?: string;
  description?: string;
  name_arabic?: string;
}

export interface AyahTafsir {
  kemenag?: {
    short?: string;
    long?: string;
  };
  [key: string]: any;
}

export interface Ayah {
  id: number;
  surah_number: number;
  ayah_number: number;
  arab: string;
  translation?: string;
  audio_url?: string;
  image_url?: string;
  tafsir?: AyahTafsir;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

export interface MyQuranApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}
