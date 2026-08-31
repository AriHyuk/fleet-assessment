import { useState, useEffect } from 'react';
import Modal from './Modal';
import { createUnit, updateUnit } from '../api/units';
import { Unit } from '../types';

const EMPTY = { plat_nomor: '', tipe_merk: '', harga_sewa_per_hari: '', status: 'tersedia' };

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
  onSaved: () => void;
}

export default function UnitFormModal({ isOpen, onClose, unit, onSaved }: UnitFormModalProps) {
  const [form, setForm]     = useState<Record<string, string>>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!unit;

  useEffect(() => {
    if (isOpen) {
      setForm(unit ? { ...unit, harga_sewa_per_hari: String(unit.harga_sewa_per_hari) } : EMPTY);
      setErrors({});
    }
  }, [isOpen, unit]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (isEdit && unit) {
        await updateUnit(unit.id, form);
      } else {
        await createUnit(form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name: string, label: string, type = 'text', extra: any = {}) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-[#8b9bb4]">{label}</label>
      <input
        type={type}
        value={form[name] || ''}
        onChange={set(name)}
        className={`px-3.5 py-2.5 rounded-lg bg-white/5 border text-[#f0f6ff] text-sm outline-none transition-all placeholder:text-white/20
          ${errors[name] ? 'border-red-500 focus:ring-2 focus:ring-red-500/30' : 'border-white/8 focus:border-[#00d4ff]/60 focus:ring-2 focus:ring-[#00d4ff]/20'}`}
        {...extra}
      />
      {errors[name] && (
        <span className="text-xs text-red-400">{errors[name][0]}</span>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Unit Kendaraan' : 'Tambah Unit Kendaraan'}>
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 flex flex-col gap-4">

          {field('plat_nomor', 'Plat Nomor', 'text', { placeholder: 'B 1234 XYZ' })}
          {field('tipe_merk',  'Tipe / Merk', 'text', { placeholder: 'Toyota Avanza' })}
          {field('harga_sewa_per_hari', 'Harga Sewa / Hari (Rp)', 'number', { placeholder: '300000', min: '0', step: '1000' })}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8b9bb4]">Status</label>
            <select
              value={form.status || 'tersedia'}
              onChange={set('status')}
              className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/8 text-[#f0f6ff] text-sm outline-none transition-all focus:border-[#00d4ff]/60 focus:ring-2 focus:ring-[#00d4ff]/20 cursor-pointer"
            >
              <option value="tersedia" className="bg-[#111827]">Tersedia</option>
              <option value="disewa"   className="bg-[#111827]">Disewa</option>
            </select>
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end gap-2 border-t border-white/8 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-[#f0f6ff] text-sm font-medium hover:bg-white/10 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading && <span className="spinner" />}
            {isEdit ? 'Simpan Perubahan' : 'Tambah Unit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
