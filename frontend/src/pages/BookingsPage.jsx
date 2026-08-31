import { useState, useEffect, useCallback } from 'react';
import { getBookings } from '../api/bookings';
import BookingFormModal from '../components/BookingFormModal';

const fmt = (n) =>
  Number(n).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await getBookings(); setBookings(res.data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = bookings.reduce((s, b) => s + Number(b.total_harga), 0);
  const withDiscount = bookings.filter((b) => Number(b.diskon_persen) > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-7">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Pemesanan Sewa
          </h1>
          <p className="text-sm text-[#8b9bb4] mt-1">Riwayat dan manajemen booking</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-black text-sm font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          + Buat Booking
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Booking',   value: bookings.length, color: 'text-white' },
          { label: 'Total Pendapatan', value: fmt(totalRevenue), color: 'text-[#00d4ff]' },
          { label: 'Dapat Diskon',    value: withDiscount,    color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/4 border border-white/8 rounded-xl p-4 hover:border-[#00d4ff]/30 hover:-translate-y-0.5 transition-all">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8b9bb4]">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color} truncate`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#f0f6ff]">Semua Booking</p>
          <span className="text-xs text-[#4a5568]">{bookings.length} record</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-[#8b9bb4]">
              <span className="spinner" /> Memuat data...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3 opacity-30">📋</div>
              <p className="text-[#8b9bb4] font-medium">Belum ada booking</p>
              <p className="text-[#4a5568] text-sm mt-1">Buat booking pertama dengan tombol di atas</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Unit', 'Tanggal Mulai', 'Tanggal Selesai', 'Durasi', 'Harga Normal', 'Diskon', 'Total'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8b9bb4] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-[#00d4ff] font-mono tracking-wide">{b.unit?.plat_nomor ?? '—'}</p>
                        <p className="text-xs text-[#8b9bb4] mt-0.5">{b.unit?.tipe_merk ?? ''}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#f0f6ff] whitespace-nowrap">{fmtDate(b.tanggal_mulai)}</td>
                    <td className="px-5 py-3.5 text-[#f0f6ff] whitespace-nowrap">{fmtDate(b.tanggal_selesai)}</td>
                    <td className="px-5 py-3.5 text-[#f0f6ff]">{b.durasi_hari}h</td>
                    <td className="px-5 py-3.5 text-[#8b9bb4]">{fmt(b.harga_sebelum_diskon)}</td>
                    <td className="px-5 py-3.5">
                      {Number(b.diskon_persen) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/12 text-emerald-400">
                          −{b.diskon_persen}%
                        </span>
                      ) : (
                        <span className="text-[#4a5568] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#f0f6ff]">{fmt(b.total_harga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <BookingFormModal
        isOpen={modal}
        onClose={() => setModal(false)}
        onSaved={load}
      />
    </div>
  );
}
