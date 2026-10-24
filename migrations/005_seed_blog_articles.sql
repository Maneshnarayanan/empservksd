-- Migration: 005_seed_blog_articles.sql
-- Description: Seed high-quality initial blog articles for HM Blog, Muttam Blog, Maths Blog, Alrahman, and Renjithkumar

INSERT INTO blog_articles (
    title,
    slug,
    summary,
    content,
    category_id,
    author_name,
    status,
    published_at
)
VALUES
(
    'SPARK Salary Bill Processing, DA Arrears & Pay Revision Guidelines 2026',
    'spark-salary-bill-processing-da-arrears-guide-2026',
    'Step-by-step procedure for drawing and disbursing officers (DDOs) to process monthly establishment bills, calculate pending dearness allowance (DA) arrears, and complete e-submission to e-Treasury.',
    '<p class="lead">Processing monthly establishment bills in the Service and Payroll Administrative Repository for Kerala (SPARK) requires adherence to the latest circulars from the Finance Department. This comprehensive handbook provides step-by-step instructions for Drawing and Disbursing Officers (DDOs) and establishment clerks.</p>

<h3>1. Pre-Processing Checklist Before Bill Generation</h3>
<p>Before initiating the monthly regular salary bill run in SPARK, ensure the following prerequisites are fulfilled:</p>
<ul>
  <li><strong>Service Book Synchronization:</strong> Verify that all increment sanction orders, earned leave surrender approvals, and promotions issued during the preceding month have been updated in the Service Book module and approved by the controlling officer.</li>
  <li><strong>Deductions & Recoveries:</strong> Check statutory deductions including GPF subscriptions, SLI, GIS, MEDISEP premiums (₹500/month), and cooperative society recoveries to prevent excess payments.</li>
  <li><strong>Relieving / Joining Notes:</strong> Any staff transferred or relieved under Rule 86 or inter-district transfers must be accounted for using the LPC (Last Pay Certificate) export-import tool.</li>
</ul>

<h3>2. Generating Regular Establishment Salary Bills</h3>
<p>Navigate to <em>Salary Processing &rarr; Processing &rarr; Monthly Salary Processing</em>. Select your office code and DDO code, verify the establishment section, and initiate processing. Always review the draft bill report (Form TR 59) before final approval.</p>

<h3>3. Encashment in e-Treasury via BiB Integration</h3>
<p>Once the bill is processed, approve the bill at the DDO level with biometric digital signature. The system automatically creates a Treasury Bill Reference number (TBR) and queues the schedule in the e-Treasury BiB (Bill-in-Bill) portal for automated clearance.</p>

<div class="callout callout-info">
  <strong>Key Takeaway:</strong> In case of rejected bills from the Treasury due to budget allocation head mismatch, cancel the processed bill under <em>Salary Processing &rarr; Processing &rarr; Cancel Processed Bills</em>, correct the object head in Office Details, and re-process.
</div>',
    (SELECT id FROM blog_categories WHERE slug = 'hm-blog' LIMIT 1),
    'HM Blog Editorial Desk',
    'published',
    CURRENT_TIMESTAMP - interval '2 days'
),
(
    'Kerala Service Rules (KSR): Complete Guide to Earned Leave, Commuted Leave & LWA',
    'ksr-leave-rules-earned-commuted-lwa-guide',
    'A detailed analysis of Part I Chapter IX of the Kerala Service Rules covering leave entitlement, medical certification, leave without allowances (LWA), and calculation of terminal surrender benefits.',
    '<p class="lead">Understanding the Kerala Service Rules (KSR Part I) regarding leave admissibility is essential for all state government employees, teachers, and administrative personnel. Here is the consolidated reference guide on admissibility, sanctioning authorities, and pay calculations.</p>

<h3>1. Earned Leave (EL) Entitlement & Calculation</h3>
<p>Under Rule 78 of KSR Part I, permanent government employees earn leave at the rate of 1/11th of the period spent on duty. For non-permanent employees, the admissibility starts at 1/22nd of duty during the initial probation period. The maximum accumulation limit is 300 days.</p>

<h3>2. Commuted Leave on Medical Certificate</h3>
<p>Commuted leave not exceeding half the amount of half pay leave due may be granted on medical certificate to an officer in permanent employment, subject to the condition that twice the amount of such leave shall be debited against the half pay leave due.</p>
<ul>
  <li>Medical certificate from an Assistant Surgeon or higher registered practitioner is mandatory.</li>
  <li>Fitness certificate must be submitted on the date of rejoining duty.</li>
</ul>

<h3>3. Leave Without Allowances (LWA) Rules</h3>
<p>LWA granted under Rule 88 may be sanctioned when no other leave is admissible or when the employee specifically requests it in writing. However, prolonged LWA under Appendix XIIA/XIIB/XIIC requires special government sanction and may affect pension qualifying service.</p>

<div class="callout callout-warning">
  <strong>Note on Surrender of Earned Leave:</strong> Employees may surrender up to 30 days of earned leave once in a financial year for encashment as per government orders in effect.
</div>',
    (SELECT id FROM blog_categories WHERE slug = 'muttam-blog' LIMIT 1),
    'Muttam Blog Contributor',
    'published',
    CURRENT_TIMESTAMP - interval '4 days'
),
(
    'Income Tax FY 2026-27 (AY 2027-28): Old vs New Regime Comparison for Teachers & Staff',
    'income-tax-fy-2026-27-teachers-staff-calculation-guide',
    'Comprehensive comparative evaluation of tax slabs, standard deduction benefits, Section 80C exemptions, NPS contributions, and home loan interest rebates under Old vs New Tax Regimes.',
    '<p class="lead">With recent updates to the Finance Act, Kerala state employees and educators must calculate their annual tax liability accurately to submit their final Statement of Anticipated Income and Savings (Form 12BB) before January salary bill processing.</p>

<h3>1. Comparative Tax Slabs for FY 2026-27</h3>
<table class="table-gov">
  <thead>
    <tr>
      <th>Income Slab</th>
      <th>New Tax Regime (Default)</th>
      <th>Old Tax Regime</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Up to ₹3,00,000</td>
      <td>Nil</td>
      <td>Nil</td>
    </tr>
    <tr>
      <td>₹3,00,001 to ₹6,00,000</td>
      <td>5% (Rebate u/s 87A applies)</td>
      <td>5%</td>
    </tr>
    <tr>
      <td>₹6,00,001 to ₹9,00,000</td>
      <td>10%</td>
      <td>20%</td>
    </tr>
    <tr>
      <td>₹9,00,001 to ₹12,00,000</td>
      <td>15%</td>
      <td>20%</td>
    </tr>
    <tr>
      <td>₹12,00,001 to ₹15,00,000</td>
      <td>20%</td>
      <td>30%</td>
    </tr>
    <tr>
      <td>Above ₹15,00,000</td>
      <td>30%</td>
      <td>30%</td>
    </tr>
  </tbody>
</table>

<h3>2. Standard Deduction Comparison</h3>
<p>The Standard Deduction for salaried employees under the New Tax Regime provides significant relief, alongside enhanced employer NPS contribution limits under Section 80CCD(2).</p>

<h3>3. Which Regime Should You Choose?</h3>
<p>If your total annual deductions under Section 80C (GPF, SLI, LIC, PPF, Tuition Fees), Section 80D (MEDISEP), Section 24(b) (Housing Loan Interest up to ₹2 Lakh), and HRA exceed ₹3.75 Lakhs, the Old Tax Regime may still provide higher net tax savings. Otherwise, the simplified New Tax Regime offers lower slab rates without paperwork.</p>',
    (SELECT id FROM blog_categories WHERE slug = 'maths-blog' LIMIT 1),
    'Maths Blog Resource Group',
    'published',
    CURRENT_TIMESTAMP - interval '6 days'
),
(
    'MEDISEP Phase 2: Cashless Hospitalization, Claim Reimbursement & Kasaragod Network Hospitals',
    'medisep-phase-2-cashless-hospitalization-claims-kasaragod-guide',
    'Step-by-step walkthrough for state employees and pensioners to avail cashless healthcare at empanelled hospitals in Kasaragod and Mangaluru, generate e-Cards, and submit offline reimbursement claims.',
    '<p class="lead">MEDISEP (Medical Insurance for State Employees and Pensioners) provides comprehensive cashless medical cover of up to ₹3 Lakhs per year (with a catastrophic illness corpus). Here is what you need to know about navigating the portal and availing treatments in and around Kasaragod district.</p>

<h3>1. Downloading Your Updated MEDISEP e-Card</h3>
<p>All enrolled employees and dependent family members must hold the official MEDISEP ID card with QR verification. Log in to <a href="https://medisep.kerala.gov.in" target="_blank" rel="noopener">medisep.kerala.gov.in</a> using your SPARK PEN (or PPO number for pensioners) and registered mobile OTP.</p>

<h3>2. Network Hospitals in Kasaragod & Border Districts</h3>
<p>State staff in Kasaragod frequently utilize both district-level facilities and designated super-speciality hospitals in nearby Mangaluru (Karnataka) approved under the MEDISEP border-district clause:</p>
<ul>
  <li>District Hospital, Kanhangad & General Hospital, Kasaragod</li>
  <li>Malik Deenar Charitable Hospital, Kasaragod</li>
  <li>KMC Hospital, Father Muller Medical College & AJ Hospital, Mangaluru (Designated tertiary care)</li>
</ul>

<h3>3. Procedure for Emergency Non-Network Reimbursements</h3>
<p>In life-threatening emergency situations where treatment is obtained at a non-empanelled hospital, reimbursement claims must be submitted online within 30 days of discharge, accompanied by the Emergency Certificate signed by the treating physician, itemized hospital bills, and diagnostic discharge summaries.</p>',
    (SELECT id FROM blog_categories WHERE slug = 'alrahman' LIMIT 1),
    'Alrahman Service Desk',
    'published',
    CURRENT_TIMESTAMP - interval '8 days'
),
(
    'e-Treasury BiB Bill Submission & Digital Certificate Authentication SOP',
    'e-treasury-bib-online-bill-submission-sop',
    'Official standard operating procedure for Treasury interface, BiB online slip reconciliation, voucher upload, and cyber treasury challan generation for DDOs and accounting staff.',
    '<p class="lead">The Department of Treasuries, Government of Kerala, has transitioned all department payment transactions to the integrated electronic Treasury platform. This SOP outlines the workflow for bill submission, treasury token tracking, and electronic disbursement directly into beneficiary accounts.</p>

<h3>1. Key Stages of BiB (Bill-in-Bill) Processing</h3>
<ol>
  <li><strong>Bill Preparation in Department Portals:</strong> Bills generated in SPARK, BIMS, or the Works Accounting System are electronically packaged into encrypted XML payload.</li>
  <li><strong>Treasury Queue Generation:</strong> Once approved, the bill is assigned an electronic token and forwarded to the designated Sub-Treasury (e.g., Kasaragod, Kanhangad, Hosdurg, Manjeshwaram).</li>
  <li><strong>Auditing & Passing:</strong> The Treasury junior superintendent and treasury officer audit the expenditure sanctions, object heads, and budget availability before passing the bill.</li>
  <li><strong>e-Kuber RBI Disbursement:</strong> Disbursed amounts are pushed via the Reserve Bank of India e-Kuber portal directly to the employees’ bank accounts via NEFT/RTGS.</li>
</ol>

<h3>2. Troubleshooting Common BiB Discrepancies</h3>
<p>If a bill status reflects "Object Head Budget Exhausted" or "DDO Specimen Signature Expired", coordinate with your controlling directorate for budget re-appropriation (via BIMS) and ensure renewal of USB crypto token certificates before the financial year closure.</p>',
    (SELECT id FROM blog_categories WHERE slug = 'renjithkumar' LIMIT 1),
    'Renjithkumar Service Guide',
    'published',
    CURRENT_TIMESTAMP - interval '10 days'
)
ON CONFLICT (slug) DO NOTHING;
