const MYQURAN_BASE_URL = 'https://api.myquran.com/v3';
const DEFAULT_ERROR_MESSAGE = "Gagal mengambil data Al-Qur'an. Silakan coba lagi.";

export async function GET(
  _request: Request, 
  { params }: { params: Promise<{ surah: string; ayah: string }> | { surah: string; ayah: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { surah, ayah } = resolvedParams;

    const res = await fetch(`${MYQURAN_BASE_URL}/quran/${surah}/${ayah}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MurottalSyncStudio/1.0',
      },
    });

    if (!res.ok) {
      return Response.json({ status: false, message: DEFAULT_ERROR_MESSAGE }, { status: res.status });
    }

    const data = await res.json();
    if (!data || data.status === false || !data.data) {
      return Response.json({ status: false, message: DEFAULT_ERROR_MESSAGE }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ status: false, message: DEFAULT_ERROR_MESSAGE }, { status: 500 });
  }
}
