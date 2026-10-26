const fs = require('fs');
const path = require('path');

const storageDir = path.resolve(__dirname, '../storage/downloads');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Minimal valid PDF binary buffer
const validPdfBuffer = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n',
  'utf8'
);

// Minimal valid zip buffer (also works for empty xlsx container)
const validZipBuffer = Buffer.from([
  0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

const filesToCreate = [
  { name: 'seed_go_p_42_2026_fin.pdf', buffer: validPdfBuffer },
  { name: 'seed_spark_apr_guidelines.pdf', buffer: validPdfBuffer },
  { name: 'seed_medisep_hospital_directory.pdf', buffer: validPdfBuffer },
  { name: 'seed_ksr_form_13_leave.pdf', buffer: validPdfBuffer },
  { name: 'seed_gpf_advance_form.pdf', buffer: validPdfBuffer },
  { name: 'seed_salary_arrear_calculator.xlsx', buffer: validZipBuffer },
  { name: 'seed_bims_dsc_verification.pdf', buffer: validPdfBuffer },
  { name: 'seed_prism_life_certificate.pdf', buffer: validPdfBuffer },
];

filesToCreate.forEach(f => {
  const filePath = path.join(storageDir, f.name);
  fs.writeFileSync(filePath, f.buffer);
  console.log(`Created sample storage file: ${f.name}`);
});
