# 🏪 TijaratPro ERP — Frontend

The frontend application for **TijaratPro**, a modern multi-tenant ERP & POS platform built for retail businesses.

The frontend provides the web-based ERP interface and the **Electron desktop POS application**, sharing the same application architecture and backend API.

---

## 🚀 Technology Stack

* **Next.js** — App Router
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Electron** — Desktop POS
* **Zustand** — Client-side state management
* **Axios** — API communication
* **Electron Builder** — Desktop application packaging
* **electron-updater** — Automatic application updates

---

## 🧩 Application Architecture

The frontend is responsible for the user-facing TijaratPro experience.

```text
TijaratPro Frontend
│
├── Web Application
│   ├── Authentication
│   ├── Dashboard
│   ├── POS
│   ├── Products
│   ├── Inventory
│   ├── Customers
│   ├── Suppliers
│   ├── Ledger
│   ├── Repairs
│   ├── Organizations
│   ├── Workforce & Roles
│   ├── Settings
│   └── Theme System
│
└── Electron Desktop Application
    ├── Desktop POS
    ├── Local application shell
    ├── Electron main process
    ├── Auto-update system
    └── Windows installer
```

---

## 🔐 Authentication & Access Control

The frontend integrates with the TijaratPro backend authentication system.

Current capabilities include:

* JWT-based authentication
* Refresh-token authentication flow
* Protected application routes
* Organization-aware access
* Shop-aware access
* Role-based access control
* Permission-aware UI
* Device-aware Electron authentication

---

## 🏢 Organization & Multi-Shop UI

TijaratPro uses an **Organization → Shop → User** architecture.

The frontend supports:

* Active organization selection
* Shop switching
* Organization-level views
* Shop-level views
* Organization members
* Workforce management
* Role and permission management
* Shop-scoped operations

The UI is designed to support both **single-shop businesses** and **multi-shop organizations**.

---

## 🛒 POS

The POS interface is designed as a dedicated workspace rather than a traditional dashboard page.

Current POS capabilities include:

* Product search
* Cart management
* Sale workspace
* Cart summary
* Product selection
* Sales processing
* Standalone POS layout

The Electron application provides the desktop POS experience.

---

## 📦 Inventory

The frontend includes inventory management workspaces for:

* Products
* Stock management
* Restocking
* Low-stock management
* Damaged stock
* Replacement & warranty operations
* Inventory operations

The inventory UI communicates with the backend API for persistent business data.

---

## 👥 Business Management

Current frontend modules include:

* Customers
* Suppliers
* Parties
* Ledger
* Orders
* Invoices
* Expenses
* Repairs
* Notifications
* Dashboard
* Organizations
* Workforce
* Settings

---

## 🎨 Design System

TijaratPro uses a centralized design system based on reusable components and semantic design tokens.

Current design-system capabilities include:

* Light theme
* Dark theme
* Semantic color tokens
* Brand-based theming
* Reusable UI components
* Consistent typography
* Shared spacing and layout patterns
* Theme customization

The frontend aims to avoid unnecessary hardcoded UI values and instead uses the application's global design tokens.

---

## 🖥️ Electron Desktop Application

TijaratPro can be packaged as a Windows desktop application using Electron.

### Electron responsibilities

* Desktop application shell
* Windows installer
* Desktop POS experience
* Electron main process
* Application lifecycle management
* Automatic application updates

### Build & Packaging

The application uses **Electron Builder** to generate Windows releases.

Release artifacts include:

```text
TijaratPro-Setup-x.x.x.exe
TijaratPro-Setup-x.x.x.exe.blockmap
latest.yml
```

---

## 🔄 Automatic Updates

TijaratPro uses `electron-updater` with a **generic update provider**.

Because the GitHub repository containing release assets is private, the Electron application does not directly authenticate with GitHub.

Instead, the update architecture uses the TijaratPro backend as a secure release gateway:

```text
Electron App
     │
     │ Check for update
     ▼
TijaratPro Backend
     │
     │ Authenticated GitHub API request
     ▼
Private GitHub Release
     │
     │ Asset download redirect
     ▼
AWS/GitHub Asset Storage
     │
     ▼
Electron App
```

### Security model

The GitHub authentication token:

* Exists only on the backend
* Is stored using Google Cloud Secret Manager
* Is injected into the Cloud Run runtime
* Is never included in the Electron application
* Is never exposed to the desktop client

The backend also validates requested update filenames and uses rate limiting and release metadata caching.

### Current status

**Automatic update system is operational.**

A production test was completed using:

```text
v0.1.2
   ↓
v0.1.3
```

The installed older version detected the newer release, downloaded the update, displayed the installation prompt, and successfully installed the newer version.

A future improvement is planned to provide a more seamless **VS Code-style restart-and-update experience**.

---

## 🌐 Backend API

The frontend communicates with the TijaratPro backend through REST APIs.

The backend is responsible for:

* Authentication
* Authorization
* Business logic
* Organization management
* Database operations
* Inventory
* Sales
* Customers
* Suppliers
* Ledger
* Subscriptions
* Application updates

Backend technology and deployment details are documented separately in the backend repository.

---

## 📁 Frontend Structure

The frontend follows a modular application structure.

```text
frontend/
│
├── app/
│   ├── dashboard/
│   ├── sale/
│   ├── inventory/
│   ├── customers/
│   ├── suppliers/
│   ├── ledger/
│   ├── organizations/
│   ├── settings/
│   └── ...
│
├── components/
│   └── reusable UI components
│
├── stores/
│   └── Zustand stores
│
├── lib/
│   └── API and application utilities
│
├── electron/
│   └── Electron main-process code
│
├── public/
│
└── package.json
```

---

## 🛠️ Development

Install dependencies:

```bash
npm install
```

Start the frontend development environment:

```bash
npm run dev
```

For the combined frontend + Electron development environment, use the project's configured development command.

> Check `package.json` for the exact available scripts in the current version.

---

## 📦 Production Build

The frontend can be built and packaged for production using the project's configured build and release scripts.

Electron production releases are generated using **Electron Builder**.

Release versions follow semantic versioning:

```text
v0.1.0
v0.1.1
v0.1.2
v0.1.3
```

---

## 🚢 Deployment

The frontend web application is deployed separately from the backend API.

Current architecture:

```text
Frontend
   │
   └── Web Application
          │
          ▼
       Vercel

Electron
   │
   └── Windows Application
          │
          ▼
    GitHub Releases
          │
          ▲
    Cloud Run Update Proxy
```

The backend API runs separately on **Google Cloud Run**.

---

## 📌 Project Status

TijaratPro is currently under active development.

### Completed

* Authentication UI
* ERP dashboard
* POS interface
* Inventory workspaces
* Organization architecture
* Multi-shop UI
* Workforce and role management
* Theme system
* Light/Dark mode
* Electron desktop application
* Windows installer
* Private GitHub release workflow
* Secure Electron automatic updates

### In Progress

* Continued ERP module refinement
* UI/UX polishing
* Production hardening
* Documentation

### Planned

* Seamless VS Code-style application updating
* Further offline-first capabilities
* Advanced synchronization
* Additional ERP functionality

---

## 📄 License

TijaratPro is currently a private/proprietary project.
