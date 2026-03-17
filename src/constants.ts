export enum AppMode {
  LANDING = 'LANDING',
  MODE_A = 'MODE_A',
  MODE_B = 'MODE_B',
  MODE_C = 'MODE_C'
}

export enum ServiceType {
  SURAT_AKTIF = 'SURAT_AKTIF',
  BEASISWA_GANDA = 'BEASISWA_GANDA',
  REKOMENDASI = 'REKOMENDASI',
  TRANSKRIP = 'TRANSKRIP'
}

export enum PurposeType {
  LOMBA = 'LOMBA',
  NON_LOMBA = 'NON_LOMBA'
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const KB = {
  [ServiceType.SURAT_AKTIF]: {
    [PurposeType.NON_LOMBA]: {
      title: 'Surat Keterangan Aktif Kuliah - NON LOMBA',
      prosedur: `1. Klik tautan berikut: <a href="https://s.ub.ac.id/surataktiffilkom">Buat Surat Aktif Non Lomba</a>\n2. Isi data diri dengan teliti dan cermat, baca setiap instruksi yang ada pada Google Form.\n3. Jika sudah terisi semua, lakukan validasi sekali lagi agar tidak ada yang terlewat.\n4. Jika sudah benar, klik Kirim/Submit.`,
      steps: [
        { title: 'Buka Tautan', content: 'Klik tautan berikut: <a href="https://s.ub.ac.id/surataktiffilkom">Buat Surat Aktif Non Lomba</a>', action: 'Saya sudah klik tautan' },
        { title: 'Isi Form', content: 'Isi data diri dengan teliti dan cermat pada Google Form.', action: 'Saya sudah isi form' },
        { title: 'Kirim', content: 'Validasi ulang data Anda lalu klik Kirim/Submit.', action: 'Saya sudah kirim form' }
      ]
    },
    [PurposeType.LOMBA]: {
      title: 'Surat Keterangan Aktif Kuliah - LOMBA',
      prosedur: `Data yang perlu disiapkan:\n- Nama lomba yang diikuti\n- Tanggal pelaksanaan lomba\n- Tempat pelaksanaan lomba\n- Jika berkelompok: Nama Anggota, NIM Anggota, Prodi Anggota\n\nProsedur:\n1. Klik tautan berikut: <a href="https://s.ub.ac.id/surataktiflomba">Buat Surat Aktif untuk Lomba</a>\n2. Isi data diri dengan teliti dan cermat, baca setiap instruksi pada Google Form.\n3. Validasi ulang agar tidak ada yang terlewat.\n4. Klik Kirim/Submit.`,
      steps: [
        { title: 'Persiapan Data', content: 'Siapkan data lomba (nama, tanggal, tempat) dan data anggota jika berkelompok.', action: 'Data sudah siap' },
        { title: 'Buka & Isi Form', content: 'Klik tautan: <a href="https://s.ub.ac.id/surataktiflomba">Buat Surat Aktif untuk Lomba</a> dan isi data diri.', action: 'Saya sudah isi form' },
        { title: 'Kirim', content: 'Validasi ulang data Anda lalu klik Kirim/Submit.', action: 'Saya sudah kirim form' }
      ]
    }
  },
  [ServiceType.BEASISWA_GANDA]: {
    title: 'Surat Keterangan Tidak Menerima Beasiswa Ganda',
    prosedur: `1. Unduh template dokumen melalui tautan berikut:\n   <a href="https://filkom.ub.ac.id/wp-content/uploads/2025/07/03-Surat-Pernyataan-Tidak-Menerima-Beasiswa-Ganda-2025.docx">Unduh Dokumen Template Beasiswa Ganda</a>\n2. Isi dokumen (Nama, Tempat/Tanggal Lahir, NIM, Prodi, Alamat) dan tanda tangan.\n3. Simpan dokumen menjadi PDF.\n4. Ajukan melalui tautan berikut:\n   <a href="https://s.ub.ac.id/dok-beasiswa-ganda">Ajukan Surat Tidak Menerima Beasiswa Ganda</a>\n5. Isi form dengan benar dan unggah PDF.\n6. Klik Kirim/Submit.`,
    template: '<a href="https://filkom.ub.ac.id/wp-content/uploads/2025/07/03-Surat-Pernyataan-Tidak-Menerima-Beasiswa-Ganda-2025.docx">Unduh Dokumen Template Beasiswa Ganda</a>',
    steps: [
      { title: 'Unduh & Isi', content: 'Unduh template <a href="https://filkom.ub.ac.id/wp-content/uploads/2025/07/03-Surat-Pernyataan-Tidak-Menerima-Beasiswa-Ganda-2025.docx">di sini</a>, isi, tanda tangan, dan simpan sebagai PDF.', action: 'Dokumen PDF sudah siap' },
      { title: 'Buka Form', content: 'Buka tautan: <a href="https://s.ub.ac.id/dok-beasiswa-ganda">Ajukan Surat Tidak Menerima Beasiswa Ganda</a>', action: 'Saya sudah buka form' },
      { title: 'Unggah & Kirim', content: 'Isi form dan unggah file PDF Anda, lalu klik Kirim.', action: 'Saya sudah kirim form' }
    ]
  },
  [ServiceType.REKOMENDASI]: {
    title: 'Surat Rekomendasi Beasiswa/Lomba/PKL',
    prosedur: `1. Klik tautan berikut: <a href="https://s.ub.ac.id/dok-rekomendasi">Ajukan Surat Rekomendasi</a>\n2. Isi data dengan teliti, ikuti instruksi pada Google Form.\n3. Validasi ulang agar tidak ada yang terlewat.\n4. Klik Kirim/Submit.`,
    steps: [
      { title: 'Buka Tautan', content: 'Klik tautan berikut: <a href="https://s.ub.ac.id/dok-rekomendasi">Ajukan Surat Rekomendasi</a>', action: 'Saya sudah klik tautan' },
      { title: 'Isi Data', content: 'Isi data dengan teliti sesuai instruksi pada Google Form.', action: 'Saya sudah isi data' },
      { title: 'Kirim', content: 'Validasi ulang data Anda lalu klik Kirim/Submit.', action: 'Saya sudah kirim form' }
    ]
  },
  [ServiceType.TRANSKRIP]: {
    title: 'Cetak Transkrip Nilai/KHS',
    prosedur: `1. Klik tautan berikut: <a href="https://s.ub.ac.id/filkom-transkripakademik">Ajukan Cetak Transkrip Nilai</a>\n2. Isi data dengan teliti, ikuti instruksi pada Google Form.\n3. Validasi ulang agar tidak ada yang terlewat.\n4. Klik Kirim/Submit.`,
    steps: [
      { title: 'Buka Tautan', content: 'Klik tautan berikut: <a href="https://s.ub.ac.id/filkom-transkripakademik">Ajukan Cetak Transkrip Nilai</a>', action: 'Saya sudah klik tautan' },
      { title: 'Isi Data', content: 'Isi data dengan teliti sesuai instruksi pada Google Form.', action: 'Saya sudah isi data' },
      { title: 'Kirim', content: 'Validasi ulang data Anda lalu klik Kirim/Submit.', action: 'Saya sudah kirim form' }
    ]
  }
};

export const COMMON_INFO = {
  estimasi: 'Semua pengajuan surat diproses kurang lebih 3 hari kerja. Sabtu, Minggu, dan tanggal merah tidak dihitung.',
  kontak: {
    akademik: 'WA Center akademik 08xxxxxxxxx (Surat Keterangan Aktif & Cetak Transkrip)',
    kemahasiswaan: 'WA Center kemahasiswaan : 08xxx (Surat tidak menerima beasiswa ganda & Rekomendasi beasiswa)',
    halofilkom: 'halofilkom.ub.ac.id'
  },
  tracking: '<a href="https://s.ub.ac.id/trackingkma">Tracking KMA</a>'
};

export const KENDALA = {
  step1: ['Link tidak bisa dibuka (404)', 'Halaman loading terus', 'Izin Akses ditolak'],
  step2: ['Tidak bisa upload/isi kolom', 'Tidak paham bagian tertentu'],
  step3: ['Tidak bisa klik Kirim']
};
