<div align="center">

# 🛡️ SambungJaga AI
### Care Superagent & Evidence-Verified Care Continuity Kernel

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=700&size=26&pause=1200&color=0284C7&center=true&vcenter=true&width=780&height=50&lines=Evidence-Verified+Care+Continuity+for+Elderly+Care;Obligation+Kernel+%2B+Bitemporal+Ledger+(P1-P6);Groq+LLM+%2B+On-Device+Gemini+Nano+Chrome+AI;Tamper-Evident+Offline-First+PWA+(P5+Hash-Chain)" alt="SambungJaga AI Animated Tagline" />
</p>

> **Sistem Operasi Perawatan Lansia Terverifikasi Bukti**: Mentransformasi laporan verbal & catatan informal pengasuh menjadi **Care Obligation Graph** bitemporal yang terlacak, terverifikasi bukti, dan berintegritas kriptografis.

---

<!-- Badges Row 1: CI/CD & Architecture -->
[![Build & Test CI](https://img.shields.io/github/actions/workflow/status/s1informatika11s25007-maker/SambungJaga/test.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI%20Pipeline&color=10b981)](./.github/workflows/test.yml)
[![Architecture](https://img.shields.io/badge/Arsitektur-SambungJaga%20AI%20Kernel-0284c7?style=for-the-badge&logo=cpu&logoColor=white)](#-9-lapisan-arsitektur-superagent)
[![PWA Offline First](https://img.shields.io/badge/PWA-Offline--First%20(P5%20Ledger)-f59e0b?style=for-the-badge&logo=pwa&logoColor=white)](./src/pages/CaregiverMobilePage.jsx)
[![Code Quality](https://img.shields.io/badge/Testing-Vitest%20%2B%20Playwright%20E2E-8b5cf6?style=for-the-badge&logo=vitest&logoColor=white)](#-pengujian-otomatis--quality-assurance)

<!-- Badges Row 2: Tech Stack -->
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%205-61dafb?style=for-the-badge&logo=react&logoColor=black)](./src)
[![Styling](https://img.shields.io/badge/Styling-TailwindCSS%20v3-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](./tailwind.config.js)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](./supabase/migrations/20261027000000_initial_schema.sql)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Groq%20LLM%20%2B%20Gemini%20Nano-ff6b00?style=for-the-badge&logo=google&logoColor=white)](./src/services/aiSuperagent.js)

</div>

---

## 📋 Navigation Index

- [📌 Ringkasan Sistem & Masalah yang Diselesaikan](#-ringkasan-sistem--masalah-yang-diselesaikan)
- [⚡ 6 Inovasi Inti Kernel (P1 – P6)](#-6-inovasi-inti-kernel-p1--p6)
- [🏗️ 9 Lapisan Arsitektur Superagent](#%EF%B8%8F-9-lapisan-arsitektur-superagent)
- [🤖 Dual AI Engine Strategy](#-dual-ai-engine-strategy)
- [👥 Fitur Berdasarkan Peran Pengguna (RBAC)](#-fitur-berdasarkan-peran-pengguna-rbac)
- [📂 Struktur Codebase Clean Architecture](#-struktur-codebase-clean-architecture)
- [🧪 Pengujian Otomatis & Quality Assurance](#-pengujian-otomatis--quality-assurance)
- [🛠️ Panduan Instalasi & Pengoperasian Lokal](#%EF%B8%8F-panduan-instalasi--pengoperasian-lokal)
- [🚀 Deployment Guide (Vercel & Supabase)](#-deployment-guide-vercel--supabase)
- [🛡️ Keamanan Data, RLS & Kepatuhan UU PDP](#%EF%B8%8F-keamanan-data-rls--kepatuhan-uu-pdp)

---

## 📌 Ringkasan Sistem & Masalah yang Diselesaikan

Di fasilitas perawatan lansia (panti jompo & *home care*) di Indonesia, **kelalaian perawatan (*care debt*)** sering terjadi bukan karena pengasuh tidak peduli, melainkan akibat:
1. **Komunikasi Verbal yang Fragmentaris**: Laporan pergantian shift (*handover*) sering hilang atau tidak tercatat dengan konsisten.
2. **Minimnya Jejak Verifikasi Bukti**: Tidak ada bukti objektif bahwa obat telah diberikan pada jam yang tepat atau kondisi medis telah diperiksa.
3. **Ketakutan Menutupi Kesalahan**: Pengasuh enggan melaporkan keterlambatan karena takut disalahkan, memicu *care debt* berantai (*cascade failures*).

**SambungJaga AI** hadir sebagai *Care Superagent* berbasis **Obligation Kernel** yang memproses laporan suara/teks pengasuh secara cerdas, mengompilasi kewajiban perawatan ke dalam graf bitemporal, memverifikasi bukti penutupan tugas secara obyektif, dan memberikan sinyal peringatan dini sebelum kelalaian medis terjadi.

---

## ⚡ 6 Inovasi Inti Kernel (P1 – P6)

| Kode | Nama Inovasi | Deskripsi Teknikal | Penegakan Hukum & Keamanan AI |
| :---: | :--- | :--- | :--- |
| **P1** | **Bitemporal Obligation Ledger** | Memisahkan *Valid Time* (waktu klinis tindakan) dan *Transaction Time* (waktu nyata data dicatat di DB). Mendukung *Retroactive Rule Replay*. | Mencegah manipulasi histori masa lalu dan memastikan kalkulasi *Care Debt* akurat. |
| **P2** | **Evidence-Grade Closure & Spot Challenge** | Penutupan tugas wajib melampirkan bukti bertingkat (`E0` Klaim &rarr; `E1` Foto/QR &rarr; `E2` Dual Sign &rarr; `E3` Sensor/IoT) disertai audit acak (*Spot Challenge*). | AI dilarang menutup kewajiban medis tanpa bukti sesuai tingkat risiko klinis. |
| **P3** | **Epistemic Fact Ledger** | Penjejakan fakta dalam 5 status epistemik: `Observed` (Sensor/IoT), `Reported` (Suara/Teks), `Inferred` (AI Deduction), `Contradicted` (Konflik Data), dan `Stale` (Basi/Kadaluwarsa). | Memisahkan asumsi AI dari fakta lapangan dan mendeteksi kontradiksi data pasien. |
| **P4** | **Failure-Set Search Simulator** | Simulasi pencarian kombinasi ketidakhadiran pengasuh terkecil yang berisiko menelantarkan kewajiban kritis lansia. | Analisis risiko otomatis untuk keputusan panggilan perawat cadangan (*on-call*). |
| **P5** | **Tamper-Evident Offline Ledger** | *Cryptographic hash-chain* SHA-256 lokal pada PWA mobile dengan timestamp atestasi perangkat anti-backdate. | Memungkinkan pencatatan offline tanpa risiko pengeditan tanggal mundur (*anti-backdate*). |
| **P6** | **Authority Envelope Gate** | Pembatasan tingkat wewenang eksekusi AI: `A0` (Read Only), `A1` (Reversible), `A2` (Alert), `A3` (Klinis/Ireversibel). | **A3 Wajib Human Review**: AI dilarang mengeksekusi instruksi medis tanpa persetujuan manusia. |

---

## 🏗️ 9 Lapisan Arsitektur Superagent

Sistem dibangun berdasarkan 9 lapisan arsitektur terintegrasi yang saling terhubung secara terstruktur:

```mermaid
graph TD
    A[Aktor: Pengasuh, Supervisor, Keluarga, Admin Panti] --> L1[1 · AKSES & INGESTI]
    L1 -->|PWA Offline / Voice STT / WA Bot| L2[2 · PERSEPSI & PENGETAHUAN]
    L2 -->|P3 Epistemic Fact Ledger| L3[3 · OBLIGATION KERNEL]
    L3 -->|P1 Bitemporal Obligation Graph| L4[4 · SUPERAGENT & P6 AUTHORITY ENVELOPE]
    L4 -->|P6 Policy Gate - Human Review A3| L5[5 · EKSEKUSI TERKONTROL - Supabase RLS]
    L5 -->|E0 - E3 Artifact Upload| L6[6 · VERIFIKASI BUKTI - P2 Verifier]
    L6 -->|Append-Only SHA-256| L7[7 · PLATFORM AUDIT & OBSERVABILITAS]
    L3 -.->|Asynchronous Replay| L8[8 · ANALISIS ASINKRON - P4 Failure-Set Sim]
    L6 -->|Dual Signature| L9[9 · SERAH TERIMA SHIFT DUA SISI & PORTAL KELUARGA]
```

<details>
<summary>🔍 Klik untuk melihat rincian fungsi setiap lapisan</summary>

1. **Akses & Ingesti**: Gateway multi-channel (Voice STT, Teks, WhatsApp Bot) dengan filter *Prompt Injection* & PII. PWA Offline Ledger (`P5`) mencatat transaksi lokal secara *hash-chained*.
2. **Persepsi & Pengetahuan**: Ekstraksi fakta medis & klasifikasi status epistemik (`P3`). Mengajukan *Minimal-Question Clarification* jika informasi ambigu.
3. **Obligation Kernel**: Kompiler aturan bitemporal (`P1`), pembuatan *Care Obligation Graph*, pendeteksi *Care Debt*, dan *Negative-Obligation Checker* (misal: larangan makanan tinggi gula).
4. **Superagent & Authority Envelope**: Orchestrator utama yang mengatur agen spesialis (Capture, Handover, Investigation, Recovery, Competency, Consent) dan menegakkan batas wewenang (`P6`).
5. **Eksekusi Terkontrol**: Gateway idempoten yang terhubung ke Supabase PostgreSQL dengan skema terpisah (`hr_domain`, `resident_domain`, `kernel_domain`, `audit_domain`) dan RLS.
6. **Verifikasi Bukti**: Verifikator bukti `P2` (E0–E3), *Spot Challenge Engine*, dan verifikasi kondisi akhir (*Postcondition Verifier*).
7. **Platform Audit & Observabilitas**: *Append-Only Hash-Chained Audit Trail* berstandar SHA-256 yang merekam seluruh aksi AI, verifikasi, dan intervensi manusia.
8. **Analisis Asinkron**: Simulasi *Failure-Set Search* (`P4`), laporan *Competency Gap*, dan *Retroactive Rule Replay* N-hari.
9. **Serah Terima & Keluaran**: Kontrak serah terima shift dua sisi (*Two-Sided Handover Contract*), Dashboard Supervisor Realtime, dan Portal Keluarga berizin UU PDP.

</details>

---

## 🤖 Dual AI Engine Strategy

SambungJaga AI mengintegrasikan dua mesin AI secara hybrid untuk menjamin kecepatan, privasi, dan ketersediaan:

```
                  ┌──────────────────────────────────────────┐
                  │          INGESTI LAPORAN PENGASUH        │
                  └────────────────────┬─────────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
          ┌─────────────────────┐             ┌─────────────────────┐
          │  Groq Cloud LLM     │             │ Chrome On-Device AI │
          │  (Llama 3.3 / Mixtral)│            │ (Gemini Nano Local) │
          └──────────┬──────────┘             └──────────┬──────────┘
                     │                                   │
                     ├─ Extraksi Kompleks                ├─ Ringkasan Offline
                     ├─ Orchestration Missions           ├─ Zero-Latency Parsing
                     └─ Failure-Set Search (P4)          └─ Zero Data Leakage
```

1. **Groq Cloud LLM (Llama 3.3 70B / Mixtral)**:
   * Ekstraksi entitas medis tingkat tinggi dan pembentukan *Care Obligation Graph*.
   * Simulasi kegagalan *Failure-Set Search* (`P4`) dan analisis investigasi lintas shift.
   * Dipanggil melalui Groq Model Gateway (`api.groq.com`).
2. **On-Device Chrome Built-in AI (Gemini Nano)**:
   * Berjalan 100% lokal di browser client (`window.ai.languageModel` & `window.ai.summarizer`).
   * Memproses ringkasan laporan dan ekstraksi fakta dasar saat perangkat tidak terhubung internet (*offline-first*).
   * Menjamin privasi penuh tanpa data keluar dari perangkat mobile pengasuh.
3. **Chrome Web Speech & Vision Capabilities**:
   * *Speech-to-Text* langsung untuk rekaman suara pengasuh (*Floating Voice Mic*).
   * Camera OCR & Barcode Scanner (`VisionCameraModal.jsx`) untuk verifikasi bukti foto obat dan scan ID penghuni.

---

## 👥 Fitur Berdasarkan Peran Pengguna (RBAC)

 Aplikasi mendukung 4 peran utama dengan hak akses & antarmuka workspace yang disesuaikan:

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                         ROLES & WORKSPACES                               │
 ├───────────────────┬───────────────────┬───────────────────┬──────────────┤
 │  📱 CAREGIVER     │  📊 SUPERVISOR    │  👨‍👩‍👧 KELUARGA      │ ⚙️ ADMIN / HR│
 │  (Pengasuh PWA)   │  (Kepala Perawat) │  (Wali Lansia)    │ (Kelola Panti│
 └───────────────────┴───────────────────┴───────────────────┴──────────────┘
```

### 📱 1. Caregiver Workspace (Pengasuh Shift Mobile)
* **Floating Voice Capture**: Rekam instruksi/laporan verbal dengan auto STT dan filter prompt injection.
* **Camera Vision OCR**: Pindai label obat, tensimeter, atau QR lokasi untuk unggah bukti `E1`/`E2`.
* **Offline Ledger Sync**: Simpan laporan secara lokal saat hilang sinyal; auto-sync dengan hash chain SHA-256 saat online.
* **Tampilan Tugas Terurut**: Daftar kewajiban perawatan terurut berdasarkan jam berlaku & tingkat urgensi.

### 📊 2. Supervisor Dashboard (Kepala Perawat)
* **Realtime Care Debt Alerts**: Sinyal peringatan visual & alarm audio (*Web Audio API Synthesizer*) saat *Care Debt* meningkat.
* **Care Obligation Graph Viewer**: Visualisasi status kewajiban seluruh penghuni panti secara terpusat.
* **Two-Sided Handover Contract**: Mengelola kontrak pergantian shift yang wajib ditandatangani oleh perawat penyerah & penerima.
* **P4 Failure-Set Simulator**: Jalankan simulasi untuk mengetahui dampak ketidakhadiran staf terhadap keselamatan lansia.

### 👨‍👩‍👧 3. Family Portal (Keluarga / Wali Penghuni)
* **PDP-Compliant Consent Filter**: Menampilkan ringkasan perawatan harian yang telah disaring sesuai tingkat izin privasi keluarga.
* **Timeline Aktivitas & Kesehatan**: Laporan transparan mengenai makanan, obat, vital sign, dan aktivitas lansia.
* **Verifikasi Bukti Tanpa Wajah**: Foto bukti perawatan yang menjaga privasi lansia (*faceless photo artifact*).

### ⚙️ 4. Admin & HR Workspace
* **Clinical Rule Library Manager**: Mengelola aturan perawatan klinis berversi (`rule_version`) dan ambang batas medis.
* **Competency Coverage Engine**: Memetakan kualifikasi staf terhadap tindakan medis kritis.
* **Care Evidence Pack Exporter**: Mengunduh berkas bukti audit terdekripsi (.json) untuk keperluan audit hukum/medis.

---

## 📂 Struktur Codebase Clean Architecture

Proyek diorganisir secara modular mengikuti prinsip **Domain-Driven Design (DDD)** dan **Clean Architecture**:

```
SambungJaga/
├── .github/
│   └── workflows/
│       └── test.yml                 # GitHub Actions CI Workflow (Vitest + Playwright)
├── public/
│   ├── favicon.svg                  # Icon resmi SambungJaga
│   └── manifest.json                # Web App Manifest untuk PWA Mobile
├── src/
│   ├── components/                  # UI Components (React + Tailwind)
│   │   ├── common/                  # Reusable UI Primitives
│   │   │   ├── ArchitectureModal.jsx# Modal Inspeksi Arsitektur Interactive
│   │   │   ├── Badge.jsx            # Lencana Status UI
│   │   │   ├── FloatingVoiceMic.jsx # Capture Suara Melayang
│   │   │   └── Modal.jsx            # Modal Dialog Base
│   │   ├── dashboard/               # Widget Dashboard Supervisor
│   │   │   ├── CareDebtAlert.jsx    # Alert Sinyal Tunggakan Obligation (P1)
│   │   │   ├── EpistemicLedgerBadge.jsx # Indikator Epistemic Fact (P3)
│   │   │   └── ObligationGraphCard.jsx  # Kartu Graf Bitemporal
│   │   ├── handover/
│   │   │   └── HandoverContractCard.jsx # Kartu Handover Shift Dua Sisi
│   │   ├── layout/                  # Shell Application Layouts
│   │   │   ├── Footer.jsx           # Status Kernel Footer
│   │   │   ├── Header.jsx           # Top Navigation Bar
│   │   │   ├── Navbar.jsx           # Clean Navbar
│   │   │   ├── PublicHeader.jsx     # Header Landing Page & Auth
│   │   │   ├── RoleWorkspaceHeader.jsx # Banner Workspace Kustom per Role
│   │   │   └── Sidebar.jsx          # Navigasi Modul Utama
│   │   ├── pwa/                     # Komponen Mobile Caregiver PWA
│   │   │   ├── CaregiverCaptureModal.jsx # Modal Ingesti Voice/Text STT
│   │   │   ├── EvidenceUploadModal.jsx   # Modal Unggah Bukti P2 (Foto/QR/Dual-Sign)
│   │   │   └── VisionCameraModal.jsx     # Camera Vision OCR & Object Scanner
│   │   ├── simulator/
│   │   │   └── FailureSetSimulationModal.jsx # Modal Simulator Kegagalan P4
│   │   └── trace/
│   │       └── ExecutionTraceModal.jsx   # Modal Pelacak Transparansi AI
│   ├── hooks/
│   │   └── useSambungJaga.js        # Custom Hook Utama (Central Dispatcher & State)
│   ├── pages/                       # Halaman Aplikasi SPA
│   │   ├── AuditTrailPage.jsx       # Halaman Append-Only Audit Trail [A]
│   │   ├── CaregiverMobilePage.jsx  # Halaman PWA Mobile Pengasuh
│   │   ├── ExecutionTracePage.jsx   # Pelacak Transparansi Keputusan AI
│   │   ├── FamilyPortalPage.jsx     # Portal Informasi Keluarga
│   │   ├── HandoverPage.jsx         # Halaman Kontrak Serah Terima Shift
│   │   ├── LandingPage.jsx          # Landing Page Utama
│   │   ├── LoginPage.jsx            # Split-Screen Login Page
│   │   ├── RegisterPage.jsx         # Split-Screen Register Page
│   │   ├── RuleLibraryPage.jsx      # Manajemen Aturan Klinis & Kebijakan
│   │   ├── SimulatorLabPage.jsx     # Laboratorium Simulator P4
│   │   └── SupervisorDashboardPage.jsx # Dashboard Realtime Supervisor
│   ├── services/                    # Core Business Engines (JSDoc Annotated)
│   │   ├── aiSuperagent.js          # Groq Orchestrator & Mission Controller
│   │   ├── audioAlertService.js     # Web Audio API Synthesizer Peringatan Sound
│   │   ├── auditTrailService.js     # Append-Only SHA-256 Audit Trail Engine
│   │   ├── authorityEnvelope.js     # Envelope Evaluator P6 (A0-A3)
│   │   ├── consentDisclosureService.js # Filter PDP Portal Keluarga
│   │   ├── epistemicLedger.js       # Evaluator Status Epistemik (P3)
│   │   ├── evidenceVerifier.js      # Verifikator Bukti E0-E3 & Spot Challenge (P2)
│   │   ├── failureSetSimulator.js   # Mesin Simulasi Failure-Set Search (P4)
│   │   ├── geminiNanoService.js     # Local Chrome Built-in AI Gemini Nano
│   │   ├── handoverContractService.js # Layanan Kontrak Shift Dua Sisi
│   │   ├── nativeChromeService.js   # Integration Engine Native Browser API
│   │   ├── obligationEngine.js      # Graf Bitemporal & Care Debt Engine (P1)
│   │   ├── ruleReplayService.js     # Retroactive Rule Replay Engine
│   │   ├── staffService.js          # Layanan Profil & Kompetensi Staf
│   │   └── whatsappBotService.js    # Simulasi & Integrasi WhatsApp Ingestion
│   ├── supabase/
│   │   └── client.js                # Client Supabase dengan Fallback Resilience
│   ├── types/
│   │   └── architecture.js          # Konstanta, Enum, & Tipe Arsitektur
│   └── utils/
│       ├── formatters.js            # Utility Pemformat Waktu, Tanggal & Hash
│       └── validators.js            # Validasi Prompt Injection & Payload Bukti
├── supabase/
│   └── migrations/
│       └── 20261027000000_initial_schema.sql # Skema PostgreSQL + RLS Policy
├── tests/                           # Suite Pengujian Otomatis
│   ├── components/                  # Testing Komponen React (Vitest + RTL)
│   └── unit/
│       └── services.test.js         # Testing Unit Domain Services
├── .env                             # Environment Variables
├── package.json                     # Dependency & Script Manifest
├── playwright.config.js             # Konfigurasi Automated E2E Playwright
├── tailwind.config.js               # Design System Theme & Color Palette
├── vite.config.js                   # Konfigurasi Bundler Vite
└── vitest.config.js                 # Konfigurasi Unit Testing Vitest
```

---

## 🧪 Pengujian Otomatis & Quality Assurance

Proyek dilengkapi dengan **suite pengujian otomatis komprehensif** untuk menjamin integritas logika domain dan antarmuka pengguna:

```bash
# Running Unit Tests via Vitest
npm run test:unit

# Running Automated Playwright End-to-End Tests
npm run test:e2e

# Running All Tests (Unit + E2E)
npm run test
```

### Cakupan Pengujian:
1. **Audit Trail Engine Test**: Verifikasi pembuatan hash chain SHA-256 berantai dan pengujian deteksi manipulasi (*tampered chain*).
2. **Authority Envelope P6 Test**: Penahanan otomatis aksi klinis `A3` tanpa persetujuan manusia.
3. **Epistemic Fact Ledger P3 Test**: Pengujian klasifikasi status data (`Observed`, `Reported`, `Stale`) dan deteksi kontradiksi nilai GDS/Tensi.
4. **Evidence Verifier P2 Test**: Pengujian penolakan bukti jika *grade* yang diunggah lebih rendah dari persyaratan klinis.
5. **Failure-Set Search P4 Test**: Pengujian penemuan kombinasi staf absen terkecil yang mengancam kewajiban medis.
6. **Bitemporal Obligation Ledger P1 Test**: Pengujian kalkulasi *Care Debt* dan filter bitemporal pada titik waktu spesifik.
7. **Security & Prompt Injection Test**: Pengujian pencegahan serangan instruksi berbahaya (*bypass prompt*) dan validasi payload bukti.
8. **Playwright E2E Multi-Role Test**: Pengujian alur kerja nyata untuk keempat peran pengguna (Caregiver, Supervisor, Family, Admin).

---

## 🛠️ Panduan Instalasi & Pengoperasian Lokal

### Prasyarat Sistem
* **Node.js**: `v18.0.0` atau `v20.x` (Direkomendasikan)
* **npm**: `v9.0.0` atau lebih baru

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/s1informatika11s25007-maker/SambungJaga.git
cd SambungJaga
```

### Langkah 2: Install Dependensi Proyek
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables
Buat atau sesuaikan file `.env` di root proyek:

```env
# 1. FRONTEND / VITE PUBLIC CONFIG
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_TOKEN=gsk_your_groq_api_key_here
VITE_APP_ENV=production

# 2. BACKEND & SUPABASE CONNECTION POOLER
SUPABASE_PROJECT_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_POOLER_URL=postgres://postgres.your-project:password@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Langkah 4: Jalankan Mode Pengembang (Development)
```bash
npm run dev
```
Buka browser di `http://localhost:3000` (atau port yang ditunjuk Vite).

---

## 🚀 Deployment Guide (Vercel & Supabase)

### Deploy Frontend ke Vercel

 Proyek telah dilengkapi `vercel.json` untuk routing SPA Vite otomatis.

1. Buka [Vercel Dashboard](https://vercel.com/new) dan impor repositori `s1informatika11s25007-maker/SambungJaga`.
2. Pada **Environment Variables**, tambahkan:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `VITE_GROQ_TOKEN`
3. Klik **Deploy**. Vercel akan mem-build dan menerbitkan aplikasi dalam beberapa detik.

### Migration Database Supabase

1. Buka SQL Editor di Supabase Dashboard Anda.
2. Salin dan jalankan skrip migrasi dari file [`supabase/migrations/20261027000000_initial_schema.sql`](./supabase/migrations/20261027000000_initial_schema.sql).
3. Skrip akan secara otomatis membuat skema `hr_domain`, `resident_domain`, `kernel_domain`, `audit_domain`, memasang kebijakan RLS, serta fungsi pencetus hash SHA-256 otomatis.

---

## 🛡️ Keamanan Data, RLS & Kepatuhan UU PDP

1. **Prinsip AI Terkendali**: AI dilarang mengambil keputusan medis ireversibel (`A3`) secara mandiri. Semua tindakan kritis wajib melalui intervensi persetujuan manusia (*Mandatory Human Review*).
2. **PostgreSQL Row-Level Security (RLS)**: Hak akses data dibatasi langsung pada tingkat basis data Supabase, bukan hanya pada antarmuka frontend.
3. **Privasi Berbasis Konsen (UU PDP)**: Informasi medis sensitif lansia disaring oleh *Consent Disclosure Service* sebelum ditampilkan di Portal Keluarga. Foto bukti menggunakan teknik proteksi wajah (*faceless photo artifact*).
4. **Jejak Audit Hukum-Medis**: Setiap interaksi, perubahan status, dan verifikasi bukti disimpan dalam log *append-only* dengan hash SHA-256 berantai yang dapat diekspor sebagai **Care Evidence Pack** (.json) sah.

---

<div align="center">

### 📄 Hak Cipta & Lisensi
Hak Cipta © 2026 **SambungJaga AI Team**. Seluruh Hak Cipta Dilindungi Undang-Undang.<br/>
Diterbitkan di bawah standar arsitektur sistem perawatan lansia terverifikasi Indonesia.

</div>
