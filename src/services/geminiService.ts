import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey || apiKey.trim() === "") {
  console.warn("VITE_GEMINI_API_KEY is empty or undefined. Please check your .env file.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function getGroundedResponse(prompt: string) {
  try {
    
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `site:filkom.ub.ac.id ${prompt}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `Anda adalah chatbot prototipe layanan administrasi FILKOM UB.
Gunakan bahasa Indonesia yang jelas, ramah, dan mudah dipahami mahasiswa baru.
Semua link wajib dalam format HTML: <a href="URL">LABEL</a>.
Jangan mengarang link, nomor, email, atau prosedur.
Batasi informasi hanya dari domain filkom.ub.ac.id.
Jika info tidak ditemukan pada filkom.ub.ac.id, katakan: "Saya belum menemukan info resmi di filkom.ub.ac.id" lalu arahkan ke kanal bantuan resmi (WA/email) yang tersedia.

Format jawaban untuk Mode A:
- Judul layanan
- Ringkasan langkah (3–6 poin)
- Estimasi proses
- Kontak (jika ada di sumber)
- Sumber: URL filkom.ub.ac.id yang dipakai`
      },
    });

    return response.text || "Maaf, saya tidak dapat menemukan informasi tersebut.";
  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    let errorMessage = "Terjadi kesalahan saat menghubungi server.";
    if (error?.message) {
      errorMessage += ` Detail: ${error.message}`;
    }
    return `${errorMessage} Silakan coba lagi nanti.`;
  }
}
