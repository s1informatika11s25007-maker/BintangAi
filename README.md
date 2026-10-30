<div align="center">

# SambungJaga AI
### Platform Tata Kelola Perawatan Lansia & Obligation Kernel Terverifikasi Bukti

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=800&size=26&pause=1200&color=0284C7&center=true&vcenter=true&width=820&height=50&lines=Evidence-Verified+Care+Continuity+for+Elderly+Care;Bitemporal+Ledger+%2B+Care+Obligation+Graph+(P1-P6);Groq+LLM+Pipeline+%2B+Chrome+On-Device+Gemini+Nano;Tamper-Evident+Offline-First+PWA+(P5+Hash-Chain)" alt="SambungJaga AI Banner" />
</p>

> **Sistem Operasi Perawatan Lansia Berintegritas Kriptografis**: Mentransformasi komunikasi verbal & catatan informal pengasuh menjadi **Care Obligation Graph** bitemporal yang terstruktur, terverifikasi bukti, dan terlindung dari kelalaian perawatan (*care debt*).

---

<!-- Badges Row 1: Pipeline & Quality -->
[![CI Pipeline](https://img.shields.io/github/actions/workflow/status/s1informatika11s25007-maker/SambungJaga/test.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI%20Pipeline&color=10b981)](./.github/workflows/test.yml)
[![Architecture](https://img.shields.io/badge/Arsitektur-Clean%20Architecture%20Feature--First-0284c7?style=for-the-badge&logo=codeforces&logoColor=white)](#-struktur-codebase-clean-architecture-feature-first)
[![PWA Offline First](https://img.shields.io/badge/PWA-Tamper--Evident%20P5%20Ledger-f59e0b?style=for-the-badge&logo=pwa&logoColor=white)](./src/pages/caregiver/CaregiverMobilePage.jsx)
[![Unit Testing](https://img.shields.io/badge/Testing-100%25%20Passed%20(Vitest%20%2B%20Playwright)-8b5cf6?style=for-the-badge&logo=vitest&logoColor=white)](#-pengujian-otomatis--quality-assurance)

<!-- Badges Row 2: Stack -->
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%205-61dafb?style=for-the-badge&logo=react&logoColor=black)](./src)
[![Styling](https://img.shields.io/badge/Styling-TailwindCSS%20v3-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](./tailwind.config.js)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20RLS-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](./supabase/migrations/20261027000000_initial_schema.sql)
[![Engine](https://img.shields.io/badge/Engine-Groq%20Cloud%20%2B%20Gemini%20Nano-ff6b00?style=for-the-badge&logo=google&logoColor=white)](./src/services/ai/aiSuperagent.js)

</div>

---

## 🎯 Navigasi Dokumentasi

1. [📌 Latar Belakang & Solusi Masalah](#-latar-belakang--solusi-masalah)
2. [⚡ 6 Inovasi Inti Kernel (P1 – P6)](#-6-inovasi-inti-kernel-p1--p6)
3. [🏗️ Arsitektur Sistem 9 Lapisan](#%EF%B8%8F-arsitektur-sistem-9-lapisan)
4. [🌐 Strategi Dual AI Engine (Cloud + On-Device)](#-strategi-dual-ai-engine-cloud--on-device)
5. [👥 Matriks Fitur Peran Pengguna (RBAC)](#-matriks-fitur-peran-pengguna-rbac)
6. [📂 Struktur Codebase Clean Architecture (Feature-First)](#-struktur-codebase-clean-architecture-feature-first)
7. [🧪 Pengujian Otomatis & Quality Assurance](#-pengujian-otomatis--quality-assurance)
8. [🛠️ Panduan Pengoperasian & Instalasi Lokal](#%EF%B8%8F-panduan-pengoperasian--instalasi-lokal)
9. [🚀 Panduan Deployment (Vercel & Supabase)](#-panduan-deployment-vercel--supabase)
10. [🛡️ Kepatuhan UU PDP & Keamanan Data](#%EF%B8%8F-kepatuhan-uu-pdp--keamanan-data)

---

## 📌 Latar Belakang & Solusi Masalah

Di fasilitas panti jompo dan layanan *home care*, kelalaian perawatan (*care debt*) merupakan tantangan kritis yang berisiko mengancam keselamatan jiwa lansia. Fenomena ini bermula dari tiga permasalahan utama:

1. **Komunikasi Shift yang Fragmentaris**: Laporan pergantian shift (*shift handover*) kerap disampaikan secara lisan atau catatan informal yang berisiko hilang, tidak konsisten, atau terlambat ditindaklanjuti.
2. **Ketiadaan Bukti Obyektif Penutupan Tugas**: Penugasan medis seperti pemberian obat hipertensi atau injeksi insulin tidak memiliki jejak bukti digital yang dapat diverifikasi secara obyektif (*evidence-grade closure*).
3. **Eskalasi Kelalaian Berantai (*Cascade Failures*)**: Keterlambatan satu tindakan medis tanpa peringatan dini menyebabkan penumpukan *care debt* berantai yang luput dari pengawasan supervisor.

**SambungJaga AI** hadir sebagai platform tata kelola perawatan lansia yang mentransformasi laporan bebas pengasuh menjadi **Care Obligation Graph** bitemporal. Sistem ini secara otonom melacak kewajiban medis, memverifikasi bukti penutupan tugas, mendeteksi potensi risiko kegagalan, dan menegakkan batas wewenang klinis secara ketat.

---

## ⚡ 6 Inovasi Inti Kernel (P1 – P6)

| Kode | Inovasi Kernel | Deskripsi Arsitektural | Keamanan & Penegakan Aturan |
| :---: | :--- | :--- | :--- |
| **P1** | **Bitemporal Obligation Ledger** | Memisahkan *Valid Time* (titik waktu medis tindakan berlaku) dari *Transaction Time* (titik waktu data dicatat di DB). Mendukung *Retroactive Rule Replay*. | Mencegah pemalsuan tanggal mundur (*anti-backdate*) dan menjamin kalkulasi *Care Debt* yang akurat. |
| **P2** | **Evidence-Grade Closure & Spot Challenge** | Penutupan tugas wajib melampirkan bukti bertingkat (`E0` Klaim Verbal &rarr; `E1` Foto/QR &rarr; `E2` Dual Sign &rarr; `E3` Sensor/IoT) dengan audit sampel acak (*Spot Challenge*). | Menjamin tindakan medis tidak ditutup tanpa bukti valid sesuai tingkat risiko klinis. |
| **P3** | **Epistemic Fact Ledger** | Klasifikasi fakta ke dalam 5 status epistemik: `Observed` (Sensor/IoT), `Reported` (Suara/Teks), `Inferred` (AI Deduction), `Contradicted` (Konflik Data), dan `Stale` (Kedaluwarsa). | Memisahkan inferensi AI dari fakta fisik dan mendeteksi kontradiksi laporan kesehatan. |
| **P4** | **Failure-Set Search Simulator** | Simulasi pencarian kombinasi ketidakhadiran pengasuh terkecil yang dapat menelantarkan kewajiban medis kritis. | Memberikan rekomendasi panggilan perawat cadangan (*on-call*) sebelum kegagalan terjadi. |
| **P5** | **Tamper-Evident Offline Ledger** | Pencatatan rantai *cryptographic hash* SHA-256 lokal pada PWA mobile dengan timestamp atestasi perangkat. | Menjamin integritas data saat pengasuh bertugas di area tanpa koneksi internet. |
| **P6** | **Authority Envelope Gate** | Pembatasan tingkat wewenang eksekusi AI: `A0` (Read-Only), `A1` (Reversible), `A2` (Alert), `A3` (Klinis/Ireversibel). | **A3 Mandatory Human Review**: AI dilarang melakukan aksi klinis tanpa persetujuan manual supervisor. |

---

## 🏗️ Arsitektur Sistem 9 Lapisan

Sistem dirancang berdasarkan 9 lapisan arsitektur modular yang saling terhubung secara terstruktur:

```mermaid
graph TD
    A[Aktor: Pengasuh, Supervisor, Keluarga, Admin] --> L1[1 · AKSES & INGESTI]
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

## 🌐 Strategi Dual AI Engine (Cloud + On-Device)

SambungJaga AI mengombinasikan dua mesin AI secara cerdas untuk menjamin ketersediaan 100%, kecepatan sub-detik, dan perlindungan privasi medis:

```
                  ┌──────────────────────────────────────────┐
                  │          INGESTI LAPORAN PENGASUH        │
                  └────────────────────┬─────────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
          ┌─────────────────────┐             ┌─────────────────────┐
          │  Groq Cloud LLM     │             │ Chrome On-Device AI │
          │  (Llama 3.3 / Qwen) │             │ (Gemini Nano Local) │
          └──────────┬──────────┘             └──────────┬──────────┘
                     │                                   │
                     ├─ Ekstraksi Kompleks               ├─ Ringkasan Local Offline
                     ├─ Mission Orchestration            ├─ Zero-Latency Parsing
                     └─ Failure-Set Search (P4)          └─ Zero Data Leakage
```

1. **Groq Cloud Multi-Model Pipeline**:
   * **Security Guardrail**: `meta-llama/llama-prompt-guard-2-22m`
   * **Voice STT Agent**: `whisper-large-v3-turbo` / `whisper-large-v3`
   * **Extraction Worker**: `qwen/qwen3.8-27b`
   * **Mission Orchestrator**: `openai/gpt-oss-120b`
   * **Clinical Safety Gate**: `openai/gpt-oss-safeguard-20b`
2. **On-Device Chrome Built-in AI (Gemini Nano)**:
   * Berjalan 100% lokal di browser client (`window.ai.languageModel` & `window.ai.summarizer`).
   * Mengolah ringkasan laporan dan parsing fakta dasar saat perangkat dalam keadaan *offline*.
   * Menjamin privasi data medis tanpa ada informasi yang keluar dari perangkat pengasuh.

---

## 👥 Matriks Fitur Peran Pengguna (RBAC)

Sistem menyediakan 4 ruang kerja (*workspaces*) terisolasi sesuai dengan peran pengguna:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         ROLES & WORKSPACES                               │
├───────────────────┬───────────────────┬───────────────────┬──────────────┤
│  📱 CAREGIVER     │  📊 SUPERVISOR    │  👨‍👩‍👧 KELUARGA      │ ⚙️ ADMIN / HR│
│  (Pengasuh PWA)   │  (Kepala Perawat) │  (Wali Lansia)    │ (Kelola Panti│
└───────────────────┴───────────────────┴───────────────────┴──────────────┘
```

### 📱 1. Caregiver Workspace (Pengasuh PWA Mobile)
* **Zero-Friction Voice Capture**: Laporan suara langsung (Web Speech API STT) dengan deteksi entitas lansia otomatis.
* **One-Tap Quick Routine Chips**: Tombol preset rutinitas harian yang menyesuaikan waktu shift (Pagi, Siang, Malam).
* **Vision AI Camera OCR**: Pemindaian layar tensimeter/termometer digital & QR Hash lokasi lansia.
* **WhatsApp Care Bot Simulator**: Antarmuka bot WhatsApp dengan respon instan < 2 detik.
* **Tamper-Evident P5 Offline Ledger**: Penyimpanan lokal ter-hash SHA-256 saat koneksi internet terputus.

### 📊 2. Supervisor Dashboard (Kepala Perawat)
* **Realtime Care Debt Alert**: Sinyal peringatan visual & alarm sintetis (*Web Audio API*) saat keterlambatan tindakan medis terjadi.
* **Triage Matriks Risiko Medis**: Filter tugas berdasarkan kategori risiko (*Darurat*, *Urgent*, *Rutin*).
* **1-Click Auto Dispatcher Staf**: Pemetaan tugas otonom ke perawat *on-duty* berdasarkan kualifikasi kompetensi.
* **Two-Sided Handover Contract Agent**: Kontrak serah terima shift dua sisi dengan analisis risiko medis AI.

### 👨‍👩‍👧 3. Family Portal (Wali Keluarga Lansia)
* **Consent-Aware Disclosure Agent**: Penyaringan data medis otomatis sesuai batas izin privasi UU PDP.
* **Ringkasan Perawatan Ramah Keluarga**: Laporan kondisi kesehatan lansia tanpa istilah teknis medis yang membingungkan.
* **Perlindungan Privasi Visual**: Artefak foto bukti perawatan yang dipotong/diblur secara otonom (*faceless privacy crop*).

### ⚙️ 4. Admin & HR Workspace
* **P4 Failure-Set Search Simulator**: Simulasi dampak ketidakhadiran pengasuh terhadap keselamatan lansia.
* **Retroactive Rule Replay (P1)**: Pemutaran ulang riwayat kewajiban menggunakan aturan klinis versi terbaru.
* **Rule & Policy Library Manager**: Pengelolaan SOP Kemenkes/WHO, *bitemporal version bump*, dan pengujian aturan.
* **Adversarial Red Teaming Lab**: Pengujian ketahanan keamanan sistem terhadap serangan *Prompt Injection*.

---

## 📂 Struktur Codebase Clean Architecture (Feature-First)

Codebase disusun secara rapi dan modular mengikuti arsitektur **Clean Architecture Feature-First**:

```
SambungJaga/
├── .github/
│   └── workflows/
│       └── test.yml                 # GitHub Actions CI/CD Workflow (Lint, Test, Security, Build, Grading, Feedback, Deploy)
├── public/
│   ├── favicon.svg                  # Icon resmi SambungJaga
│   └── manifest.json                # Web App Manifest untuk PWA Mobile
├── src/
│   ├── components/                  # UI Components (Feature-First Architecture)
│   │   ├── caregiver/               # Modul UI Pengasuh / PWA Mobile
│   │   │   ├── CaregiverCaptureModal.jsx # Modal Ingesti Voice/Text STT
│   │   │   ├── EvidenceUploadModal.jsx   # Modal Unggah Bukti P2 (Foto/QR/Dual-Sign)
│   │   │   └── VisionCameraModal.jsx     # Camera Vision OCR & Object Scanner
│   │   ├── common/                  # Modul UI Komponen Umum
│   │   │   ├── ArchitectureModal.jsx# Modal Inspeksi Arsitektur Interactive
│   │   │   ├── Badge.jsx            # Lencana Status UI
│   │   │   ├── FloatingVoiceMic.jsx # Capture Suara Melayang
│   │   │   └── Modal.jsx            # Modal Dialog Base
│   │   ├── dashboard/               # Modul UI Widget Dashboard Supervisor
│   │   │   ├── CareDebtAlert.jsx    # Alert Sinyal Tunggakan Obligation (P1)
│   │   │   ├── EpistemicLedgerBadge.jsx # Indikator Epistemic Fact (P3)
│   │   │   └── ObligationGraphCard.jsx  # Kartu Graf Bitemporal
│   │   ├── handover/                # Modul UI Serah Terima Shift
│   │   │   └── HandoverContractCard.jsx # Kartu Handover Shift Dua Sisi
│   │   ├── layout/                  # Shell Application Layouts
│   │   │   ├── Footer.jsx           # Status Kernel Footer
│   │   │   ├── Header.jsx           # Top Navigation Bar
│   │   │   ├── Navbar.jsx           # Clean Navbar
│   │   │   ├── PublicHeader.jsx     # Header Landing Page & Auth
│   │   │   ├── RoleWorkspaceHeader.jsx # Banner Workspace Kustom per Role
│   │   │   └── Sidebar.jsx          # Navigasi Modul Utama
│   │   ├── simulator/               # Modul UI Simulator Lab P4
│   │   │   └── FailureSetSimulationModal.jsx # Modal Simulator Kegagalan P4
│   │   └── trace/                   # Modul UI Transparansi & Traceability
│   │       └── ExecutionTraceModal.jsx   # Modal Pelacak Transparansi AI
│   ├── hooks/                       # Custom React Hooks
│   │   └── core/                    # Feature Core Hook
│   │       └── useSambungJaga.js    # Custom Hook Utama (Central Dispatcher & State)
│   ├── pages/                       # Halaman Aplikasi SPA (Feature-First)
│   │   ├── audit/                   # Fitur Audit Trail
│   │   │   └── AuditTrailPage.jsx   # Halaman Append-Only Audit Trail [A]
│   │   ├── auth/                    # Fitur Autentikasi & Landing
│   │   │   ├── LandingPage.jsx      # Landing Page Utama
│   │   │   ├── LoginPage.jsx        # Split-Screen Login Page
│   │   │   └── RegisterPage.jsx     # Split-Screen Register Page
│   │   ├── caregiver/               # Fitur Pengasuh / PWA
│   │   │   └── CaregiverMobilePage.jsx # Halaman PWA Mobile Pengasuh
│   │   ├── dashboard/               # Fitur Dashboard Supervisor
│   │   │   └── SupervisorDashboardPage.jsx # Dashboard Realtime Supervisor
│   │   ├── family/                  # Fitur Portal Keluarga
│   │   │   └── FamilyPortalPage.jsx # Portal Informasi Keluarga
│   │   ├── handover/                # Fitur Handover Shift
│   │   │   └── HandoverPage.jsx     # Halaman Kontrak Serah Terima Shift
│   │   ├── rule/                    # Fitur Aturan Klinis
│   │   │   └── RuleLibraryPage.jsx  # Manajemen Aturan Klinis & Kebijakan
│   │   ├── simulator/               # Fitur Simulator Lab P4
│   │   │   └── SimulatorLabPage.jsx # Laboratorium Simulator P4
│   │   └── trace/                   # Fitur Traceability & Investigation
│   │       └── ExecutionTracePage.jsx # Pelacak Transparansi Keputusan AI
│   ├── services/                    # Core Business Engines (Feature-First)
│   │   ├── ai/                      # Service AI Engine & Local Chrome AI
│   │   │   ├── aiSuperagent.js      # Groq Orchestrator & Mission Controller
│   │   │   ├── geminiNanoService.js # Local Chrome Built-in AI Gemini Nano
│   │   │   └── nativeChromeService.js # Integration Engine Native Browser API
│   │   ├── audit/                   # Service Audit Trail
│   │   │   └── auditTrailService.js # Append-Only SHA-256 Audit Trail Engine
│   │   ├── auth/                    # Service Autentikasi & Consent PDP
│   │   │   └── consentDisclosureService.js # Filter PDP Portal Keluarga
│   │   ├── caregiver/               # Service Perawat / Evidence
│   │   │   ├── evidenceVerifier.js  # Verifikator Bukti E0-E3 & Spot Challenge (P2)
│   │   │   └── whatsappBotService.js # Simulasi & Integrasi WhatsApp Ingestion
│   │   ├── dashboard/               # Service Dashboard & Staff Management
│   │   │   ├── audioAlertService.js # Web Audio API Synthesizer Peringatan Sound
│   │   │   └── staffService.js      # Layanan Profil & Kompetensi Staf
│   │   ├── handover/                # Service Handover & Envelope
│   │   │   ├── authorityEnvelope.js # Envelope Evaluator P6 (A0-A3)
│   │   │   └── handoverContractService.js # Layanan Kontrak Shift Dua Sisi
│   │   ├── rule/                    # Service Obligation & Rule Engine
│   │   │   ├── obligationEngine.js  # Graf Bitemporal & Care Debt Engine (P1)
│   │   │   └── ruleReplayService.js # Retroactive Rule Replay Engine
│   │   ├── simulator/               # Service Simulator P4
│   │   │   └── failureSetSimulator.js # Mesin Simulasi Failure-Set Search (P4)
│   │   └── trace/                   # Service Traceability & Epistemic
│   │       └── epistemicLedger.js   # Evaluator Status Epistemik (P3)
│   ├── supabase/                    # Supabase Configuration Layer
│   │   └── client/                  # Feature Client
│   │       └── client.js            # Client Supabase dengan Fallback Resilience
│   ├── types/                       # Type Primitives Layer
│   │   └── core/                    # Feature Core Architecture Types
│   │       └── architecture.js      # Konstanta, Enum, & Tipe Arsitektur
│   └── utils/                       # Shared Utilities Layer
│       └── common/                  # Common Helpers
│           ├── formatters.js        # Utility Pemformat Waktu, Tanggal & Hash
│           └── validators.js        # Utility Validasi Prompt Injection & Bukti
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

Proyek ini dilengkapi dengan suite pengujian otomatis komprehensif (Unit Testing Vitest + End-to-End Playwright):

```bash
# Jalankan Unit Test Domain Services
npm run test:unit

# Jalankan Automated End-to-End Test Playwright
npm run test:e2e

# Jalankan Seluruh Test Suite
npm run test
```

### Ringkasan Pengujian:
1. **Audit Trail Engine Test**: Memverifikasi kalkulasi rantai *hash* SHA-256 dan deteksi manipulasi data (*tamper detection*).
2. **Authority Envelope P6 Test**: Memverifikasi penahanan otomatis aksi klinis `A3` tanpa persetujuan manual supervisor.
3. **Epistemic Fact Ledger P3 Test**: Memverifikasi klasifikasi status data (`Observed`, `Reported`, `Stale`) dan deteksi kontradiksi fakta.
4. **Evidence Verifier P2 Test**: Memverifikasi penolakan bukti jika tingkat *grade* lebih rendah dari standar klinis yang diwajibkan.
5. **Failure-Set Search P4 Test**: Memverifikasi analisis simulasi pencarian kombinasi ketidakhadiran staf terkecil.
6. **Bitemporal Obligation Ledger P1 Test**: Memverifikasi kalkulasi akumulasi *Care Debt* dan filter koordinat bitemporal.
7. **Security & Prompt Injection Test**: Memverifikasi pencegahan manipulasi prompt berbahaya.
8. **Playwright E2E Test**: Memverifikasi alur kerja nyata untuk keempat peran pengguna secara otomatis.

---

## 🛠️ Panduan Pengoperasian & Instalasi Lokal

### Prasyarat Sistem
* **Node.js**: `v18.0.0` atau `v20.x`
* **npm**: `v9.0.0` atau lebih baru

### 1. Clone Repositori
```bash
git clone https://github.com/s1informatika11s25007-maker/SambungJaga.git
cd SambungJaga
```

### 2. Install Dependensi Proyek
```bash
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Pastikan file `.env` di root proyek terkonfigurasi dengan benar:

```env
# 1. FRONTEND / VITE PUBLIC CONFIG
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GROQ_TOKEN=gsk_your_groq_api_key_here
VITE_APP_ENV=production

# 2. SUPABASE EDGE FUNCTIONS & BACKEND RUNTIME
SUPABASE_PROJECT_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=sbp_your_supabase_access_token_here
SUPABASE_DB_PASSWORD=your_supabase_db_password_here

# 3. SUPABASE REAL DATABASE CONNECTION POOLER (PgBouncer)
SUPABASE_DB_POOLER_URL=postgres://postgres.your-project:password@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# 4. AI MODEL PROVIDER & INTEGRATIONS
Groq_Token=gsk_your_groq_api_key_here
MODEL_GATEWAY_BASE_URL=https://api.groq.com/openai/v1
```

### 4. Jalankan Aplikasi Lokal
```bash
npm run dev
```
Akses aplikasi di browser pada alamat `http://localhost:3000`.

---

## 🚀 Panduan Deployment (Vercel & Supabase)

### Deployment Frontend Vercel
1. Hubungkan repositori GitHub `s1informatika11s25007-maker/SambungJaga` ke Vercel Dashboard.
2. Tambahkan environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan `VITE_GROQ_TOKEN`.
3. Jalankan **Deploy**. Vercel akan mem-build bundel aplikasi Vite secara otomatis.

### Migration Database Supabase
1. Buka SQL Editor di Supabase Dashboard.
2. Jalankan skrip SQL dari file [`supabase/migrations/20261027000000_initial_schema.sql`](./supabase/migrations/20261027000000_initial_schema.sql).
3. Skrip akan secara otomatis mengonfigurasi skema database terisolasi, kebijakan RLS, dan fungsi pencetus *hash* SHA-256.

---

## 🛡️ Kepatuhan UU PDP & Keamanan Data

1. **Prinsip Human-in-the-Loop**: Tindakan klinis berisiko tinggi (`A3`) diwajibkan melewati persetujuan manual supervisor (*Human Review*).
2. **PostgreSQL Row-Level Security (RLS)**: Perlindungan data ditegakkan pada lapisan basis data Supabase RLS.
3. **Penyaringan Konsen PDP (UU PDP)**: *Consent-Aware Disclosure Agent* menyaring data kesehatan lansia sebelum disajikan di Portal Keluarga.
4. **Care Evidence Pack (.json)**: Seluruh log transaksi dan verifikasi bukti disimpan dalam format *append-only* SHA-256 yang dapat diekspor untuk keperluan legal-medis.

---

<div align="center">

### 📄 Hak Cipta & Lisensi
Hak Cipta © 2026 **SambungJaga AI Team**. Seluruh Hak Cipta Dilindungi Undang-Undang.<br/>
Diterbitkan untuk Kompetisi & Inovasi Teknologi Kesehatan Internasional.

</div>
