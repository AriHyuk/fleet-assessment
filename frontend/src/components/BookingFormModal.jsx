import { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { createBooking, previewBooking } from '../api/bookings';
import { getUnits } from '../api/units';

const fmt = (n) =>
  Number(n).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const today = () => new Date().toISOString().slice(0, 10);

export default function BookingFormModal({ isOpen, onClose, onSaved }) {
  const [form, setForm]         = useState({ unit_id: '', tanggal_mulai: today(), tanggal_selesai: '' });
  const [units, setUnits]       = useState([]);
  const [preview, setPreview]   = useState(null);
  const [errors, setErrors]     = useState({});
  const [overlap, setOverlap]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [previewing, setPreviewing] = useState(false);

  /* Load units once */
  useEffect(() => {
    if (isOpen) {
      setForm({ unit_id: '', tanggal_mulai: today(), tanggal_selesai: '' });
      setPreview(null); setErrors({}); setOverlap('');
      getUnits({ status: 'tersedia' }).then((r) => setUnits(r.data)).catch(() => {});
    }
  }, [isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  /* Live preview — debounced on form change */
  const fetchPreview = useCallback(async (f) => {
    if (!f.unit_id || !f.tanggal_mulai || !f.tanggal_selesai) { setPreview(null); return; }
    if (f.tanggal_selesai < f.tanggal_mulai) { setPreview(null); return; }
    setPreviewing(true);
    try {
      const res = await previewBooking(f);
      setPreview(res.data);
    } catch {
      setPreview(null);
    } finally {
      setPreviewing(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPreview(form), 400);
    return () => clearTimeout(t);
  }, [form, fetchPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrors({}); setOverlap('');
    try {
      await createBooking(form);
      onSaved();
      onClose();
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors ?? {});
      else if (err.response?.status === 409) setOverlap(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (name) =>
    `w-full px-3.5 py-2.5 rounded-lg bg-white/5 border text-[#f0f6ff] text-sm outline-none transition-all
     ${errors[name] ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-white/8 focus:border-[#00d4ff]/60 focus:ring-2 focus:ring-[#00d4ff]/20'}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Pemesanan Baru" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Unit select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8b9bb4]">Unit Kendaraan</label>
            <select value={form.unit_id} onChange={set('unit_id')}
              className={`${inputCls('unit_id')} cursor-pointer`}>
              <option value="" className="bg-[#111827]">— Pilih kendaraan —</option>
              {units.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#111827]">
                  {u.plat_nomor} — {u.tipe_merk} ({fmt(u.harga_sewa_per_hari)}/hari)
                </option>
              ))}
            </select>
            {errors.unit_id && <span className="text-xs text-red-400">{errors.unit_id[0]}</span>}
          </div>

          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#8b9bb4]">Tanggal Mulai</label>
              <input type="date" value={form.tanggal_mulai} onChange={set('tanggal_mulai')} min={today()}
                className={inputCls('tanggal_mulai')} />
              {errors.tanggal_mulai && <span className="text-xs text-red-400">{errors.tanggal_mulai[0]}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#8b9bb4]">Tanggal Selesai</label>
              <input type="date" value={form.tanggal_selesai} onChange={set('tanggal_selesai')}
                min={form.tanggal_mulai || today()}
                className={inputCls('tanggal_selesai')} />
              {errors.tanggal_selesai && <span className="text-xs text-red-400">{errors.tanggal_selesai[0]}</span>}
            </div>
          </div>

          {/* Overlap error */}
          {overlap && (
            <div className="animate-fadeIn px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2 items-start">
              <span className="mt-0.5">⚠️</span>
              <span>{overlap}</span>
            </div>
          )}

          {/* Live price preview */}
          {previewing && (
            <div className="flex items-center gap-2 text-[#8b9bb4] text-sm">
              <span className="spinner" /> Menghitung harga...
            </div>
          )}

          {preview && !previewing && (
            <div className="animate-fadeIn rounded-xl border border-[#00d4ff]/20 bg-gradient-to-br from-[#00d4ff]/5 to-[#7c3aed]/5 px-5 py-4 flex flex-col gap-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8b9bb4]">Estimasi Harga</p>

              <div className="flex justify-between text-sm text-[#8b9bb4]">
                <span>Durasi</span>
                <span className="text-[#f0f6ff] font-medium">{preview.pricing.durasi_hari} hari</span>
              </div>
              <div className="flex justify-between text-sm text-[#8b9bb4]">
                <span>Harga sebelum diskon</span>
                <span className="text-[#f0f6ff]">{fmt(preview.pricing.harga_sebelum_diskon)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#8b9bb4]">
                <span>Diskon</span>
                <span className={preview.pricing.diskon_persen > 0 ? 'text-emerald-400 font-semibold' : 'text-[#4a5568]'}>
                  {preview.pricing.diskon_persen > 0 ? `${preview.pricing.diskon_persen}% off` : '—'}
                </span>
              </div>

              <div className="h-px bg-white/8" />

              <div className="flex justify-between font-bold">
                <span className="text-[#f0f6ff]">Total</span>
                <span className="text-[#00d4ff] text-base">{fmt(preview.pricing.total_harga)}</span>
              </div>

              {preview.pricing.diskon_persen > 0 && (
                <p className="text-xs text-emerald-400/80">
                  🎉 Hemat {fmt(preview.pricing.harga_sebelum_diskon - preview.pricing.total_harga)} — diskon sewa &gt;7 hari
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-end gap-2 border-t border-white/8 pt-4">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-[#f0f6ff] text-sm font-medium hover:bg-white/10 transition-all cursor-pointer">
            Batal
          </button>
          <button type="submit" disabled={loading || !form.unit_id || !form.tanggal_selesai}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-black text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer">
            {loading && <span className="spinner" />}
            Konfirmasi Booking
          </button>
        </div>
      </form>
    </Modal>
  );
}
