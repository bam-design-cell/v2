# Remix: Project Management App with GAS

A highly-polished, professional, and responsive Project Management Dashboard built with **React**, **TypeScript**, and **Tailwind CSS**. It features robust role-based access control, real-time KPI metrics, interactive Kanban boards, design review management, and an exportable Google Apps Script (GAS) structural synchronization system.

---

## 🎨 Design Concept: "Dark Immersive" Theme
This application runs on a dark, high-contrast, clutter-free theme customized for exceptional dark-room ergonomics:
- **Subtle Motion**: Interactive micro-interactions and smooth stagger animations powered by `motion` for an immersive, tactile feel.
- **Role-Based Workspaces**: Swaps views tailored perfectly for Administrators, Project Managers, and Reviewers.

---

## 🚀 Key Features

- **Dashboard & KPIs**: Keep tabs on your project registry via reactive summary cards and beautiful interactive progress monitors.
- **Interactive Project Tracker**: Comprehensive tabular view supporting dynamic search, advanced filters, details inspection, and action items.
- **Kanban Board**: Drag-and-drop/clickable layout to track project lifecycle workflows in real time.
- **Design Review Center**: Facilitates structural design uploads, interactive specs checking, and instant feedback.
- **User Management**: Administrators can provision roles, toggle administrative rights, and manage team access.
- **Google Sheets Sync**: Integrates setup and verification tools to tie external data structures smoothly.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styles & Layout**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (formerly framer-motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Development Tooling**: [Vite](https://vite.dev/)

---

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd <your-repository-name>
```

### 2. Install Dependencies
Install all NPM packages mapped in `package.json`:
```bash
npm install
```

### 3. Setup Environment Variables
Duplicate the `.env.example` file and supply any necessary keys:
```bash
cp .env.example .env
```

### 4. Run the Development Server
Launch the local Hot-Module-Replacement server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
Compile a production-optimized static bundle into the `dist/` folder:
```bash
npm run build
```

---

## 📁 Directory Structure
```text
├── assets/             # Brand resources & system illustrations
├── src/
│   ├── components/     # App modules (Dashboard, Kanban, ProjectTable, UserManagement, etc.)
│   ├── data/           # Preset and mock local datasets
│   ├── types.ts        # Typed object contracts and role enums
│   ├── App.tsx         # Main container, layout wrapper, state integration
│   ├── main.tsx        # System entry mounting script
│   └── index.css       # Core global styles & layout animations
├── metadata.json       # App configuration and capabilities manifest
├── package.json        # NPM scripts and dependency tracking
└── tsconfig.json       # TypeScript compiler parameters
```

---

## 🔒 Security & Environment
Sensitive API integrations, like the **Gemini AI SDK**, utilize secure server-side proxies at runtime using standard environments:
- Do not commit actual credential secrets like the `GEMINI_API_KEY` to public repository files.
- Always use `.env` files (excluded by default via `.gitignore`) to inject keys securely, maintaining a strict security posture.
