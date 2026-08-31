# 🚀 Co-work — Room-Based Deadline & Excel Submission Hub

> **Inspired by Real-World Automotive Engineering at Tata Motors Design Department**  
> Built for Vibecodathon / Hackathon Speedrun • Deployable to Vercel in 1-Click

---

## 💡 The Real-World Origin & Problem

At the **Tata Motors Vehicle Design & Die Tooling Department**, the Head of Design manages dozens of engineers working on heavy stamping dies, CAD mold files, and critical tolerance spreadsheets.

### The Pain Point:
- When assigning deadlines for Excel sheets (e.g. *Punch Clearance Phase 4*, *Draw Ring Tolerances*, *Rockwell Hardness Tests*), team leads have to individually message 20+ engineers or create chaotic WhatsApp/Teams groups.
- Chasing missing files across chat channels is messy, time-consuming, and prone to missed deadlines during critical press trials.

### The Co-work Solution:
- **Among Us-Style Room Codes**: Host generates a simple 6-character room code (e.g. `TATA-DIE`).
- **Zero Friction (No Login Required)**: Engineers join instantly by entering their **Name** in a quick popup—no Google sign-in or password setup needed.
- **Host & Co-Host Hierarchy**: Room creator has Host powers to assign deadlines, view all file submissions, nudge pending members, and delegate **Co-Host** status.
- **Smart Tracking & Nudges**: Real-time live countdown timers, instant submission alerts, 1-click **"Nudge Pending Members"** audio/visual alerts, and consolidated master Excel report export.

---

## ✨ Key Features

1. **🎮 Frictionless Room Entry**
   - Among Us-style room code system (`TATA-DIE`, `CW-4921`)
   - Shareable instant join link with 1-click copy
   - Zero login / authentication barrier

2. **👑 Host & Co-Host Power Delegation**
   - Host can promote lead engineers to Co-Host
   - Co-Hosts can assign deadlines, send nudges, and inspect submissions

3. **⏰ Smart Deadline & Deliverable Manager**
   - Live countdown clocks (urgent color-coded alerts)
   - Supports Excel (`.xlsx`, `.csv`), CAD/Die files (`.step`, `.dwg`), and PDFs
   - Target assignees: Entire room or specific assigned engineers

4. **📑 Inline Excel & Spec Inspection**
   - Inspect spreadsheet data directly in the browser
   - Auto-verifies tolerance pass/fail checks and deviation flags

5. **⚡ Real-Time Nudge & Submission Notifications**
   - Instant audio chimes and toast alerts when files are submitted
   - 1-click **"Nudge"** to send high-priority pings to pending engineers

6. **📊 Master Matrix & CSV Export**
   - Live visual matrix showing every engineer × every task
   - Download consolidated team compliance report as CSV/JSON

7. **🎭 Interactive Demo User Switcher**
   - Floating role switcher to test viewing the room as **Host (B. Yerra)**, **Co-Host (Vikram)**, or **Members (Arun, Neha, Karan)** without opening incognito tabs!

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript 5 + React 19
- **Styling**: Tailwind CSS + Custom Industrial Glassmorphism Design System
- **Icons**: Lucide React
- **Sound & VFX**: Web Audio API Chimes + Canvas Confetti
- **Backend API**: Next.js Serverless Route Handlers (`app/api/*`)
- **Deployment**: Vercel Native Zero-Config Ready

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
# Navigate to http://localhost:3000
```

---

## 🌐 Deploying to Vercel (1-Click)

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the repository and click **Deploy**.
4. Zero configuration required—Next.js serverless API routes and frontend deploy automatically!

---

## 🧪 Pre-Seeded Flagship Room

- **Room Code**: `TATA-DIE`
- **Department**: Tata Motors Vehicle Design & Press Tooling Dept (Pune Plant)
- **Host**: B. Yerra (Head of Design)
- **Pre-Loaded Tasks**: Heavy Stamping Die Clearance Sheet, Nexon EV Mold Shrinkage Report, Q3 Tooling Steel Hardness Matrix.
