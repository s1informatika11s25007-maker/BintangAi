import React from 'react';
import { Heart, Youtube, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs py-8 px-4 sm:px-8 mt-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          {/* Logo & Slogan */}
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="p-1.5 bg-sky-600 rounded-lg text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                Sambung<span className="text-sky-400">.Jaga</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Karena setiap <span className="text-sky-300 font-bold">lansia</span> berhak mendapatkan perhatian terbaik.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6 text-xs text-slate-400 font-medium">
            <a href="#beranda" className="hover:text-white transition">Beranda</a>
            <a href="#fitur" className="hover:text-white transition">Fitur</a>
            <a href="#cara-kerja" className="hover:text-white transition">Tentang Kami</a>
            <a href="#testimoni" className="hover:text-white transition">Kontak</a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-3 text-slate-400">
            <a href="#youtube" className="hover:text-white transition"><Youtube className="w-4 h-4" /></a>
            <a href="#instagram" className="hover:text-white transition"><Instagram className="w-4 h-4" /></a>
            <a href="#linkedin" className="hover:text-white transition"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-[11px] text-slate-500 font-medium">
          © 2026 SambungJaga. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
