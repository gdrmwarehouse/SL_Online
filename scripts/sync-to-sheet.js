// scripts/sync-to-sheet.js
// Dijalankan oleh GitHub Actions (lihat .github/workflows/sync-to-sheet.yml)
// Tidak berhubungan sama sekali dengan Google Apps Script akun pribadi kamu —
// ini pakai service account terpisah lewat Google Sheets API.

const { google } = require('googleapis');

const SHEET_BY_PLANT = {
  1111: 'SL_1111',
  1112: 'SL_1112',
  1113: 'SL_1113'
};

async function main() {
  const row = JSON.parse(process.env.ROW_JSON).record; // Supabase kirim { type, table, record, old_record }
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const spreadsheetId = process.env.SPREADSHEET_ID;

  const sheetName = SHEET_BY_PLANT[row.plant];
  if (!sheetName) {
    console.log('Plant tidak dikenali, dilewati:', row.plant);
    return;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Urutan kolom ini HARUS sama dengan urutan kolom yang sudah ada di sheet
  const values = [[
    '', // A: no urut — biarkan kosong / diisi manual, tidak dipakai skrip ini
    row.plant,
    row.no_ritase,
    row.tanggal_kedatangan,
    row.tanggal_keluar,
    row.jam_masuk,
    row.jam_qc,
    row.jam_start_bongkar,
    row.jam_selesai_bongkar,
    row.jam_keluar,
    row.lama_bongkar_menit,
    row.nopol_mobil,
    row.no_sku,
    '', // nama RM — biarkan VLOOKUP lama yang isi kalau kolomnya masih dipakai
    row.merk_rm,
    row.produsen,
    row.nomor_po,
    row.dokumen_gr,
    row.no_batch,
    row.jumlah_rm,
    row.jumlah_berat,
    row.nama_supplier,
    row.expired_date,
    row.keterangan,
    row.status_approved,
    row.note
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values }
  });

  console.log(`Baris batch ${row.no_batch} berhasil ditambahkan ke ${sheetName}`);
}

main().catch(err => {
  console.error('Gagal sync ke sheet:', err.message);
  process.exit(1);
});
