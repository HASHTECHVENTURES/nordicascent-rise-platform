# Nordic Ascent Platform — Regional & Compliance Assessment

**Document version:** 1.0  
**Date:** 31 August 2026  
**Scope:** India (candidates) ↔ Norway / Nordic region (employers)  
**Status:** Internal review — shareable with stakeholders

---

## Executive summary

Nordic Ascent is built as an **India → Nordic talent integration platform**, not a generic global HR system. The product, data model, and user journeys align well with the intended corridor: **Indian engineers** moving to **Nordic employers** (primarily Norway in operational modules).

| Market | Product readiness | Legal / compliance readiness |
|--------|-------------------|------------------------------|
| **India (candidates)** | Strong | Partial — DPDP not yet implemented |
| **Norway (employers)** | Strong registration & pipeline | Good GDPR MVP; documentation gaps remain |
| **Sweden / Denmark / Finland** | Supported in marketing & employer registration | Same as Norway (EEA GDPR) |
| **Global / any country** | Not supported | Not supported |

**Conclusion:** The platform is suitable for launch on the **India ↔ Nordic corridor** once legal documentation (privacy notice v2, terms, cross-border disclosures, employer DPA) is completed. Relocation modules should either be parameterized by destination country or marketing should be narrowed to “Norway-first.”

---

## 1. Product model

### Intended corridor

```
Indian candidate (origin)
        ↓
Nordic Ascent platform (selection, readiness, mentoring)
        ↓
Nordic employer (Norway / Sweden / Denmark / Finland)
        ↓
Relocation → onboarding → follow-up (destination country)
```

Public positioning consistently reflects this:

- *“Engineering talent from India, hired to stay.”*
- Candidates: top Indian universities → Nordic companies
- Employers: Nordic companies hiring validated international talent

### What “works for India and Norway” means in practice

| Question | Answer |
|----------|--------|
| Can Indian candidates register and complete the journey? | **Yes** |
| Can Norwegian companies register and hire through the platform? | **Yes** |
| Does the app support all countries globally? | **No** |
| Is the app localized (Hindi, Norwegian, etc.)? | **No — English only** |
| Is relocation equal across all Nordic countries? | **No — Norway-specific steps** |

---

## 2. India — candidate market

### What works today

| Capability | Detail |
|------------|--------|
| **Default geography** | Country defaults to India; full Indian state list |
| **Phone numbers** | +91 prefix and India-specific normalisation |
| **Universities** | Indian institution catalogue and waitlist workflow |
| **Selection pipeline** | Offee (India partner) integrated in early selection steps |
| **Tracks** | Entry Track (graduates) and Fast Track (experienced hires) |
| **Readiness** | Content explicitly addresses India ↔ Nordic cultural adaptation |

### Gaps for India

| Gap | Risk / impact | Priority |
|-----|---------------|----------|
| **No DPDP-specific notice or consent** | Indian Digital Personal Data Protection Act requires clear, specific consent including cross-border transfer | High |
| **No cross-border disclosure at signup** | Candidates not explicitly told data may be processed in EEA | High |
| **No IST timezone** | Interview scheduling may confuse Indian users (admin TZ: CET/EET/UTC only) | Medium |
| **English-only UI** | Acceptable for MVP; limits accessibility | Low |
| **No Hindi or regional languages** | Same | Low |

### India — DPDP regulatory context (2026)

- India uses a **permissive cross-border model** (transfers allowed unless government restricts a country).
- **Norway/EEA is not currently restricted.**
- Consent must be **specific and informed** — including when data is transferred abroad.
- Full operational enforcement phases through **~May 2027**; early compliance is advisable for trust and enterprise sales.

---

## 3. Norway & Nordics — employer market

### What works today

| Capability | Detail |
|------------|--------|
| **Company registration** | Norway, Sweden, Denmark, Finland, Iceland (+ Germany, Other) |
| **Phone & postal** | Nordic country codes (+47, +46, +45, +358, +354); postal lookup |
| **Organisation number** | Field for Nordic company registration |
| **GDPR consent** | Required checkbox on company profile submission |
| **Employer pipeline** | Selection (from Step 3+), mentoring, activation, follow-up |
| **Partners** | GCE NODE, Lingu (Norway) |

### Gaps for Norway / EEA

| Gap | Risk / impact | Priority |
|-----|---------------|----------|
| **No published DPA for customer companies** | Norwegian employers expect processor agreement | High |
| **Privacy notice lacks hosting / subprocessor detail** | Supabase, Vercel, email provider locations not stated | High |
| **Cross-border transfer to India not documented** | GDPR Chapter V — SCCs / TIA typically required for India transfers | High |
| **Company consent lacks timestamp + version** | Weaker audit trail vs candidate consent | Medium |
| **Terms of Service missing** | Footer link still placeholder | Medium |

### Norway — GDPR regulatory context

- Norway applies **full GDPR** via the EEA Agreement (enforced by **Datatilsynet**).
- Transfers of candidate data to/from **India** require a valid transfer mechanism (typically **Standard Contractual Clauses** + transfer impact assessment).
- Employers using Nordic Ascent as a processor will expect: **DPA**, subprocessor list, security description, and exit/deletion terms.

---

## 4. Cross-border data flow

### Current architecture (typical)

```
Candidate (India)  →  Supabase (single project, EU region — verify in dashboard)
                   →  Vercel (frontend hosting, global CDN)
                   →  Resend (transactional email, if configured)

Employer (Norway)  →  Same Supabase project (shared database)
```

**Important:** Candidate and employer data reside in the **same database**. There is no geographic partitioning by user country.

### Recommended disclosures (privacy notice v2)

1. **Where data is stored** (Supabase region, e.g. EU Central)
2. **Who processes data** (subprocessors: Supabase, Vercel, Resend, etc.)
3. **That Indian candidate data is transferred to EEA** for processing
4. **Legal basis** (consent, contract, legitimate interest as applicable)
5. **Retention periods** and deletion/anonymisation policy
6. **Contact:** privacy@nordicascent.com (already referenced)

---

## 5. Operational modules by destination country

| Module | India | Norway | SE / DK / FI |
|--------|-------|--------|--------------|
| Registration & profile | ✅ Optimised | ✅ (employer) | ✅ (employer) |
| Selection & readiness | ✅ | ✅ | ✅ |
| Mentoring | ✅ | ✅ | ✅ |
| Relocation | N/A | ✅ **Norway-specific** (A1, D-number) | ⚠️ Not parameterised |
| Onboarding / follow-up | N/A | Norway-centric copy | ⚠️ Same |

**Marketing vs product:** FAQs state placements in Sweden, Norway, Denmark, and Finland. Relocation steps reference **Norwegian A1**, **D-number**, and **arrival in Norway** only.

**Recommendation:** Either (a) parameterise relocation by destination country, or (b) update public copy to “Norway-first; other Nordics on request.”

---

## 6. GDPR implementation status (platform)

The following was implemented in the codebase (migrations 100–101):

| Requirement | Status |
|-------------|--------|
| Privacy consent at registration (timestamp + version) | ✅ Done |
| Privacy notice page (`/privacy`) | ✅ Done |
| Consent gate for notice updates | ✅ Done |
| Retention date on candidate records | ✅ Done |
| Admin export (JSON) | ✅ Done |
| Admin delete (DB + storage path cleanup) | ✅ Done |
| Admin correct candidate details | ✅ Done |
| Employer-safe data views (no internal notes) | ✅ Mostly done |
| Audit log (admin candidate views) | ✅ Partial |
| Access anomaly flags | ✅ Done |
| Daily retention cron (03:00 UTC) | ✅ Done |
| Consent backfill for existing users | ✅ Done |

### Remaining GDPR / legal items

- Terms of Service page
- India DPDP-aligned notice section
- Employer DPA template
- Company consent timestamp/version
- Employer & mentor view logging
- Export as document pack (PDFs/CVs included)
- Document Supabase hosting region in privacy notice

---

## 7. Scorecard

| Area | India | Norway | Other Nordics | Global |
|------|-------|--------|---------------|--------|
| User registration | ✅ | ✅ | ✅ | ❌ |
| Phone / address UX | ✅ | ✅ | ⚠️ | ❌ |
| Pipeline (selection → follow-up) | ✅ | ✅ | ✅ | N/A |
| Relocation | N/A | ✅ | ❌ | ❌ |
| Language | EN only | EN only | EN only | ❌ |
| Privacy law alignment | ⚠️ | ✅ MVP | ✅ MVP | ❌ |
| Cross-border legal docs | ❌ | ❌ | ❌ | ❌ |

**Legend:** ✅ Ready · ⚠️ Partial · ❌ Not supported

---

## 8. Recommended actions

### Before first candidate (legal)

1. Publish **Privacy Notice v2** with cross-border and hosting details  
2. Add **India-specific consent language** at signup  
3. Publish **Terms of Service**; fix footer legal links  
4. Prepare **DPA template** for Norwegian employer customers  
5. Add **company consent timestamp + version**

### Before first placement (product)

6. Parameterise **relocation by destination country** OR narrow marketing  
7. Add **IST timezone** for scheduling  
8. Log **employer candidate views** in audit trail  

### Before scaling

9. Optional i18n (English + Hindi / Norwegian)  
10. Structured compensation fields (INR / NOK)  
11. Legal: ROPA, DPIA, subprocessor register (outside app)

---

## 9. Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Product | | | |
| Legal / DPO | | | |
| Engineering | | | |
| Norway market lead | | | |
| India market lead | | | |

---

*This document reflects the platform codebase and regulatory landscape as of 31 August 2026. It is not legal advice. Consult qualified counsel in India and Norway before production launch.*
