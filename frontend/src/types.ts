export interface Unit {
  id: number;
  plat_nomor: string;
  tipe_merk: string;
  harga_sewa_per_hari: number | string;
  status: 'tersedia' | 'disewa';
}

export interface Booking {
  id: number;
  unit_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_hari: number;
  harga_sebelum_diskon: number | string;
  diskon_persen: number | string;
  total_harga: number | string;
  unit?: Unit;
}

export interface BookingPricing {
  durasi_hari: number;
  harga_sebelum_diskon: number;
  diskon_persen: number;
  total_harga: number;
}
