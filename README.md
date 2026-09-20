# Gujarat Family ID Copilot
### Proactive Citizen Welfare & Entitlement Delivery Platform
> *One Family, One Identity, Complete Welfare — એક કુટુંબ, એક ઓળખ, સર્વાંગી કલ્યાણ*

---

## Executive Overview

The **Gujarat Family ID Copilot** is a next-generation civic operating system and social protection intelligence engine designed to fundamentally transform how public welfare is administered. Traditional governance models operate reactively: citizens must discover complex government programs, assemble repetitive paperwork, navigate bureaucratic silos, and submit multiple individual applications across dispersed government departments. Families often miss out on crucial life-changing benefits simply due to lack of awareness or administrative hurdles.

This platform inverts that paradigm into a **proactive, event-driven welfare delivery model**. By establishing a unified 12-digit Family Registry linked to declarative rule engines, the system continuously evaluates household entitlements. When real-world life transitions occur—such as the birth of a child, a senior reaching age 60, spousal bereavement, or loss of income—the platform automatically determines newly unlocked benefits, alerts citizens, and prepares administrative next steps without requiring repeated manual applications.

In addition to citizen-facing empowerment, the platform equips Panchayat Talati officers and state administrators with an algorithmic data integrity engine. Through probabilistic multi-signal record linkage, the system detects duplicate family registrations, prevents synthetic identity inflation, and ensures public treasury resources reach genuine beneficiaries.

---

## Core System Capabilities & Features

```
                               ┌────────────────────────────────────────────────┐
                               │            GUJARAT FAMILY ID SYSTEM            │
                               │  "One Family, One Identity, Complete Welfare"  │
                               └───────────────────────┬────────────────────────┘
                                                       │
         ┌──────────────────────────────┬──────────────┴───────────────┬──────────────────────────────┐
         ▼                              ▼                              ▼                              ▼
┌──────────────────┐          ┌───────────────────┐          ┌───────────────────┐          ┌──────────────────┐
│  PROACTIVE LIFE  │          │  20 DECLARATIVE   │          │  PROBABILISTIC    │          │  TRILINGUAL      │
│  EVENT SIMULATOR │          │  WELFARE SCHEMES  │          │  DEDUPLICATION    │          │  CIVIC COPILOT   │
│  - 11 transitions│          │  - Dual-scope eval│          │  - 4-signal model │          │  - 5-step intake │
│  - Before/after  │          │  - Dynamic logic  │          │  - Weight tuning  │          │  - Web Speech TTS│
│  - Audit history │          │  - Action routes  │          │  - Triage flow    │          │  - Action plan   │
└──────────────────┘          └───────────────────┘          └───────────────────┘          └──────────────────┘
```

---

### 1. Proactive Life Event Simulation & Eligibility Engine

Rather than requiring citizens to research eligibility criteria for every milestone, the platform implements an active life transition simulation sandbox that models real-world life changes and computes instant before-and-after entitlement differences.

* **11 Realistic Life Transitions Modeled**:
  1. **New Child Born (`new_child_born`)**: Welcomes a newborn into the household roster with custom name and gender assignment, immediately evaluating girl-child bonds, maternity grants, and nutritional subsidies.
  2. **Member Turns 18 (`member_turns_18`)**: Transitions minors into legal adulthood, unlocking adult vocational training, higher secondary scholarships, and voting-age civic entitlements.
  3. **Member Turns 60 (`member_turns_60`)**: Flags senior citizenship entry, automatically qualifying elders for state old-age pensions without visiting tehsil offices.
  4. **Marital Status Transition → Widowed (`marital_status_widowed`)**: Records the loss of a spouse to activate widow social security pensions and single-parent aids.
  5. **Death of Primary Breadwinner (`breadwinner_death`)**: Automatically flags the death of the household head, updating surviving spouse records and triggering immediate one-time bereavement assistance.
  6. **Disability Certification (`disability_recorded`)**: Records medical disability certifications and severity percentages, unlocking specialized monthly disability pensions and assistive equipment kits.
  7. **Income Shock / Decline (`income_decreased`)**: Models sudden economic hardship or crop loss, recalculating household poverty bands (AAY/BPL/LIG) and unlocking emergency subsidized rations.
  8. **Upward Income Mobility (`income_increased`)**: Simulates income increases to test scheme graduation thresholds and ensure transparent income band compliance.
  9. **Child Starts Primary School (`child_starts_school`)**: Enrolls school-age children (age 6+) into foundational education incentives and pre-matric scholarship tracks.
  10. **Youth Starts College (`child_starts_college`)**: Marks higher secondary completion (age 17+), unlocking higher education tuition waivers and post-matric scholarship programs.
  11. **Maternal Pregnancy Recorded (`pregnancy_recorded`)**: Enrolls expectant mothers into institutional delivery support and maternal health tracking programs.

* **Real-Time Comparative Eligibility Diffing**:
  * For every simulated transition, the engine evaluates both baseline state and simulated future state simultaneously.
  * Generates an instant granular diff: **Gained Schemes** (newly qualified), **Lost Schemes** (graduated or disqualified), and **Unchanged Baseline**.
  * Shows exact monetary impact and specific family member allocations.

* **Strict Civic Logic & Edge-Case Validation**:
  * Prevents impossible or contradictory civic states (e.g., preventing duplicate child names in the same home, barring already 60+ individuals from re-turning 60, enforcing that only married members can become widowed, and restricting pregnancy entries strictly to alive female members within biological age bands).

* **Persistent Audit History & Rollback Capabilities**:
  * Every applied life event is chronologically recorded in an audit trail with timestamp, operator, specific delta metrics, and scheme changes.
  * Allows one-click state restoration back to the baseline profile.

---

### 2. Comprehensive 20-Scheme Declarative Engine

The platform encodes 20 flagship state (Gujarat) and national (Government of India) welfare programs into deterministic, rule-based predicates.

* **Dual-Scope Evaluation (Household vs. Individual Member)**:
  * **Family-Scoped Schemes**: Evaluated at the collective household unit level (e.g., housing conditions, cumulative annual income, total landholding, ration band).
  * **Member-Scoped Schemes**: Evaluated individually for every living family member (e.g., age, gender, education status, marital status, disability percentage, occupation).

| Scheme Name | Administrative Domain | Scope | Primary Eligibility Factors | Benefit Profile |
| :--- | :--- | :--- | :--- | :--- |
| **National Family Benefit Scheme (NFBS)** | Social Security | Family | Head death, age 18–59, BPL/AAY band | ₹20,000 one-time bereavement grant |
| **Vridh Sahay (Old-Age Pension)** | Senior Welfare | Member | Senior 60+, income < ₹1.2L (rural) / ₹1.5L (urban) | ₹1,000–₹1,250 monthly pension |
| **Ganga Swaroopa Yojana** | Women Empowerment | Member | Widowed female, age 18–60, no adult son, income cap | ₹1,250 monthly widow pension |
| **Gujarat Disability Pension** | Special Needs | Member | 60%+ certified disability, BPL/AAY | ₹1,000–₹1,250 monthly pension |
| **Post-Matric Scholarship (SC)** | Higher Education | Member | SC community, age 17–30, higher secondary/college | Full tuition waiver + maintenance |
| **Post-Matric Scholarship (ST)** | Higher Education | Member | ST community, age 17–30, higher secondary/college | Full tuition waiver + maintenance |
| **Post-Matric Scholarship (OBC)** | Higher Education | Member | OBC community, higher secondary/college, income < ₹1L | Tuition grant + maintenance allowance |
| **Vahli Dikri Yojana** | Girl Child Welfare | Member | Female child, ≤ 2 daughters in family, income ≤ ₹2L | ₹1,10,000 staggered education & marriage bond |
| **PMAY Housing (EWS)** | Urban/Rural Shelter | Family | Kutcha dwelling, annual income ≤ ₹3,00,000 | Up to ₹2.67 Lakh interest subsidy |
| **PMAY Housing (LIG)** | Urban/Rural Shelter | Family | Kutcha dwelling, income ₹3,00,001–₹6,00,000 | Up to ₹2.35 Lakh interest subsidy |
| **Janani Suraksha Yojana** | Maternal Healthcare | Member | Pregnant female, institutional delivery, BPL/SC/ST | ₹700 (rural) / ₹600 (urban) cash aid |
| **PMKVY Skill Development** | Youth Employment | Member | Age 15–45, unemployed/student | Free certified industry training + ₹8,000 stipend |
| **Antyodaya Anna Yojana (AAY) Ration** | Food Security / PDS | Family | Ultra-poor, annual income ≤ ₹15,000 | Fixed 35 kg foodgrains at ₹2–₹3/kg monthly |
| **Priority Household (PHH) Ration** | Food Security / PDS | Family | Below Poverty Line, income ₹15,001–₹1,00,000 | 5 kg foodgrains per member monthly |
| **Pre-Matric Scholarship (SC/ST)** | School Education | Member | SC/ST students, age 6–16, Class 1–10, income ≤ ₹2L | Monthly stipend + annual grant |
| **Manav Garima Yojana** | Micro-Livelihood | Member | SC/ST/OBC, BPL status, artisan/tradesperson | Equipment & professional toolkit worth ₹4,000 |
| **Palak Mata Pita Yojana** | Orphan Child Support | Member | Orphaned minor (< 18 yrs), family income ≤ ₹1.2L | ₹3,000 monthly foster support per child |
| **Kanya Kelavni Mahotsav** | Girl Child Retention | Member | Female child in school, age 6–18, BPL family | ₹3,000–₹5,000 annual academic grant |
| **Indira Gandhi Widow Pension (IGNWPS)** | Central Social Security | Member | Widowed female, age 40–79, BPL certified | ₹300 monthly central stipend + state top-up |
| **Indira Gandhi Disability Pension (IGNDPS)** | Central Social Security | Member | Severe disability (80%+), age 18–79, BPL certified | ₹300 monthly central stipend + state top-up |

* **Prescriptive Administrative Guidance**:
  * Every eligible scheme provides exact, actionable instructions indicating which physical nodal centers to visit (District Social Welfare Office, Mamlatdar, Taluka Supply Office, e-Gram Center, Anganwadi, Primary Health Center) and which state web portals handle digital submissions (Digital Gujarat, e-Samaj Kalyan, PMAY-MIS, NSP).

---

### 3. Probabilistic Registry Deduplication & Integrity Engine

Duplicate identity entries, ghost beneficiaries, and cross-district ration hoarding represent significant drains on state budgets. The platform features an automated deduplication and registry integrity engine operating on probabilistic matching algorithms.

* **Multi-Signal Similarity Scoring Pipeline (100-Point Composite Model)**:
  * **Head & Spouse Name Similarity (Weight: 20 pts)**: Computes lexical and phonetic similarity using Dice coefficient matching combined with normalized Levenshtein edit distance, penalizing spelling variations in regional transliterations.
  * **Normalized Address & Pincode Matching (Weight: 10 pts)**: Normalizes street types, quarters, and societal nomenclature while checking for identical postal code locality clusters.
  * **Head of Household Date of Birth Proximity (Weight: 30 pts)**: Detects exact birthday matches as well as 30-day and 365-day typo distances common in manual registry entry.
  * **Sanitized Telephone Matching (Weight: 40 pts)**: Compares normalized 10-digit mobile numbers across family units.

* **Configurable Administrative Tuning Controls**:
  * Officers can dynamically adjust individual signal weights and overall confidence thresholds (default: 50%) via real-time sliders to calibrate sensitivity for deep registry re-scans.

* **Side-by-Side Granular Field Concordance**:
  * Displays high-risk duplicate candidate pairs side-by-side with color-coded comparison badges marking fields as **Exact Match**, **Near Match** (with similarity percentage), or **Divergent**.
  * Breaks down Head of Household names, spouse names, full address lines, PIN codes, contact numbers, birth dates, district jurisdictions, and household sizes.

* **Administrative Triage Workflow**:
  * Talati officers can examine flagged pairs and record official verdicts: **Confirm Duplicate** (marking records for consolidation), **Mark False Positive** (clearing benign matches), or leave as **Pending** for field verification.

---

### 4. Interactive Visual Family Tree & Generational Hierarchy

The household portal replaces flat tabular rosters with an interactive generational family tree visualizing the complete structure of the household.

* **Generational Tiering**:
  * Automatically organizes family members into three clear generational tiers: **Elder Generation** (grandparents/parents), **Household Anchor** (head of household and spouse), and **Next Generation** (children and younger dependents).
* **Targeted Scheme Association**:
  * Directly links individual welfare entitlements to the specific member card within the tree (e.g., girl-child milestone grants displayed under daughter cards; old-age pensions tied directly to grandparent cards).
* **Direct Sandbox Dispatch**:
  * Officers and citizens can click on any node in the tree to trigger context-aware life event simulations specifically pre-filled for that individual member.

---

### 5. Gujarat Digital Smart Family Card & NFSA Foodgrain Quota

Every verified household profile generates an official digital credential modeled after state civic identity documents.

* **Digital Smart Family Card**:
  * Displays the unique 12-digit Gujarat Household ID, district of registry, head of household identification, official QR code verification badge, and 100% Aadhaar e-KYC status indicators.
  * Supports direct high-resolution citizen printing and digital download for distribution at Gram Panchayat centers.

* **Automated Monthly NFSA Foodgrain Calculator**:
  * Dynamically computes monthly Public Distribution System (PDS) ration grain allotments in real time based on household economic categorization and active head count:
    * **Antyodaya Anna Yojana (AAY)**: Flat 35 kg foodgrain basket per household per month (subsidized wheat, rice, and coarse grains).
    * **Priority Household (PHH)**: 5 kg grain quota per living member per month (split into 3 kg wheat, 1.5 kg rice, 0.5 kg coarse grains).

---

### 6. Trilingual Civic Welfare Copilot (Voice-Enabled Assistant)

For unassisted citizen discovery and rural accessibility, the platform provides an inclusive, step-by-step welfare assistant.

* **Conversational 5-Step Intake**:
  1. **Language Preference**: Allows switching between English, Hindi, and Gujarati at any stage.
  2. **Geography & Jurisdiction**: Selection across all 33 Gujarat administrative districts, distinguishing Rural Gram Panchayats from Urban Municipalities.
  3. **Household Roster Builder**: Dynamic interface allowing citizens to add family members, ages, genders, relationships, occupations, and certified disability percentages.
  4. **Socioeconomic Classification**: Income sliders and social category selection (General, OBC, SC, ST) with automatic poverty band indexing.
  5. **Dwelling & Landholding Assessment**: Captures kutcha vs. pucca housing structure and agricultural land acreage.

* **Integrated Web Speech API Voice Synthesis (TTS)**:
  * Full audio readout of all intake questions, category explanations, and final scheme results in native **Gujarati**, **Hindi**, and **English**.
  * Includes audio controls to play, pause, and replay guidance for citizens with limited digital or textual literacy.

* **Personalized Welfare Action Plan**:
  * Generates an immediate printable roadmap of all qualified state programs, summarizing monthly financial benefits, required verification documents, and designated local administrative offices.

---

### 7. Dual-Persona Civic Architecture & Localization

The application is structured to serve two distinct user cohorts through unified data models:

* **Citizen Household Experience**:
  * Tailored for household members to inspect their own smart card, review monthly ration allocations, understand family welfare rights, and test how future life events will impact their entitlements.
* **Administrative / Talati Officer Experience**:
  * Built for Panchayat officials, Mamlatdar staff, and social welfare inspectors to audit district registries, triage duplicate flags, simulate life event updates on behalf of visiting citizens, and monitor cross-district welfare coverage.
* **Native Trilingual Support (English, हिन्दी, ગુજરાતી)**:
  * Complete, fluent trilingual translations across every page, dashboard metric, dialog modal, scheme specification, and status indicator.

---

## Architectural Principles & Integrity

* **Declarative Business Logic**: Scheme eligibility rules and life event mutation operations are defined as deterministic pure functions, decoupling civic policy rules from presentation layers.
* **Zero Form Redundancy**: A single household identity model powers simulations, deduplication audits, and welfare discovery simultaneously, eliminating redundant data entry.
* **Auditability & Traceability**: All life events preserve immutable before-and-after snapshots, creating an audit-ready trail for state social audits.
* **Demographic Realism**: Seeded across synthetic household profiles reflecting genuine Gujarat demographic distributions, caste categories, income distributions, and geographical districts.
