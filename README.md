# Gujarat Family ID Copilot
### Proactive Citizen Welfare & Entitlement Delivery Platform
> *One Family, One Identity, Complete Welfare — એક કુટુંબ, એક ઓળખ, સર્વાંગી કલ્યાણ*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![DPDP Act 2023](https://img.shields.io/badge/Compliance-DPDP_Act_2023-emerald?style=flat-square)](https://www.meity.gov.in/)
[![GIGW 3.0](https://img.shields.io/badge/Accessibility-GIGW_3.0_/_WCAG_2.1-orange?style=flat-square)](https://guidelines.india.gov.in/)

---

## Executive Overview

The **Gujarat Family ID Copilot** is a next-generation civic operating system and social protection intelligence engine designed to fundamentally transform how public welfare is administered across Gujarat's 33 districts. Traditional governance operates reactively: citizens must discover complex government programs, assemble repetitive paperwork, navigate bureaucratic silos, and submit multiple individual applications across dispersed government departments. Families frequently miss out on life-changing benefits simply due to lack of awareness or administrative friction.

This platform inverts that paradigm into a **proactive, event-driven welfare delivery model**. By establishing a unified 12-digit Family Registry linked to declarative rule engines, the system continuously evaluates household entitlements. When real-world life transitions occur—such as the birth of a child, a senior reaching age 60, spousal bereavement, or loss of income—the platform automatically determines newly unlocked benefits, alerts citizens, and prepares administrative next steps without requiring repeated manual applications.

In addition, the platform adheres strictly to the **Digital Personal Data Protection (DPDP) Act 2023**, redacting sensitive personal data (income figures, caste community classification, landholdings, clinical medical records, phone numbers, full street addresses, and exact birth dates) for administrative and public oversight, while granting authenticated household owners unredacted access to their own records.

---

## System Architecture

```
                                ┌─────────────────────────────────────────────────────────┐
                                │             GUJARAT FAMILY ID PLATFORM                  │
                                │   "One Family, One Identity, Complete Welfare Delivery" │
                                └────────────────────────────┬────────────────────────────┘
                                                             │
         ┌──────────────────────────────┬────────────────────┴───────────────┬──────────────────────────────┐
         ▼                              ▼                                    ▼                              ▼
┌──────────────────┐          ┌───────────────────┐                ┌───────────────────┐          ┌──────────────────┐
│  PROACTIVE LIFE  │          │  20 DECLARATIVE   │                │  DPDP ACT 2023    │          │  PROBABILISTIC   │
│  EVENT ENGINE    │          │  WELFARE SCHEMES  │                │  PRIVACY SHIELD   │          │  DEDUPLICATION   │
│  - 11 transitions│          │  - Dual-scope eval│                │  - Income & Caste │          │  - 4-signal model│
│  - Before/after  │          │  - Dynamic logic  │                │  - Medical & PII  │          │  - Weight tuning │
│  - Audit history │          │  - Action routes  │                │  - RBAC redaction │          │  - Talati triage │
└────────┬─────────┘          └─────────┬─────────┘                └─────────┬─────────┘          └────────┬─────────┘
         │                              │                                    │                             │
         └──────────────────────────────┴─────────────────┬──────────────────┴─────────────────────────────┘
                                                          ▼
                                ┌─────────────────────────────────────────────────────────┐
                                │         HYBRID POSTGRESQL (SUPABASE) & IN-MEMORY        │
                                │   - Families, Members, Life Events, Audit Trails, Pairs │
                                └─────────────────────────────────────────────────────────┘
```

---

## Key Features & Capabilities

### 1. DPDP Act 2023 Sensitive Data Privacy & Masking Engine

In strict compliance with the **Digital Personal Data Protection (DPDP) Act 2023** and Supreme Court constitutional privacy jurisprudence, the platform implements role-based data protection across all APIs and visual components:

| Sensitive Category | Data Field | Admin / Talati / Public View (Redacted) | Authenticated Citizen Owner View | Privacy Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Socio-Demographic** | `caste_category` | **`Protected Category`** | Actual category (`OBC Category`) | Prevents social profiling, bias, and caste discrimination |
| **Financial / Economic** | `household_income_annual` | **`₹ •••••• (LIG Verified)`** | Actual figure (`₹1,10,000`) | Personal economic privacy; prevents predatory targeting |
| **Asset Holdings** | `land_owned_acres` | **`Landholder (RoR Protected)`** | Actual acres (`1.5 Acres Land`) | Prevents predatory land acquisition & solicitation |
| **Medical / Clinical** | `disability_percentage` | **`Specially Abled (Certified)`** | Clinical percentage (`Disability (40%)`) | Protected personal health & medical records |
| **Maternal Health** | `is_pregnant` | **`Maternal Welfare (Protected)`** | `Pregnant Mother` | Protects maternal health privacy |
| **Direct Contact** | `phone_number` | **`+91 98*** **210`** | `9876543210` | Prevents phone spam, phishing, and surveillance |
| **Physical Residence** | `address` | **`[Street Address Redacted], Locality`** | Full street address | Physical security and door-level residence privacy |
| **Exact Birth Details** | `dob` | **`1984-**-**`** | `1984-06-15` | Conceals day/month to prevent identity theft |

* **Zero-Leakage Backend Pipeline**: Scheme eligibility rules run against authentic records on the server; the output payload is sanitized via [`src/lib/privacy.ts`](file:///d:/Developer/Pravi/PraviBillions/src/lib/privacy.ts) before transmission over the wire.
* **Audit Integrity with Privacy**: Even in administrative deduplication comparison modals ([`/integrity`](file:///d:/Developer/Pravi/PraviBillions/src/app/integrity/page.tsx)), field discrepancy tables display masked values (`+91 98*** **210`, `[Street Redacted]`, `Protected Category`) while preserving 100% accurate mathematical match scores (`exact`, `near`, `different`).

---

### 2. Proactive Life Event Simulation & Eligibility Sandbox

Instead of forcing citizens to research government programs every time their circumstances change, the platform models real-world life milestones in memory and computes instant before-and-after entitlement differences:

* **11 Life Transitions Modeled**:
  1. **New Child Born (`new_child_born`)**: Welcomes a newborn with customizable name and gender, evaluating girl-child bonds, maternity grants, and nutritional subsidies.
  2. **Member Turns 18 (`member_turns_18`)**: Transitions minors into adulthood, unlocking vocational training, higher secondary scholarships, and civic entitlements.
  3. **Member Turns 60 (`member_turns_60`)**: Flags senior citizenship entry, qualifying elders for state old-age pensions automatically.
  4. **Marital Status Transition → Widowed (`marital_status_widowed`)**: Records spousal loss to activate widow social security pensions and single-parent aids.
  5. **Death of Primary Breadwinner (`breadwinner_death`)**: Automatically flags household head demise, updating surviving spouse records and triggering one-time bereavement assistance.
  6. **Disability Certification (`disability_recorded`)**: Records certified disability, unlocking monthly disability pensions and assistive kits.
  7. **Income Shock / Crop Loss (`income_decreased`)**: Models sudden economic hardship, recalculating poverty bands (AAY/BPL/LIG) and emergency subsidized rations.
  8. **Upward Income Mobility (`income_increased`)**: Simulates income increases to test scheme graduation thresholds.
  9. **Child Starts Primary School (`child_starts_school`)**: Enrolls school-age children (age 6+) into foundational education incentives and pre-matric scholarships.
  10. **Youth Starts College (`child_starts_college`)**: Marks higher secondary completion (age 17+), unlocking higher education tuition waivers.
  11. **Maternal Pregnancy Recorded (`pregnancy_recorded`)**: Enrolls expectant mothers into institutional delivery and maternal healthcare support.

* **Real-Time Comparative Diffing**: Computes **Gained Schemes**, **Lost Schemes**, and **Unchanged Schemes** with exact rupee benefits and member assignments.
* **Immutable Audit Trail**: All applied life events are logged with timestamp, operator, parameters, and eligibility delta, with one-click rollback to baseline.

---

### 3. 20 Flagship State & Central Declarative Schemes

The platform encodes 20 flagship state (Gujarat) and national (Government of India) welfare programs into deterministic, rule-based pure functions:

| Scheme Name | Department / Domain | Scope | Primary Eligibility Criteria | Benefit Profile |
| :--- | :--- | :--- | :--- | :--- |
| **National Family Benefit Scheme (NFBS)** | Social Security | Family | Head death, age 18–59, BPL/AAY band | ₹20,000 one-time bereavement grant |
| **Vridh Sahay (Old-Age Pension)** | Senior Welfare | Member | Senior 60+, income < ₹1.2L (rural) / ₹1.5L (urban) | ₹1,000–₹1,250 monthly pension |
| **Ganga Swaroopa Yojana** | Women Empowerment | Member | Widowed female, age 18–60, no adult son, income cap | ₹1,250 monthly widow pension |
| **Gujarat Disability Pension** | Special Needs | Member | 60%+ certified disability, BPL/AAY | ₹1,000–₹1,250 monthly pension |
| **Post-Matric Scholarship (SC)** | Higher Education | Member | SC community, age 17–30, higher secondary/college | Full tuition waiver + maintenance |
| **Post-Matric Scholarship (ST)** | Higher Education | Member | ST community, age 17–30, higher secondary/college | Full tuition waiver + maintenance |
| **Post-Matric Scholarship (OBC)** | Higher Education | Member | OBC community, higher secondary/college, income < ₹1L | Tuition grant + maintenance allowance |
| **Vahli Dikri Yojana** | Girl Child Welfare | Member | Female child, ≤ 2 daughters in family, income ≤ ₹2L | ₹1,10,000 staggered bond |
| **PMAY Housing (EWS)** | Shelter / Urban Dev | Family | Kutcha dwelling, annual income ≤ ₹3,00,000 | Up to ₹2.67 Lakh interest subsidy |
| **PMAY Housing (LIG)** | Shelter / Urban Dev | Family | Kutcha dwelling, income ₹3,00,01–₹6,00,000 | Up to ₹2.35 Lakh interest subsidy |
| **Janani Suraksha Yojana** | Maternal Health | Member | Pregnant female, institutional delivery, BPL/SC/ST | ₹700 (rural) / ₹600 (urban) cash aid |
| **PMKVY Skill Development** | Youth Employment | Member | Age 15–45, unemployed or student | Free training + ₹8,000 stipend |
| **Antyodaya Anna Yojana (AAY) Ration** | Food & Civil Supplies | Family | Ultra-poor, annual income ≤ ₹15,000 | Fixed 35 kg foodgrains at ₹2–₹3/kg |
| **Priority Household (PHH) Ration** | Food & Civil Supplies | Family | Below Poverty Line, income ₹15,001–₹1,00,000 | 5 kg foodgrains per member monthly |
| **Pre-Matric Scholarship (SC/ST)** | School Education | Member | SC/ST students, age 6–16, Class 1–10, income ≤ ₹2L | Monthly stipend + annual grant |
| **Manav Garima Yojana** | Micro-Livelihood | Member | SC/ST/OBC, BPL status, artisan/tradesperson | Equipment toolkit worth ₹4,000 |
| **Palak Mata Pita Yojana** | Foster Care | Member | Orphaned minor (< 18 yrs), family income ≤ ₹1.2L | ₹3,000 monthly support per child |
| **Kanya Kelavni Mahotsav** | Girl Child Retention | Member | Female child in school, age 6–18, BPL family | ₹3,000–₹5,000 annual academic grant |
| **Indira Gandhi Widow Pension (IGNWPS)** | Central Social Assistance | Member | Widowed female, age 40–79, BPL certified | ₹300/mo central + state top-up |
| **Indira Gandhi Disability Pension (IGNDPS)**| Central Social Assistance | Member | Severe disability (80%+), age 18–79, BPL certified | ₹300/mo central + state top-up |

---

### 4. Probabilistic Deduplication & Registry Integrity Engine

Detects ghost beneficiaries, duplicate enrollments, and synthetic identity inflation:

* **4-Signal Linkage Model (100-Point Composite Score)**:
  * **Head & Spouse Name Similarity (20 pts)**: Dice coefficient + normalized Levenshtein edit distance.
  * **Normalized Address & Pincode (10 pts)**: Normalizes street types and postal locality clusters.
  * **Head of Household DOB Proximity (30 pts)**: Detects exact and near birthday typo distances.
  * **Sanitized Telephone Matching (40 pts)**: Compares normalized 10-digit mobile numbers.
* **Dynamic Weight & Threshold Tuning**: Real-time sliders allow officers to tune confidence thresholds (default: 50%) and re-scan the entire database on the fly.
* **Talati Triage Workflow**: Officers can inspect discrepancies side-by-side and mark pairs as **Confirmed Duplicate**, **False Positive**, or **Pending**.

---

### 5. Interactive Generational Family Tree View

* Replaces flat tables with an interactive tree organizing families into three generational tiers:
  * **Elder Generation**: Parents and grandparents.
  * **Household Anchor**: Head of household and spouse.
  * **Next Generation**: Children and dependents.
* Displays directly mapped welfare entitlements under each member node.
* Supports 1-click dispatch into the Life-Event Simulator pre-filled for that individual.

---

### 6. Gujarat Digital Smart Card & NFSA Ration Calculator

* **Printable Digital Smart Card**: Features 12-digit Family ID, Ashoka emblem, biometric QR code, and Aadhaar e-KYC verified status. Supports print and PDF download.
* **NFSA Monthly Foodgrain Calculator**:
  * **AAY**: 35 kg grain basket (wheat, rice, coarse grains) per household.
  * **PHH**: 5 kg per living member per month (3 kg wheat, 1.5 kg rice, 0.5 kg coarse grains).

---

### 7. Trilingual Voice-Enabled Civic Copilot

* **Conversational 5-Step Intake**: Language $\rightarrow$ Geography (33 districts) $\rightarrow$ Roster $\rightarrow$ Socio-economic $\rightarrow$ Dwelling.
* **Web Speech API Voice Synthesis (TTS)**: Full audio readouts in native **Gujarati**, **Hindi**, and **English**.
* **Personalized Welfare Roadmap**: Summary of monthly financial benefits, required documents, and local administrative nodal centers.

---

### 8. GIGW Accessibility & Custom Design System

* **GIGW 3.0 Compliance**: Integrated font scaling (`A` standard, `A+` large) with smooth transitions.
* **Gujarat Sandstone Alabaster & Somnath Royal Teal Design System**:
  * **Alabaster & Sandstone Canvas**: `#FAF8F2`, `#FAF7F0`, `#F5EFE4`.
  * **Somnath Royal Teal**: `#133B42`, `#1A4B54`.
  * **Gujarat Saffron & Green Accents**: `#D46E38`, `#28604A`.
* **ReactBits Visual Componentry**:
  * `SpotlightCard`: Mouse-tracking interactive glow.
  * `BorderBeam`: Animated border light beam.
  * `ShinyText`: Dynamic shimmering typography.
  * `AnimatedCounter`: Spring-interpolated statistical counters.
  * `AuroraGlow`: Ambient fluid lighting.

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.5 (Turbopack, App Router) | SSR, SSG, Server Actions, Dynamic API Routes |
| **Core UI** | React 19.0.0, TypeScript 5 | Component architecture, strict type safety |
| **Styling** | Tailwind CSS v4, Lucide React | Modern utility styling, SVG civic icon set |
| **Animations** | Motion (Framer Motion) | Micro-interactions, spring physics, layout animations |
| **State & Fetching** | TanStack React Query v5 | Server state caching, optimistic updates, query invalidation |
| **Database** | PostgreSQL (via Supabase) | Persistent civic records, RLS policies, connection pooling |
| **Data Protection** | Custom DPDP Act 2023 Masking Engine | Role-based redaction of PII, income, caste, and health data |
| **Accessibility** | Custom AccessibilityProvider | GIGW 3.0 / WCAG 2.1 AA font scaling and contrast compliance |
| **Localization** | Custom LanguageContext | Trilingual support (English, हिन्दी, ગુજરાતી) |

---

## Database Architecture & Schema

The platform integrates with **PostgreSQL via Supabase** with automatic memory fallbacks.

### Tables Overview
1. `families`: 12-digit household records, district, area type, annual income, caste category, landholding, housing, contact, pincode.
2. `family_members`: Member demographics, relation to head, DOB, gender, marital status, disability, pregnancy, alive status.
3. `life_event_logs`: Audit log of applied transitions, parameters, before/after diffs, timestamps.
4. `duplicate_pairs`: Flagged duplicate candidate records, signal scores, field comparisons, and Talati audit status.
5. `user_profiles`: Authentication records, email, role (`citizen` vs `admin`), and linked `family_id`.

### Database Setup
To initialize or replicate the database schema, run the DDL in Supabase SQL Editor:
```sql
-- See full schema in src/lib/supabase/schema.sql
CREATE TABLE IF NOT EXISTS families (
  family_id VARCHAR(12) PRIMARY KEY,
  district VARCHAR(50) NOT NULL,
  household_income_annual NUMERIC NOT NULL DEFAULT 0,
  income_band VARCHAR(10) NOT NULL,
  caste_category VARCHAR(20) NOT NULL DEFAULT 'general',
  land_owned_acres NUMERIC NOT NULL DEFAULT 0,
  house_type VARCHAR(20) NOT NULL DEFAULT 'pucca',
  phone_number VARCHAR(30),
  address TEXT NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  area_type VARCHAR(20) NOT NULL DEFAULT 'rural',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100) DEFAULT 'system'
);
```

To migrate initial Gujarat synthetic seed data to PostgreSQL:
```bash
npm run migrate:supabase
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or newer (`v20+` recommended)
- **npm**: `v9+` or **pnpm** / **yarn**

### 1. Clone Repository
```bash
git clone https://github.com/kavya020805/PraviBillions.git
cd PraviBillions
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase PostgreSQL Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Direct PostgreSQL Connection (Optional)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```
> *Note: If Supabase variables are not provided, the platform automatically runs on high-fidelity in-memory seed data with 100% feature availability.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Typecheck
```bash
# Typecheck
npx tsc --noEmit

# Production bundle build
npm run build

# Start production server
npm run start
```

---

## Demo Personas & Testing

| Persona Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Citizen (Household Owner)** | `citizen@gujarat.gov.in` | `Citizen@123` | **Full Unmasked Access** to Patel Family (`240100000001`). Can view actual income, caste, phone, address, and commit life events. |
| **Talati / Administrative Officer** | `admin@gujarat.gov.in` | `Admin@123` | **Administrative Access across Gujarat**. Cross-district duplicate audits, registry management. **DPDP Act 2023 Masking Active** (PII, income, caste, and health data are redacted). |

---

## Deployment to Vercel

1. Push your repository to GitHub (`main` branch).
2. Go to [Vercel Dashboard](https://vercel.com/) and click **"Add New..." $\rightarrow$ "Project"**.
3. Import the `PraviBillions` repository.
4. Set Framework Preset to **Next.js**.
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Click **Deploy**. Vercel will automatically build and deploy the production bundle.

---

## Standards & Governance Compliance

* **Digital Personal Data Protection (DPDP) Act 2023**: Implements purpose limitation, data minimization, and automated redaction of sensitive socio-demographic and financial attributes.
* **Guidelines for Indian Government Websites (GIGW 3.0)**: Supports trilingual navigation, high-contrast readability, and `A`/`A+` font scaling.
* **W3C WCAG 2.1 Level AA**: Semantic HTML elements, accessible form labels, keyboard navigability, and ARIA roles.

---

## License

This project is released under the **MIT License**. Developed as an open civic innovation prototype for digital public infrastructure in Gujarat.
