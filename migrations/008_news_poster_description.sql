-- Migration: 008_news_poster_description.sql
-- Add detailed description/explanation paragraph column to news_posters

ALTER TABLE news_posters ADD COLUMN IF NOT EXISTS description TEXT;

-- Update initial seeded records with detailed news explanation paragraphs
UPDATE news_posters
SET description = 'The Government of Kerala has notified the release of the Dearness Allowance (DA) installment hike for state government employees, teachers, and pensioners. Drawing and Disbursing Officers (DDOs) across Kasaragod district establishments and educational institutions are instructed to prepare the supplementary establishment bills using the automated DA Arrears processing module in SPARK. The outer bills must be countersigned and submitted to the respective sub-treasury office within the prescribed cutoff window. For assistance regarding salary bill generation, establishment staff may reach out to the district nodal helpdesk on 9447396181.'
WHERE id = 1 AND (description IS NULL OR description = '');

UPDATE news_posters
SET description = 'Under the MEDISEP Phase II health insurance scheme, an expanded network of 18 hospitals across Kasaragod, Kannur, and Mangalore has been approved for cashless medical treatment and surgical procedures. Government employees, pensioners, and eligible dependents can avail treatment by presenting their digital QR Medi-Card generated through the MEDISEP employee portal. DDOs are requested to ensure that pending dependency declarations and biometric verification corrections are finalized before the quarterly claims settlement cycle. Any discrepancies in claim approvals can be raised directly via the 24x7 district grievance cell.'
WHERE id = 2 AND (description IS NULL OR description = '');

UPDATE news_posters
SET description = 'In accordance with Kerala Public Service and Conduct Rules, electronic filing of Annual Property Returns (APR) for the calendar year 2026 has been made mandatory for all gazetted and non-gazetted employees. Submissions must be executed exclusively through individual SPARK PEN credentials under the Service Matters -> Property Return menu. Hand-written or physical copies will not be accepted. All heads of offices and DDOs in Kasaragod district must review, verify, and forward the submissions to the appointing authorities before the specified deadline. Failure to file APR within the window may cause impediments to promotions, increments, and service clearances.'
WHERE id = 3 AND (description IS NULL OR description = '');
