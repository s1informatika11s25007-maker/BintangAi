import React from 'react';
import { Heart, Shield } from 'lucide-react';

export default function Footer({ onGoToLanding }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">

        {/* Brand Info */}
        <div className="space-y-3">
          <div
            onClick={onGoToLanding}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="p-1.5 bg-sky-600 rounded-lg text-white shrink-0">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <span className="text-base font-black text-white tracking-tight">
              Sambung<span className="text-sky-400">Jaga</span>
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed font-normal">
            Platform Perawatan Lansia Terverifikasi. Menjaga kesinambungan perawatan dengan aman dan transparan.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Navigasi</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li><a href="#fitur" className="hover:text-white transition">Fitur Utama</a></li>
            <li><a href="#cara-kerja" className="hover:text-white transition">Cara Kerja</a></li>
            <li><a href="#testimoni" className="hover:text-white transition">Testimoni Panti</a></li>
          </ul>
        </div>

        {/* Compliance */}
        <div className="space-y-2">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Keamanan & Privasi</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400 mr-1" />
              <span>Jaminan Privasi & Keamanan Data</span>
            </li>
            <li>Pencatatan Riwayat Terverifikasi</li>
            <li>Sistem Akses Terproteksi</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Fasilitas Panti</h4>
          <p className="text-slate-400 leading-relaxed">
            Dahlia Care Facility Jakarta<br />
            Layanan Bantuan 24/7 Staf Medis
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 font-medium">
        <p>© 2026 SambungJaga. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 font-mono text-[11px]">System Status: Operational 100%</p>
      </div>
    </footer>
  );
}
