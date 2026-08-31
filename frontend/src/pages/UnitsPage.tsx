import { useState, useEffect, useCallback } from 'react';
import { getUnits, deleteUnit } from '../api/units';
import UnitFormModal from '../components/UnitFormModal';
import { Unit } from '../types';

const fmt = (n: number | string) =>
  Number(n).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

export default function UnitsPage() {
  const [units, setUnits]         = useState<Unit[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState({ plat_nomor: '', tipe_merk: '', status: '' });
  const [modal, setModal]         = useState<{ open: boolean; unit: Unit | null }>({ open: false, unit: null });
  const [deleting, setDeleting]   = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState<Unit | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filter).filter(([, v]) => v));
      const res = await getUnits(params);
      setUnits(res.data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (unit: Unit) => {
    setDeleting(unit.id);
    try { await deleteUnit(unit.id); await load(); }
    finally { setDeleting(null); setConfirmDel(null); }
  };

  const stats = {
    total:    units.length,
    tersedia: units.filter((u) => u.status === 'tersedia').length,
    disewa:   units.filter((u) => u.status === 'disewa').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-7">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Unit Kendaraan
          </h1>
          <p className="text-sm text-[#8b9bb4] mt-1">Kelola armada kendaraan sewa</p>
        </div>
        <button
          onClick={() => setModal({ open: true, unit: null })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-black text-sm font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          + Tambah Unit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Unit',  value: stats.total,    color: 'text-white' },
          { label: 'Tersedia',    value: stats.tersedia, color: 'text-emerald-400' },
          { label: 'Sedang Disewa', value: stats.disewa, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/4 border border-white/8 rounded-xl p-4 hover:border-[#00d4ff]/30 hover:-translate-y-0.5 transition-all">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8b9bb4]">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">

        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-white/8 flex flex-wrap items-center gap-3">
          <input
            placeholder="Plat nomor..."
            value={filter.plat_nomor}
            onChange={(e) => setFilter((f) => ({ ...f, plat_nomor: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-[#f0f6ff] text-sm placeholder:text-white/20 outline-none focus:border-[#00d4ff]/50 transition-all w-44"
          />
          <input
            placeholder="Tipe / merk..."
            value={filter.tipe_merk}
            onChange={(e) => setFilter((f) => ({ ...f, tipe_merk: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-[#f0f6ff] text-sm placeholder:text-white/20 outline-none focus:border-[#00d4ff]/50 transition-all w-44"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-[#f0f6ff] text-sm outline-none focus:border-[#00d4ff]/50 transition-all cursor-pointer"
          >
            <option value="" className="bg-[#111827]">Semua Status</option>
            <option value="tersedia" className="bg-[#111827]">Tersedia</option>
            <option value="disewa"   className="bg-[#111827]">Disewa</option>
          </select>
          {(filter.plat_nomor || filter.tipe_merk || filter.status) && (
            <button
              onClick={() => setFilter({ plat_nomor: '', tipe_merk: '', status: '' })}
              className="px-3 py-2 rounded-lg text-[#8b9bb4] hover:text-white text-sm transition-all cursor-pointer border-none bg-transparent"
            >
              ✕ Reset
            </button>
          )}
          <span className="ml-auto text-xs text-[#4a5568]">{units.length} unit</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-[#8b9bb4]">
              <span className="spinner" /> Memuat data...
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3 opacity-30">🚗</div>
              <p className="text-[#8b9bb4] font-medium">Tidak ada unit ditemukan</p>
              <p className="text-[#4a5568] text-sm mt-1">Coba ubah filter atau tambah unit baru</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Plat Nomor', 'Tipe / Merk', 'Harga / Hari', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8b9bb4]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-3.5 font-semibold text-[#00d4ff] font-mono tracking-wide">{u.plat_nomor}</td>
                    <td className="px-5 py-3.5 text-[#f0f6ff]">{u.tipe_merk}</td>
                    <td className="px-5 py-3.5 text-[#f0f6ff]">{fmt(u.harga_sewa_per_hari)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${u.status === 'tersedia'
                          ? 'bg-emerald-500/12 text-emerald-400'
                          : 'bg-amber-500/12 text-amber-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'tersedia' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {u.status === 'tersedia' ? 'Tersedia' : 'Disewa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal({ open: true, unit: u })}
                          className="px-3 py-1.5 rounded-md bg-white/5 border border-white/8 text-[#f0f6ff] text-xs hover:bg-white/10 transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDel(u)}
                          className="px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Unit form modal */}
      <UnitFormModal
        isOpen={modal.open}
        unit={modal.unit}
        onClose={() => setModal({ open: false, unit: null })}
        onSaved={load}
      />

      {/* Confirm delete modal */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="animate-modal w-full max-w-sm bg-[#111827] border border-white/8 rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-[#f0f6ff] text-base mb-2">Hapus Unit?</h3>
            <p className="text-[#8b9bb4] text-sm mb-5">
              Unit <span className="text-[#f0f6ff] font-semibold">{confirmDel.plat_nomor}</span> akan dihapus permanen.
              Semua booking terkait juga ikut terhapus.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDel(null)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-sm font-medium text-[#f0f6ff] hover:bg-white/10 transition-all cursor-pointer">
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDel)}
                disabled={deleting === confirmDel.id}
                className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {deleting === confirmDel.id && <span className="spinner" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
