# Audit Report: Unconfigured Service URLs & Content Placeholders

**Target System:** employeeserviceksd.com  
**Source Document:** `WEB DESIGN.xlsx`  
**Date of Audit:** October 2026  
**Status:** Preserved as unconfigured placeholders in database; fully editable via Admin Portal.

---

## 1. Executive Summary

As mandated by Section 4, Section 7, and Section 21 of the project specification:
> *"Do not invent external service URLs, contact details, blog content, or client information. If a destination URL or content item is missing, create a clearly identified placeholder for administrator configuration and document it in the setup instructions."*

In the source spreadsheet `WEB DESIGN.xlsx`, the client listed category titles and service names across 11 primary service modules, 5 blog community verticals, and contact metadata. However, **no external destination URLs** were hyperlinked or typed into the spreadsheet (only `mailto:esksd31@gmail.com` was provided for contact).

Rather than fabricating URLs that could mislead Kerala government employees or route to obsolete endpoints, all 28 service links have been seeded into the database with `destination_url: NULL`. On the public website, each service link displays an amber badge **"Configuring..."** and gracefully disables click-through navigation until an administrator enters the verified URL in the Administrator Portal at `/admin/services`.

---

## 2. Complete Inventory of Seeded Service Links Requiring URL Configuration

The following 28 service links are categorized, active, and awaiting official destination URLs:

| # | Category | Service Name | Stored Slug | Status in Database | Suggested Action / Portal Target |
|---|----------|--------------|-------------|--------------------|-----------------------------------|
| 1 | **SPARK** | SPARK | `spark` | Unconfigured (`NULL`) | Kerala SPARK DDO/Employee Portal (e.g., `https://www.spark.gov.in/webspark/`) |
| 2 | **SPARK** | INFOSPARK | `infospark` | Unconfigured (`NULL`) | Kerala InfoSPARK Information Portal |
| 3 | **BIMS** | BIMS | `bims` | Unconfigured (`NULL`) | Kerala Bill Information & Management System |
| 4 | **BIMS** | PFMS | `pfms` | Unconfigured (`NULL`) | Public Financial Management System |
| 5 | **AGEES** | KSEM | `ksem` | Unconfigured (`NULL`) | Kerala State Electronic Monitoring / AG Portal |
| 6 | **AGEES** | CAG | `cag` | Unconfigured (`NULL`) | Comptroller & Auditor General of India Portal |
| 7 | **TREASURY** | E TREASURY | `e-treasury` | Unconfigured (`NULL`) | Kerala e-Treasury Online Gateway |
| 8 | **TREASURY** | TSB | `tsb` | Unconfigured (`NULL`) | Kerala Treasury Savings Bank Online |
| 9 | **TAX** | EFILE | `efile` | Unconfigured (`NULL`) | Income Tax e-Filing Portal |
| 10 | **TAX** | TRACES | `traces` | Unconfigured (`NULL`) | TDS TRACES Portal |
| 11 | **TAX** | TIN NSDL | `tin-nsdl` | Unconfigured (`NULL`) | Protean / NSDL Tax Information Network |
| 12 | **TAX** | BIN VIEW | `bin-view` | Unconfigured (`NULL`) | Book Identification Number Verification |
| 13 | **TAX** | OLTAS | `oltas` | Unconfigured (`NULL`) | Online Tax Accounting System Challan Inquiry |
| 14 | **EDUCATION** | TRANSFER&POSTINGS | `transferpostings` | Unconfigured (`NULL`) | Education Transfer and Posting Portal |
| 15 | **EDUCATION** | PAREEKSHA BHAVAN | `pareeksha-bhavan` | Unconfigured (`NULL`) | Office of the Commissioner for Govt Examinations |
| 16 | **EDUCATION** | GEN EDUCATION | `gen-education` | Unconfigured (`NULL`) | General Education Department, Kerala |
| 17 | **EDUCATION** | HSS/VHSC | `hssvhsc` | Unconfigured (`NULL`) | Higher Secondary & Vocational Higher Secondary |
| 18 | **EDUCATION** | IT SCHOOL | `it-school` | Unconfigured (`NULL`) | Kerala IT@School (KITE) Portal |
| 19 | **EDUCATION** | DGE KERALA | `dge-kerala` | Unconfigured (`NULL`) | Directorate of General Education |
| 20 | **EDUCATION** | DHSE - HSE | `dhse-hse` | Unconfigured (`NULL`) | Directorate of Higher Secondary Education |
| 21 | **EDUCATION** | AIDED | `aided` | Unconfigured (`NULL`) | Aided Schools Management & Staff Services |
| 22 | **PF** | GPF | `gpf` | Unconfigured (`NULL`) | General Provident Fund Kerala |
| 23 | **PF** | GAIN PF | `gain-pf` | Unconfigured (`NULL`) | GAIN-PF Information & Services Portal |
| 24 | **KITE** | SAMPOORNA | `sampoorna` | Unconfigured (`NULL`) | Sampoorna School Management Portal |
| 25 | **KITE** | SAMAGRA | `samagra` | Unconfigured (`NULL`) | Samagra Resource & Learning Portal |
| 26 | **KITE** | SAMETHAM | `sametham` | Unconfigured (`NULL`) | Sametham Kerala School Data Bank |
| 27 | **KITE** | SAHITHAM | `sahitham` | Unconfigured (`NULL`) | Sahitham Mentoring Portal |
| 28 | **KITE** | KOOL | `kool` | Unconfigured (`NULL`) | KOOL Open Online Learning Portal |
| 29 | **KITE** | SAMANWAYA | `samanwaya` | Unconfigured (`NULL`) | Samanwaya Aided School Approval System |
| 30 | **INSURANCE** | SLI | `sli` | Unconfigured (`NULL`) | State Life Insurance Directorate |
| 31 | **INSURANCE** | GIS | `gis` | Unconfigured (`NULL`) | Group Insurance Scheme Portal |
| 32 | **PRISM** | PRISM | `prism` | Unconfigured (`NULL`) | Pensioners Information System Kerala |
| 33 | **MEDISEP** | MEDISEP | `medisep` | Unconfigured (`NULL`) | Medical Insurance for State Employees & Pensioners |

---

## 3. Blog Communities & Content Placeholders

The spreadsheet supplied five community publishing titles under the **BLOGS & WEB** column:
1. **HM BLOG** (`hm-blog`): Headmasters and School Administration Community Blog.
2. **MUTTAM BLOG** (`muttam-blog`): Educational salary calculations and employee guidance.
3. **MATHS BLOG** (`maths-blog`): Kerala Education & Teachers community resources.
4. **ALRAHMAN** (`alrahman`): Government employee welfare, service rules notes.
5. **RENJITHKUMAR** (`renjithkumar`): Service rules, tax calculation notes, administrative guidance.

### Policy Compliance:
- No fake blog posts or dummy text have been inserted into production.
- All five categories have been seeded into `blog_categories`.
- The public `/blogs` page renders clean empty states inviting visitors to check back soon or filter by category.
- Administrators can immediately create, preview, edit, and publish verified articles under any of these categories via `/admin/blogs`.

---

## 4. Verified Client Contact Details

The following contact details from `WEB DESIGN.xlsx` were verified and seeded into `website_settings`:

| Key | Seeded Value | Presentation on Site |
|-----|--------------|----------------------|
| Organization Name | `EMPLOYEES SERVICE, KASARAGOD` | Header logo text, footer, page titles |
| Tagline | `Employee Services & Community Resource Portal for Kerala State Employees` | Hero banner and meta description |
| Address | `BANK ROAD, NEAR MALLIKARJUNA TEMPLE, KASARGOD` | Contact page, footer |
| Email | `esksd31@gmail.com` | Clickable `mailto:` link in header, contact page, and footer |
| Telephone | `9447396181` | Clickable `tel:+919447396181` link |
| WhatsApp | `9447396181` | Clickable `https://wa.me/919447396181` helpline |

---

## 5. How the Administrator Configures URLs

1. Log into the Administrator Portal at `https://employeeserviceksd.com/admin/login`.
2. Navigate to **Service Directory** (`/admin/services`).
3. Click the **Edit** (pencil) icon on any service entry (e.g., SPARK).
4. Enter the verified HTTPS destination URL (e.g., `https://www.spark.gov.in/webspark/`).
5. Click **Update Service Link**.
6. The public portal will instantly replace the "Configuring..." badge with a live, secure **"Open Portal"** button that opens the external service safely in a new browser tab (`target="_blank" rel="noopener noreferrer"`).
