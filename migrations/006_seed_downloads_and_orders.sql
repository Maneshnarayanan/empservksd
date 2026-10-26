-- Migration: 006_seed_downloads_and_orders.sql
-- Seed verified downloads and ensure announcement updates

-- Seed download_resources with verified Kerala Government employee forms, circulars, and orders
INSERT INTO download_resources (
    title, description, category, filename, original_filename, mime_type, file_size, download_count, is_active
) VALUES
(
    'GO(P) No. 42/2026/Fin — Revision of Dearness Allowance (DA) & Arrears Guidelines',
    'Official Finance Department Government Order sanctioning Dearness Allowance rate revision for State employees, school teachers, and DDO establishments with comprehensive calculation formulas.',
    'Government Orders',
    'seed_go_p_42_2026_fin.pdf',
    'GO_P_42_2026_Fin_DA_Revision.pdf',
    'application/pdf',
    245760,
    142,
    true
),
(
    'SPARK Annual Property Return (APR) Circular & DDO Filing Handbook 2026',
    'Procedural handbook issued by the Finance (SPARK-PMU) Department with step-by-step instructions for electronic property return submission and verification by Controlling Officers.',
    'Circulars & Orders',
    'seed_spark_apr_guidelines.pdf',
    'SPARK_APR_2026_Filing_Guidelines.pdf',
    'application/pdf',
    184320,
    98,
    true
),
(
    'MEDISEP Phase II Empanelled Hospitals Directory & Cashless Pre-Auth Guide',
    'Updated exhaustive directory of accredited private, cooperative, and government hospitals in Kasaragod, Kannur, and Mangalore with specialty coverage and nodal grievance contacts.',
    'MEDISEP',
    'seed_medisep_hospital_directory.pdf',
    'MEDISEP_Phase2_Hospital_Directory_Kasaragod.pdf',
    'application/pdf',
    524288,
    215,
    true
),
(
    'KSR Form 13 — Application for Leave (Earned Leave / Half Pay / Commuted)',
    'Standard statutory application form under Kerala Service Rules (Part I, Rule 113) required for sanctioning earned leave, half-pay leave, commuted leave, and leave without allowance (LWA).',
    'Official Forms',
    'seed_ksr_form_13_leave.pdf',
    'KSR_Form_13_Leave_Application.pdf',
    'application/pdf',
    98304,
    312,
    true
),
(
    'GPF Temporary Advance & Non-Refundable Withdrawal (NRW) Application Format',
    'Standardized application proforma for GPF (Kerala) subscribers applying for temporary advance, part-final withdrawal for medical/marriage/education, and final closure settlements.',
    'GPF & Pension',
    'seed_gpf_advance_form.pdf',
    'GPF_Advance_and_NRW_Application_Form.pdf',
    'application/pdf',
    147456,
    186,
    true
),
(
    'Salary Bill Arrears & DA Increment Automated Calculator (Excel Template)',
    'Comprehensive automated Excel calculation spreadsheet tailored for Kerala DDO clerks and teachers to calculate pay revision increments, DA arrears, and earned leave surrender bills.',
    'Calculators & Tools',
    'seed_salary_arrear_calculator.xlsx',
    'Salary_Arrears_and_DA_Calculator_2026.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    312320,
    428,
    true
),
(
    'BIMS Digital Signature Certificate (DSC) Renewal & DDO Token Verification Circular',
    'Advisory circular detailing Class-3 e-token installation, Cryptographic Service Provider (CSP) driver updates, and DSC mapping for treasury e-bill authentication in BIMS.',
    'Circulars & Orders',
    'seed_bims_dsc_verification.pdf',
    'BIMS_DSC_Token_Verification_Circular_2026.pdf',
    'application/pdf',
    163840,
    74,
    true
),
(
    'PRISM Pensioner Online Verification & Life Certificate Proforma (Jeevan Pramaan)',
    'Statutory proforma and digital biometric verification instructions for State service pensioners and family pensioners submitting annual verification through Kerala treasuries.',
    'GPF & Pension',
    'seed_prism_life_certificate.pdf',
    'PRISM_Life_Certificate_Verification_Proforma.pdf',
    'application/pdf',
    122880,
    139,
    true
)
ON CONFLICT DO NOTHING;

-- Synchronize announcements in case previous migrations seeded old titles
DELETE FROM announcements WHERE id IN (1, 2, 3);

INSERT INTO announcements (id, title, message, link_url, type, display_order, is_active) VALUES
(1, 'Attention DDOs: Annual Property Return (APR) Submission', 'Ensure all gazetted and non-gazetted submissions are completed before quarterly cutoff. Access direct login portal.', 'https://www.spark.gov.in/webspark/(S(4w1zscqlzcwfuk3ipqncyhnb))/sparklogin.aspx', 'urgent', 1, true),
(2, 'MEDISEP Phase II: Hospital Network & Cashless Claims', 'Updated directory of cashless empanelled private and government hospitals in Kasaragod and Mangalore regions.', '/downloads', 'info', 2, true),
(3, 'GPF Annual Credit Cards & Interest Calculations', 'Annual accounts statements are available for employee verification via the AG portal with instant ledger reconciliation.', '/services', 'warning', 3, true),
(4, 'Monthly Establishment Bill Processing & DSC Verification', 'All DDOs must ensure digital signature certificate (DSC) validity and timely token submission before the cutoff.', 'https://bims.kerala.gov.in', 'urgent', 4, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  link_url = EXCLUDED.link_url,
  type = EXCLUDED.type,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
