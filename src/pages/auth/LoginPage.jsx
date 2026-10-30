import React, { useState, useEffect } from 'react';
import { Heart, Lock, ArrowLeft, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { fetchDemoAccountsPerRole, ROLE_LABELS } from '../../services/dashboard/staffService';

export default function LoginPage({ onLoginSuccess, onGoToRegister, onGoToLanding }) {
  const [selectedRole, setSelectedRole] = useState('supervisor');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  useEffect(() => {
    async function loadAccounts() {
      const accs = await fetchDemoAccountsPerRole();
      setAccounts(accs);
      if (accs.length > 0) {
        const defaultAcc = accs.find(a => a.role === 'supervisor') || accs[0];
        setSelectedAccountId(defaultAcc.id);
      }
    }
    loadAccounts();
  }, []);

  const handleRoleSelectChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    const matched = accounts.find(a => a.role === role);
    if (matched) {
      setSelectedAccountId(matched.id);
    }
  };

  const handleAccountCardClick = (acc) => {
    setSelectedRole(acc.role);
    setSelectedAccountId(acc.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetAccount = accounts.find(a => a.id === selectedAccountId) || accounts.find(a => a.role === selectedRole);
    onLoginSuccess(selectedRole, targetAccount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-600/30">
            <Heart className="w-7 h-7 fill-white" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-black text-slate-900 tracking-tight">
          Selamat Datang Kembali
        </h2>
        <p className="text-center text-xs text-slate-500 font-medium">
          Masuk ke Sistem Pengawasan Perawatan Lansia Terverifikasi SambungJaga AI
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-3xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Peran Akses Sistem (RBAC Gateway)
              </label>
              <select
                value={selectedRole}
                onChange={handleRoleSelectChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="supervisor">Supervisor Klinis (Ns. Ratna Sari)</option>
                <option value="caregiver">Pengasuh / Perawat (Suster Dewi)</option>
                <option value="family">Wali Keluarga Pasien (Rina Wijaya)</option>
                <option value="admin_hr">Admin HR & Panti (Budi Santoso)</option>
              </select>
            </div>

            {/* Accounts Selectable List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Pilih Akun Staf/Demo:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleAccountCardClick(acc)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center space-x-3 ${
                        isSelected
                          ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <img src={acc.avatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover border border-slate-300" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-bold">{acc.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{acc.roleTitle}</p>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2"
            >
              <span>Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Belum memiliki akun terdaftar?{' '}
              <button
                onClick={onGoToRegister}
                className="text-sky-600 hover:text-sky-700 font-bold underline ml-1"
              >
                Daftar Akun Baru
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
