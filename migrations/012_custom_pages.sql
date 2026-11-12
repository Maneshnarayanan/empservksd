-- Migration 012: Custom Dynamic Pages & Visual Page Builder
CREATE TABLE IF NOT EXISTS custom_pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    subtitle VARCHAR(500) DEFAULT NULL,
    meta_description VARCHAR(500) DEFAULT NULL,
    layout_mode VARCHAR(50) DEFAULT 'standard',
    blocks_json TEXT NOT NULL DEFAULT '[]',
    content_html TEXT NOT NULL DEFAULT '',
    show_in_nav BOOLEAN DEFAULT FALSE,
    nav_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_pages_slug ON custom_pages(slug);
CREATE INDEX IF NOT EXISTS idx_custom_pages_published_nav ON custom_pages(is_published, show_in_nav, nav_order ASC);

-- Seed 2 initial dynamic pages demonstrating the Page Builder capabilities
INSERT INTO custom_pages (title, slug, subtitle, meta_description, layout_mode, blocks_json, content_html, show_in_nav, nav_order, is_published)
SELECT title, slug, subtitle, meta_description, layout_mode, blocks_json, content_html, show_in_nav, nav_order, is_published FROM (
    VALUES
        (
            'DA Arrears & Pay Fixation 2026',
            'da-pay-fixation',
            'Dearness Allowance enhancement chart, arrears claim rules, and SPARK bill preparation instructions for state employees.',
            'Kerala Government Employees Dearness Allowance (DA) Chart, Pay Fixation Rules, and Arrears Calculator Guide.',
            'sidebar',
            '[{"type":"hero","badge":"PAY & ALLOWANCES GUIDE","title":"Dearness Allowance (DA) Revision & Arrears 2026","subtitle":"Summary of GO(P) No.108/2026/Fin enhancing Dearness Allowance to 37% along with SPARK salary processing guidelines.","buttonText":"Download Official Orders","buttonUrl":"/downloads","theme":"blue"},{"type":"alert","variant":"warning","title":"DDO Processing Note","message":"Arrears from 01/01/2026 to 30/09/2026 shall be processed separately as per the forthcoming Finance Department circular."},{"type":"table","heading":"Recent DA Revision Rate Chart","headers":["Effective Date","Existing Rate","Enhancement","Revised Total DA","Authority Order"],"rows":[["01-01-2026","35%","+2%","37%","GO(P) 108/2026/Fin"],["01-07-2025","33%","+2%","35%","GO(P) 54/2025/Fin"],["01-01-2025","30%","+3%","33%","GO(P) 12/2025/Fin"]]},{"type":"download_cta","title":"Need the Official PDF Order & Excel Estimator?","description":"Access all verified Finance Department circulars and Excel worksheets from our Downloads hub.","buttonText":"Open Downloads Hub","buttonUrl":"/downloads","newTab":false}]',
            '',
            false,
            1,
            true
        ),
        (
            'KSR Leave Rules & Guides',
            'ksr-leave-rules',
            'Quick reference for Casual Leave, Earned Leave Surrender (ELS), Half Pay Leave, and Commuted Leave under Kerala Service Rules.',
            'Kerala Service Rules (KSR) Leave Eligibility, Surrender Chart, and Form 13 Guidelines.',
            'standard',
            '[{"type":"hero","badge":"KSR PART I REFERENCE","title":"Kerala Service Rules (KSR) — Leave & Surrender Guidelines","subtitle":"Essential leave rules, maximum accumulation limits, and online application forms for Kerala State Employees & Teachers.","buttonText":"Download Form 13","buttonUrl":"/downloads","theme":"emerald"},{"type":"cards","heading":"Common Leave Categories","columns":3,"items":[{"icon":"📅","title":"Casual Leave (CL)","description":"Up to 20 days per calendar year for regular staff. Can be combined with holidays up to limits.","linkText":"Read Guidelines","linkUrl":"/blogs"},{"icon":"💰","title":"Earned Leave Surrender","description":"30 days annual surrender permitted based on Government Finance Department orders.","linkText":"Check Orders","linkUrl":"/downloads"},{"icon":"🏥","title":"Medical / Commuted Leave","description":"Sanctioned against half-pay leave credit upon submission of Medical Certificate & Form 13.","linkText":"Download Form 13","linkUrl":"/downloads"}]},{"type":"faq","heading":"Frequently Asked Questions","items":[{"question":"What is the standard application form for Earned Leave?","answer":"KSR Form 13 is the mandatory statutory form for applying for Earned Leave, Half Pay Leave, Commuted Leave, and LWA."},{"question":"Can DDOs process leave surrender directly in SPARK?","answer":"Yes, once sanctioned by the Competent Authority, the bill is generated under Leave Surrender module in SPARK."}]}]',
            '',
            false,
            2,
            true
        )
) AS v(title, slug, subtitle, meta_description, layout_mode, blocks_json, content_html, show_in_nav, nav_order, is_published)
WHERE NOT EXISTS (SELECT 1 FROM custom_pages);

