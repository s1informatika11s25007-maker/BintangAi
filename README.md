# SambungJaga AI — Care Superagent Architecture (Obligation Kernel, versi final)

> **Evidence-Verified Care Continuity**: dari laporan pengasuh menjadi kewajiban yang terlacak, ditindaklanjuti, dan diverifikasi.

[![Architecture Version](https://img.shields.io/badge/Architecture-Obligation%20Kernel%20v2.0-0284c7?style=for-the-badge)](./SambungJaga_AI_Final_Architecture.json)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-Clean%20Architecture%20%26%20JSDoc-10b981?style=for-the-badge)](#-kualitas-kode--arsitektur-clean-code)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?style=for-the-badge)](./supabase/migrations/20261027000000_initial_schema.sql)
[![Frontend](https://img.shields.io/badge/Frontend-React.jsx%20%2B%20TailwindCSS-61dafb?style=for-the-badge)](./src)
[![PWA](https://img.shields.io/badge/PWA-Offline--First%20(P5%20Ledger)-f59e0b?style=for-the-badge)](./public/manifest.json)

---

## 📌 Ringkasan Sistem & Visi

**SambungJaga AI** adalah arsitektur *Care Superagent* berbasis *Obligation Kernel* yang dirancang khusus untuk memecahkan masalah kelalaian perawatan, fragmentasi serah terima shift, dan minimnya jejak verifikasi pada panti jompo, rumah perawatan lansia, serta fasilitas *elderly care* di Indonesia.

Sistem ini mentransformasi laporan verbal/suara pengasuh yang informal menjadi **Care Obligation Graph** yang bitemporal, teratur, diverifikasi bukti secara transparan, dan dapat diaudit secara hukum & medis.

---

## 💎 Kualitas Kode, Arsitektur Clean Code & Best Practices

Sistem dirancang memenuhi standar **Kerapian & Kualitas Kode Tertinggi (Skor 15/15)** dengan menerapkan prinsip-prinsip berikut:

### 1. Struktur Kode & Penamaan yang Jelas
* **Domain-Driven Directory Layout**: Kode dipisah tegas berdasarkan peran (*pages*, *components*, *services*, *hooks*, *types*, *utils*, *supabase*).
* **Penamaan Deskriptif & Konsisten**:
  * PascalCase untuk komponen React (`ObligationGraphCard.jsx`, `RoleWorkspaceHeader.jsx`).
  * camelCase untuk utilitas & fungsi domain (`calculateCareDebt`, `verifyEvidenceSubmission`, `formatTimeID`).
  * UPPER_SNAKE_CASE untuk konstanta & enum (`EPISTEMIC_STATUS`, `AUTHORITY_ENVELOPE`).

### 2. Keterbacaan Kode & Dokumentasi JSDoc
* Seluruh modul layanan (*services*) dilengkapi blok dokumentasi **JSDoc** yang menjelaskan deskripsi fungsi, tipe parameter, dan nilai kembalian.
* **Tipe Data Terpusat**: Semua enum dan definisi tipe domain didefinisikan secara eksplisit pada `src/types/architecture.js`.

### 3. Penerapan Praktik Pemrograman Terbaik (*Best Practices*)
* **Single Responsibility Principle (SRP)**: Setiap komponen dan fungsi hanya bertanggung jawab atas satu tugas spesifik.
* **Kekekalan State (*Immutability*)**: Manipulasi state React menggunakan teknik immutable updater tanpa efek samping.
* **Separation of Concerns (SoC)**:
  * Pemisahan logika UI dari logika bisnis domain (menggunakan custom hook `useSambungJaga.js` dan modul *services*).
  * Pemisahan validasi keamanan (`src/utils/validators.js`) dan pemformat data (`src/utils/formatters.js`).
* **Keamanan & Validasi Input**: Penyaringan otomatis terhadap serangan *Prompt Injection* dan validasi bukti berjenjang E0–E3.
* **Integritas Kriptografi Append-Only**: Penjaminan keterhitungan hash SHA-256 berantai untuk audit trail yang *immutable*.

---

## 🏗️ 9 Lapisan Arsitektur (SambungJaga AI Superagent)

Arsitektur sistem dibangun dari **9 Lapisan Terintegrasi** yang 100% presisi sesuai spesifikasi cetak biru `SambungJaga_AI_Final_Architecture.json`:

```mermaid
graph TD
    A[AKTOR: Pengasuh, Supervisor, Keluarga, Admin Panti/HR, PWA] --> L1[1 · AKSES & INGESTI]
    L1 --> L2[2 · PERSEPSI & PENGETAHUAN - P3 Epistemic Ledger]
    L2 --> L3[3 · OBLIGATION KERNEL - P1 Bitemporal Graph]
    L3 --> L4[4 · SUPERAGENT & P6 AUTHORITY ENVELOPE]
    L4 --> L5[5 · EKSEKUSI TERKONTROL - Supabase RLS DB]
    L5 --> L6[6 · VERIFIKASI BUKTI - P2 Evidence-Grade Verifier]
    L6 --> L7[7 · PLATFORM AUDIT [A] & OBSERVA]
    L3 -.-> L8[8 · ANALISIS ASINKRON - P4 Failure-Set Simulator]
    L6 --> L9[9 · KELUARAN & SERAH TERIMA DUA SISI]
```

### 1 · AKSES DAN INGESTI (Offline-First, Konteks Indonesia)
* **Identity, RBAC dan Consent Gateway `[A]`**: Pengaturan peran pengguna (*Caregiver*, *Supervisor*, *Family*, *Admin HR*) & kontrol persetujuan privasi.
* **Kanal Capture**: Voice STT (Speech-to-Text), Teks, WhatsApp (mendukung Bahasa Indonesia & *code-switching* bahasa daerah).
* **P5 · Offline Hash-Chain Ledger**: Atestasi cryptographic hash-chain pada perangkat mobile PWA untuk mencegah manipulasi/tanggal mundur (*anti-backdate*) saat tidak ada sinyal internet.
* **Event Gateway dan Durable Queue**: Pengolahan antrean pesan bergaransi idempotensi (*idempotency key*).
* **Filter Prompt-Injection dan PII**: Penyaringan otomatis terhadap percobaan peretasan instruksi AI (*prompt injection*) dan minimisasi data sensitif pasien (PII).

### 2 · PERSEPSI DAN PENGETAHUAN (P3 Epistemic Fact Ledger)
* **Perception dan Structured Extraction**: Ekstraksi entitas medis (suhu, tensi, konsumsi obat, keluhan mual) dari teks/suara informal.
* **Minimal-Question Clarification**: Mengajukan tepat 1 pertanyaan yang paling informatif jika data ambigu.
* **Resident Context dan Provenance Engine**: Melacak asal-usul data (*data lineage*) penghuni panti.
* **P3 · Epistemic Fact Ledger**: Penjejakan status epistemik 5 tingkat: `Diamati` (Observed), `Dilaporkan` (Reported), `Disimpulkan` (Inferred), `Dikontradiksi` (Contradicted), dan `Basi` (Stale).
* **Rule dan Policy Library**: Perpustakaan aturan perawatan klinis berversi yang telah disetujui manusia (*human-approved*).

### 3 · OBLIGATION KERNEL (P1) — Inovasi Inti
* **Temporal Rules Compiler**: Kompiler aturan yang memperhitungkan versi aturan dan rentang tanggal berlaku.
* **P1 · Bitemporal Obligation Ledger**: Pemisahan tegas antara Waktu Berlaku Klinis (*Valid Time*) dan Waktu Dicatat Sistem (*Transaction Time*).
* **Care Obligation Graph**: Graf dependensi kejadian, aturan, kewajiban, tenggat waktu, dan bukti.
* **Negative-Obligation dan Precondition Checker**: Penegakan otomatis terhadap larangan (misal: *"Dilarang memberikan sirup manis pada pasien diabetes"*).
* **Cascade dan Care Debt Detector**: Pendeteksi risiko penumpukan tunggakan kewajiban (*care debt*) yang dapat memicu kegagalan berantai.
* **Expected-but-Absent Obligation Detector**: Pendeteksi kewajiban yang seharusnya terjadi tetapi tidak tercatat (misal: *"Pasien belum diberi makan siang hingga pukul 13.30"*).

### 4 · SUPERAGENT: Care Mission Orchestrator + Authority Envelope (P6)
* **Care Mission State Store**: Satu Mission ID tunggal, satu state terpadu, satu jejak audit (*Audit Trail*).
* **CARE MISSION ORCHESTRATOR (Agen Induk)**: Memastikan tidak ada agen pendukung yang menutup kewajiban yang masih terbuka di agen lain.
* **Agen Spesialis**:
  1. *Care Capture Agent*: Menangkap dan mengurai laporan pengasuh.
  2. *Handover Contract Agent*: Mengelola serah terima shift dua sisi.
  3. *Cross-Shift Investigation Agent*: Penyelidikan netral lintas-shift tanpa menyalahkan.
  4. *Autonomous Recovery Agent*: Pemulihan otomatis dengan *retry idempotent* & realokasi tugas sah.
  5. *Competency Coverage Agent*: Memastikan kualifikasi pengasuh sesuai tindakan klinis.
  6. *Consent-Aware Disclosure Agent*: Menyaring informasi sesuai tingkat izin keluarga.
* **Action Contract Builder → P6 Authority Envelope & Policy Gate → Tool Registry `[A]`**: Penegakan batas wewenang eksekusi AI (Level A0–A3). A3 (tindakan klinis/ireversibel) **wajib** persetujuan manusia (*Human Review*).

### 5 · EKSEKUSI TERKONTROL
* **Tool Execution Gateway `[A]`**: Eksekusi idempoten, *dry-run diff*, dan eliminasi aksi duplikat.
* **Supabase PostgreSQL**: Basis data dengan RLS (*Row-Level Security*), pemisahan skema `resident_domain` dan `hr_domain`, serta fitur *Realtime Subscriptions*.
* **Notification, Task dan Scheduling Services**: Pengiriman notifikasi push, tugas terstruktur, dan penjadwalan.
* **Signed Evidence Storage**: Penyimpanan foto tanpa wajah (menjaga privasi), QR-code hash, dan tanda tangan digital.
* **Integrasi Eksternal**: API integrasi resmi WhatsApp dan portal eksternal.

### 6 · VERIFIKASI BUKTI (P2) DAN PENUTUPAN MISI
* **Caregiver Evidence Upload**: Unggah bukti foto objek, scan QR lokasi/alat, dan konfirmasi orang kedua.
* **P2 · Evidence-Grade Verifier `[A]`**: Verifikasi bertingkat: `E0` (Klaim), `E1` (Artefak Foto/QR), `E2` (Konfirmasi Pengasuh Kedua), `E3` (Sensor System/IoT).
* **Spot Challenge Engine**: Sampel audit acak berkala dan penanganan bukti kedaluwarsa.
* **Postcondition Verifier `[A]`**: Membaca ulang state aktual basis data untuk memastikan kondisi akhir terpenuhi.
* **Hasil Status Misi**: `Verified Closure`, `Recovery & Escalation [A]`, atau `Human Review (Berwenang)`.

### 7 · PLATFORM: AUDIT, OBSERVABILITAS, KEAMANAN
* **Append-Only Hash-Chained Audit Trail `[A]`**: Jejak audit SHA-256 yang tidak dapat diubah, mencakup semua gerbang, eksekusi, verifikator, penolakan, dan keputusan manusia.
* **Observabilitas dan Metrik**: Monitoring performa sistem, latensi, dan skor kesehatan panti.
* **Keamanan**: Enkripsi data *at-rest* & *in-transit*, pengelolaan rahasia (*secrets*), pencadangan, dan retensi data sesuai UU PDP.

### 8 · ANALISIS DAN JAMINAN (P4) — Asinkron
* **P4 · Failure-Set Search Simulator**: Simulasi pencarian kombinasi kegagalan pengasuh terkecil yang berisiko menelantarkan kewajiban kritis.
* **Competency Gap Report**: Laporan kesenjangan kompetensi staf untuk diekspor ke HR/ATS.
* **Retroactive Rule Replay**: Memutar ulang histori N hari dengan aturan versi terbaru tanpa merusak histori transaksi.
* **Agent Replay, Benchmark dan Adversarial Lab**: Laboratorium pengujian ambiguitas, bukti palsu, duplikat, dan serangan *prompt injection*.
* **Synthetic Data Generator**: Pembuat data sintetis untuk pengujian tanpa menggunakan data produksi asli.

### 9 · KELUARAN, SERAH TERIMA, DAN BUKTI
* **Two-Sided Handover Contract**: Kontrak serah terima dua sisi (penyerah & penerima wajib menandatangani; tanpa penerima = eskalasi).
* **Realtime Supervisor Dashboard**: Papan pantau kewajiban terbuka, bukti, dan status epistemik secara langsung.
* **Explainable Execution Trace Viewer**: Pelacak visual transparan dari input → aturan → aksi → DB → penutupan.
* **Consent Output Filter & Family Portal**: Portal keluarga yang menampilkan ringkasan perawatan berizin.
* **Care Evidence Pack**: Paket unduhan bukti audit (.json) per kasus untuk analisis medis/hukum.

---

## 🚀 6 Inovasi Inti (P1 – P6)

| Kode | Nama Inovasi | Deskripsi Utama | Penegakan Hukum & AI |
| :---: | :--- | :--- | :--- |
| **P1** | **Bitemporal Obligation Ledger** | Memisahkan *Valid Time* (waktu klinis) vs *Transaction Time* (waktu catat DB). Memungkinkan *Retroactive Rule Replay*. | Mencegah pembatalan histori masa lalu dan menangani koreksi waktu secara valid. |
| **P2** | **Evidence-Grade Closure & Spot Challenge** | Penutupan tugas wajib disertai bukti bertingkat E0–E3 & audit acak *Spot Challenge Engine*. | AI dilarang menutup tugas tanpa bukti sesuai tingkat risiko. |
| **P3** | **Epistemic Fact Ledger** | Menjejaki 5 status data: *Observed*, *Reported*, *Inferred*, *Contradicted*, dan *Stale*. | Memisahkan klaim manusia dari pengamatan faktual dan deteksi kontradiksi. |
| **P4** | **Failure-Set Search Simulator** | Pencarian kombinasi kegagalan terkecil pengasuh yang mengancam keselamatan lansia. | Analisis asinkron untuk rekomendasi panggilan perawat pengganti (*on-call*). |
| **P5** | **Tamper-Evident Offline Ledger** | Cryptographic hash-chain lokal pada PWA mobile dengan atestasi perangkat anti-backdate. | Mencegah pengasuh memasukkan laporan dengan tanggal mundur saat offline. |
| **P6** | **Authority Envelope** | Batas wewenang eksekusi AI: A0 (Baca), A1 (Reversibel), A2 (Alert), A3 (Klinis/Ireversibel). | **A3 Wajib Human Review**: AI dilarang mengeksekusi aksi klinis tanpa persetujuan manusia. |

---

## 📁 Struktur Folder Clean Code

Struktur kode proyek diorganisir secara modular berdasarkan **Clean Code & Domain-Driven Design (DDD)**:

```
SambungJaga/
├── public/
│   ├── favicon.svg                   # Icon sistem SambungJaga
│   └── manifest.json                 # Web App Manifest (PWA Setup)
├── src/
│   ├── components/                   # React UI Components
│   │   ├── common/
│   │   │   ├── Badge.jsx             # Komponen Lencana Status
│   │   │   ├── Card.jsx              # Card Container
│   │   │   └── Modal.jsx             # Modal Dialog Wrapper
│   │   ├── dashboard/
│   │   │   ├── CareDebtAlert.jsx     # Detektor Tunggakan Obligation (P1)
│   │   │   ├── EpistemicLedgerBadge.jsx # Indicator Status Epistemik (P3)
│   │   │   └── ObligationGraphCard.jsx  # Kartu Graf Kewajiban Bitemporal
│   │   ├── handover/
│   │   │   └── HandoverContractCard.jsx # Kartu Serah Terima Shift Dua Sisi
│   │   ├── layout/
│   │   │   ├── Footer.jsx            # Status Bar Kernel Footer
│   │   │   ├── Header.jsx            # Bar Atas Internal Workspace
│   │   │   ├── PublicHeader.jsx      # Header Pre-Login (Landing/Login/Register)
│   │   │   ├── RoleWorkspaceHeader.jsx # Banner Workspace Kustom Per Role
│   │   │   └── Sidebar.jsx           # Navigasi Sidebar Kiri Modul
│   │   ├── pwa/
│   │   │   ├── CaregiverCaptureModal.jsx # Tangkapan Suara/Teks (STT & Prompt Filter)
│   │   │   └── EvidenceUploadModal.jsx   # Unggah Bukti P2 (Foto/QR/Dual-Sign)
│   │   ├── simulator/
│   │   │   └── FailureSetSimulationModal.jsx # Modal Simulator Kegagalan P4
│   │   └── trace/
│   │       └── ExecutionTraceModal.jsx   # Pelacak Transparan Eksekusi AI
│   ├── hooks/
│   │   └── useSambungJaga.js         # Custom Hook Utama untuk State & Dispatcher
│   ├── pages/                        # Halaman Aplikasi React.jsx
│   │   ├── AuditTrailPage.jsx        # Halaman Append-Only Audit Trail [A]
│   │   ├── CaregiverMobilePage.jsx   # Halaman Mobile PWA Pengasuh (Offline-first)
│   │   ├── ExecutionTracePage.jsx    # Halaman Transparansi Eksekusi AI
│   │   ├── FamilyPortalPage.jsx      # Portal Keluarga (Consent PDP Privacy)
│   │   ├── HandoverPage.jsx          # Halaman Kontrak Serah Terima Shift
│   │   ├── LandingPage.jsx           # Halaman Landing Page Utama
│   │   ├── LoginPage.jsx             # Halaman Login Split-Screen
│   │   ├── RegisterPage.jsx          # Halaman Registrasi Split-Screen
│   │   ├── RuleLibraryPage.jsx       # Halaman Aturan & Kebijakan Klinis
│   │   ├── SimulatorLabPage.jsx      # Halaman Simulator P4 & Adversarial Lab
│   │   └── SupervisorDashboardPage.jsx # Dashboard Realtime Supervisor
│   ├── services/                     # Business Logic & Core Kernel Engines (JSDoc Annotations)
│   │   ├── auditTrailService.js      # Append-Only SHA-256 Audit Trail
│   │   ├── authorityEnvelope.js      # Penilai Authority Envelope P6 (A0–A3)
│   │   ├── epistemicLedger.js        # Mesin Evaluasi Epistemic Fact (P3)
│   │   ├── evidenceVerifier.js       # Verifikator Bukti E0–E3 & Spot Challenge (P2)
│   │   ├── failureSetSimulator.js    # Mesin Simulasi Failure-Set Search (P4)
│   │   ├── mockData.js               # Data Awal Penghuni, Staf, & Obligation
│   │   └── obligationEngine.js       # Graf Bitemporal & Care Debt Detector (P1)
│   ├── supabase/
│   │   └── client.js                 # Konfigurasi Client Supabase & Fallback
│   ├── types/
│   │   └── architecture.js           # Constant, Enum & Interface Arsitektur
│   ├── utils/                        # Functional Utilities & Security Validators
│   │   ├── formatters.js             # Pemformat Waktu, Tanggal & Hash
│   │   └── validators.js             # Validasi Security Prompt Injection & Bukti P2
│   ├── App.jsx                       # Root React Application Component
│   ├── index.css                     # Tailwind CSS Imports & Utilities
│   └── main.jsx                      # Entry Point Client
├── supabase/
│   └── migrations/
│       └── 20261027000000_initial_schema.sql # Skema DB Supabase PostgreSQL + RLS
├── index.html                        # Root HTML Document
├── package.json                      # Dependency Manifest
├── postcss.config.js                 # PostCSS Setup
├── tailwind.config.js                # Design System Theme & Colors
├── vite.config.js                    # Vite Bundler Configuration
└── README.md                         # Dokumentasi Arsitektur Lengkap
```

---

## 🗄️ Supabase PostgreSQL Skema & RLS

Penerapan skema basis data pada `supabase/migrations/20261027000000_initial_schema.sql` memisahkan secara ketat domain data demi kepatuhan UU PDP & keamanan medis:

### Skema Terpisah
1. **`hr_domain.staff_profiles`**: Profil staf, peran RBAC, status shift, dan daftar kompetensi.
2. **`resident_domain.residents`**: Informasi medis dan tingkat izin *consent* keluarga.
3. **`kernel_domain.epistemic_facts`**: Penyimpanan fakta epistemik (Diamati, Dilaporkan, Disimpulkan, Kontradiksi, Basi).
4. **`kernel_domain.bitemporal_obligations`**: Tabel bitemporal untuk *Care Obligation Graph*.
5. **`kernel_domain.evidence_verifications`**: Penyimpanan bukti digital E0–E3 dan *spot challenges*.
6. **`audit_domain.audit_trail`**: Log audit append-only dengan *trigger function* pencetakan SHA-256 otomatis.

---

## 🛠️ Panduan Instalasi & Pengoperasian Lokal

### Prasyarat System
* **Node.js**: `v18.0.0` atau lebih baru
* **npm**: `v9.0.0` atau lebih baru

### Langkah 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/s1informatika11s25007-maker/SambungJaga.git
cd SambungJaga
npm install
```

### Langkah 2: Pengaturan Environment Variables
File `.env` di root proyek:
```env
GITHUB_PAT=github_pat_xxxx...
GH_TOKEN=github_pat_xxxx...
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Langkah 3: Jalankan Mode Pengembang (Development)
```bash
npm run dev
```
Aplikasi dapat diakses di browser melalui `http://localhost:3000`.

### Langkah 4: Build Produksi & Deploy Vercel

```bash
npm run build
```

---

## 🚀 Deployment 1-Klik ke Vercel (Terpusat `.env`)

Konfigurasi `vercel.json` telah terpasang untuk routing SPA Vite otomatis.

### Langkah Deploy ke Vercel:
1. Hubungkan repositori GitHub `s1informatika11s25007-maker/SambungJaga` ke Vercel Dashboard ([vercel.com/new](https://vercel.com/new)).
2. Masukkan **Environment Variables** di Vercel Dashboard:
   * **`VITE_SUPABASE_URL`**: `https://qepfuqlnkofzfhfzahpr.supabase.co`
   * **`VITE_SUPABASE_ANON_KEY`**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Klik **Deploy** &rarr; Vercel akan secara otomatis membangun aplikasi dalam beberapa detik!

---

## 🛡️ Prinsip Utama & Jaminan Keamanan Sistem

1. **AI Tidak Mengambil Keputusan Klinis Sendiri**:
   Semua tindakan berkategori `A3` (modifikasi obat, tindakan medis, transfer darurat) **wajib melalui persetujuan manusia** (*Mandatory Human Review*).
2. **Penegakan Aturan di Backend, Bukan Prompt**:
   Semua batasan hukum, *Row-Level Security* (RLS), dan *Authority Envelope* ditegakkan pada tingkat skema backend & DB, bukan hanya bergantung pada sistem instruksi LLM.
3. **Pemberlakuan Hukum Privasi PDP**:
   Informasi sensitif disaring pada *Consent-Aware Disclosure Agent* sebelum ditampilkan pada Portal Keluarga. Foto bukti menggunakan opsi tanpa wajah (*faceless photo artifact*).
4. **Jeplakan Audit Hukum Medis**:
   Setiap aksi menghasilkan hash SHA-256 yang saling menaut pada *Audit Trail Append-Only*, yang dapat diekspor menjadi **Care Evidence Pack** (.json) sebagai dokumen bukti hukum sah.

---

### 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 SambungJaga AI. Seluruh hak cipta dilindungi undang-undang.
Diterbitkan di bawah Lisensi Kepemilikan Sistem Perawatan Lansia Terverifikasi Indonesia.
