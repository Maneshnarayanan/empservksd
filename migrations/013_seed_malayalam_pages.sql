-- Migration 013: Seed Latest Kerala Employees Services Malayalam Dynamic Pages
INSERT INTO custom_pages (title, slug, subtitle, meta_description, layout_mode, blocks_json, content_html, show_in_nav, nav_order, is_published)
VALUES
(
    'ക്ഷാമബത്ത (DA) വർദ്ധനവ് 2026',
    'ക്ഷാമബത്ത-വർദ്ധനവ്-2026',
    'സംസ്ഥാന സർക്കാർ ജീവനക്കാർക്കും അധ്യാപകർക്കും പെൻഷൻകാർക്കുമുള്ള ക്ഷാമബത്ത, ക്ഷാമാശ്വാസം, കുടിശ്ശിക വിവരങ്ങൾ.',
    'കേരള സർക്കാർ ജീവനക്കാരുടെ ക്ഷാമബത്ത (DA) വർദ്ധനവ് 2026 ഉത്തരവ്, നിരക്കുകൾ, സ്പാർക്ക് ബിൽ നിർദ്ദേശങ്ങൾ.',
    'sidebar',
    '[{"type":"hero","badge":"ധനകാര്യ വകുപ്പ് ഉത്തരവ്","title":"ക്ഷാമബത്ത (DA) 2% വർദ്ധനവ് — ഉത്തരവ് 2026","subtitle":"GO(P) No.108/2026/Fin പ്രകാരം സംസ്ഥാന സർക്കാർ ജീവനക്കാരുടെയും അധ്യാപകരുടെയും ക്ഷാമബത്ത 35 ശതമാനത്തിൽ നിന്നും 37 ശതമാനമായി ഉയർത്തി.","buttonText":"ഉത്തരവ് ഡൗൺലോഡ് ചെയ്യുക","buttonUrl":"/downloads","theme":"blue"},{"type":"alert","variant":"warning","title":"ഡി.എ കുടിശ്ശിക (DA Arrears) സംബന്ധിച്ച അറിയിപ്പ്","message":"01/01/2026 മുതൽ 30/09/2026 വരെയുള്ള കുടിശ്ശിക തുക അനുവദിക്കുന്നത് സംബന്ധിച്ച് ധനകാര്യ വകുപ്പ് പ്രത്യേക ഉത്തരവ് പിന്നീട് പുറപ്പെടുവിക്കുന്നതാണ്."},{"type":"table","heading":"ക്ഷാമബത്ത നിരക്കുകളുടെ പട്ടിക (DA Rate Chart)","headers":["പ്രാബല്യ തീയതി","നിലവിലെ നിരക്ക്","വർദ്ധനവ്","പുതുക്കിയ ആകെ DA","ഉത്തരവ് നമ്പർ"],"rows":[["01-01-2026","35%","+2%","37%","GO(P) 108/2026/Fin"],["01-07-2025","33%","+2%","35%","GO(P) 54/2025/Fin"],["01-01-2025","30%","+3%","33%","GO(P) 12/2025/Fin"]]},{"type":"richtext","heading":"പ്രധാന നിർദ്ദേശങ്ങൾ (SPARK & പെൻഷൻ)","body":"<ul><li><strong>ശമ്പള വിതരണം:</strong> 2026 ഒക്ടോബർ മാസത്തെ ശമ്പളത്തോടൊപ്പം പുതുക്കിയ 37% ക്ഷാമബത്ത SPARK വഴി പ്രോസസ്സ് ചെയ്യാവുന്നതാണ്.</li><li><strong>പെൻഷൻകാർ:</strong> സംസ്ഥാന പെൻഷൻകാർക്കും കുടുംബ പെൻഷൻകാർക്കും 2026 നവംബർ മാസത്തെ പെൻഷൻ മുതൽ പുതുക്കിയ ക്ഷാമാശ്വാസം (DR) ലഭിക്കും.</li><li><strong>തദ്ദേശ സ്വയംഭരണ / എയ്ഡഡ് മേഖല:</strong> എയ്ഡഡ് സ്കൂൾ-കോളേജ് അധ്യാപകർക്കും ജീവനക്കാർക്കും ഉത്തരവ് ബാധകമാണ്.</li></ul>"},{"type":"download_cta","title":"ഔദ്യോഗിക ഉത്തരവിന്റെ PDF പകർപ്പ്","description":"സാലറി കാൽക്കുലേറ്ററുകളും ധനകാര്യ വകുപ്പ് സർക്കുലറുകളും ഡൗൺലോഡ് ചെയ്യുക.","buttonText":"ഡൗൺലോഡ്സ് പേജ് തുറക്കുക","buttonUrl":"/downloads","newTab":false}]',
    '',
    true,
    1,
    true
),
(
    'കെ.എസ്.ആർ (KSR) അവധി നിയമങ്ങൾ',
    'കെഎസ്ആർ-അവധി-നിയമങ്ങൾ',
    'ആകസ്മിക അവധി (CL), ഏൺഡ് ലീവ് സറണ്ടർ (ELS), മെഡിക്കൽ അവധി, ഫോം 13 അപേക്ഷാ നടപടിക്രമങ്ങൾ.',
    'കേരള സർവ്വീസ് റൂൾസ് (KSR Part I) പ്രകാരമുള്ള അവധി നിയമങ്ങളും ഏൺഡ് ലീവ് സറണ്ടർ ചട്ടങ്ങളും മലയാളത്തിൽ.',
    'standard',
    '[{"type":"hero","badge":"KSR PART I മലയാളം സഹായി","title":"കേരള സർവ്വീസ് റൂൾസ് (KSR) — അവധി & സറണ്ടർ നിയമങ്ങൾ","subtitle":"സർക്കാർ ജീവനക്കാർക്കും അധ്യാപകർക്കും അർഹമായ വിവിധ അവധികളും അവയ്ക്കുള്ള അപേക്ഷാ രീതികളും ലളിതമായി മനസ്സിലാക്കാം.","buttonText":"ഫോം 13 ഡൗൺലോഡ് ചെയ്യുക","buttonUrl":"/downloads","theme":"emerald"},{"type":"cards","heading":"പ്രധാന അവധി വിഭാഗങ്ങൾ","columns":3,"items":[{"icon":"📅","title":"ആകസ്മിക അവധി (CL)","description":"ഒരു കലണ്ടർ വർഷത്തിൽ പരമാവധി 20 ദിവസം വരെ ആകസ്മിക അവധി അനുവദിക്കും.","linkText":"ലേഖനങ്ങൾ വായിക്കുക","linkUrl":"/blogs"},{"icon":"💰","title":"ലീവ് സറണ്ടർ (ELS)","description":"സാമ്പത്തിക വർഷത്തിൽ 30 ദിവസത്തെ ആർജ്ജിത അവധി സറണ്ടർ ചെയ്യുന്നതിനുള്ള ചട്ടങ്ങൾ.","linkText":"ഉത്തരവുകൾ കാണുക","linkUrl":"/downloads"},{"icon":"🏥","title":"കമ്യൂട്ടഡ് / മെഡിക്കൽ ലീവ്","description":"മെഡിക്കൽ സർട്ടിഫിക്കറ്റും KSR ഫോം 13-ഉം സഹിതം DDO മുഖേന സമർപ്പിക്കേണ്ടതാണ്.","linkText":"ഫോം ഡൗൺലോഡ്","linkUrl":"/downloads"}]},{"type":"faq","heading":"പതിവായി ചോദിക്കുന്ന സംശയങ്ങൾ (FAQ)","items":[{"question":"ഏൺഡ് ലീവ് അല്ലെങ്കിൽ ഹാഫ് പേ ലീവ് അപേക്ഷിക്കാൻ ഏത് ഫോമാണ് ഉപയോഗിക്കേണ്ടത്?","answer":"KSR Part I ചട്ടം 113 പ്രകാരം സ്റ്റാറ്റ്യൂട്ടറി ഫോമായ KSR Form 13 ആണ് ഉപയോഗിക്കേണ്ടത്."},{"question":"SPARK വഴി ലീവ് സറണ്ടർ ബിൽ എങ്ങനെ സമർപ്പിക്കാം?","answer":"മേലധികാരിയുടെ അനുമതി ഉത്തരവ് ലഭിച്ച ശേഷം SPARK-ലെ Leave Surrender മെനു വഴി DDO-യ്ക്ക് ബിൽ പ്രോസസ്സ് ചെയ്യാം."}]}]',
    '',
    false,
    2,
    true
),
(
    'മെഡിസെപ് (MEDISEP) ചികിത്സാ സഹായി',
    'മെഡിസെപ്-ചികിത്സാ-സഹായി',
    'മെഡിസെപ് രണ്ടാം ഘട്ടം — ക്യാഷ്‌ലെസ്സ് ചികിത്സ, എംപാനൽ ചെയ്ത ആശുപത്രികൾ, മെഡി-കാർഡ് ഡൗൺലോഡ് വിവരങ്ങൾ.',
    'കേരള സർക്കാർ ജീവനക്കാരുടെയും പെൻഷൻകാരുടെയും മെഡിസെപ് (MEDISEP Phase II) ക്യാഷ്‌ലെസ്സ് ചികിത്സാ സഹായി.',
    'sidebar',
    '[{"type":"hero","badge":"ആരോഗ്യ ഇൻഷുറൻസ് പദ്ധതി","title":"മെഡിസെപ് (MEDISEP Phase II) — ചികിത്സാ മാർഗ്ഗരേഖ","subtitle":"സംസ്ഥാന ജീവനക്കാർക്കും പെൻഷൻകാർക്കും ആശ്രിതർക്കുമുള്ള സമഗ്ര ആരോഗ്യ ഇൻഷുറൻസ് പദ്ധതിയുടെ പ്രധാന വിവരങ്ങൾ.","buttonText":"പോർട്ടൽ തുറക്കുക","buttonUrl":"/services","theme":"slate"},{"type":"alert","variant":"info","title":"കാസർഗോഡ്, കണ്ണൂർ, മംഗലാപുരം ആശുപത്രികൾ","message":"അംഗീകൃത സ്വകാര്യ-സഹകരണ ആശുപത്രികളിൽ QR കോഡ് അടങ്ങിയ മെഡിസെപ് കാർഡ് വഴി പ്രീ-ഓതറൈസേഷൻ സഹായം ലഭ്യമാണ്."},{"type":"cards","heading":"അടിയന്തര ലിങ്കുകൾ","columns":2,"items":[{"icon":"🏥","title":"എംപാനൽ ചെയ്ത ആശുപത്രികൾ","description":"ജില്ല തിരിച്ചുള്ള ആശുപത്രികളുടെയും ചികിത്സാ പാക്കേജുകളുടെയും പട്ടിക.","linkText":"പട്ടിക ഡൗൺലോഡ് ചെയ്യുക","linkUrl":"/downloads"},{"icon":"🪪","title":"മെഡിസെപ് കാർഡ് & പരാതികൾ","description":"PEN നമ്പർ ഉപയോഗിച്ച് മെഡി-കാർഡ് ഡൗൺലോഡ് ചെയ്യാനും പരാതികൾ നൽകാനും.","linkText":"സർവീസ് ഡയറക്ടറി","linkUrl":"/services"}]},{"type":"faq","heading":"പ്രധാന സംശയങ്ങൾ","items":[{"question":"ആശുപത്രിയിൽ അഡ്മിറ്റ് ആകുമ്പോൾ എന്തൊക്കെ രേഖകൾ കരുതണം?","answer":"മെഡിസെപ് ഇ-കാർഡ് (QR കോഡ് സഹിതം), ആധാർ കാർഡ്, ജീവനക്കാരന്റെ/പെൻഷൻകാരന്റെ തിരിച്ചറിയൽ രേഖ എന്നിവ കരുതണം."},{"question":"ക്ലെയിം നിരസിക്കപ്പെട്ടാലോ അധിക തുക ഈടാക്കിയാലോ എവിടെ പരാതിപ്പെടാം?","answer":"മെഡിസെപ് ഔദ്യോഗിക പോർട്ടലിലെ Grievance Redressal വിഭാഗത്തിലോ ജില്ലാ നോഡൽ ഓഫീസിലോ പരാതി രജിസ്റ്റർ ചെയ്യാം."}]}]',
    '',
    false,
    3,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Also add Malayalam quick links into Popular Articles sidebar if not present
INSERT INTO quick_links (title, url, badge_text, target_blank, display_order, is_active)
SELECT 'ക്ഷാമബത്ത (DA) വർദ്ധനവ് 2026', '/p/%E0%B4%95%E0%B5%8D%E0%B4%B7%E0%B4%BE%E0%B4%AE%E0%B4%AC%E0%B4%A4%E0%B5%8D%E0%B4%A4-%E0%B4%B5%E0%B5%BC%E0%B4%A6%E0%B5%8D%E0%B4%A7%E0%B4%A8%E0%B4%B5%E0%B5%8D-2026', 'മലയാളം', false, 9, true
WHERE NOT EXISTS (
    SELECT 1 FROM quick_links WHERE title = 'ക്ഷാമബത്ത (DA) വർദ്ധനവ് 2026'
);

INSERT INTO quick_links (title, url, badge_text, target_blank, display_order, is_active)
SELECT 'KSR അവധി നിയമങ്ങൾ (മലയാളം)', '/p/%E0%B4%95%E0%B5%86%E0%B4%8E%E0%B4%B8%E0%B5%8D%E0%B4%86%E0%B5%BC-%E0%B4%85%E0%B4%B5%E0%B4%A7%E0%B4%BF-%E0%B4%A8%E0%B4%BF%E0%B4%AF%E0%B4%AE%E0%B4%99%E0%B5%8D%E0%B4%99%E0%B5%BE', NULL, false, 10, true
WHERE NOT EXISTS (
    SELECT 1 FROM quick_links WHERE title = 'KSR അവധി നിയമങ്ങൾ (മലയാളം)'
);

INSERT INTO quick_links (title, url, badge_text, target_blank, display_order, is_active)
SELECT 'മെഡിസെപ് (MEDISEP) ചികിത്സാ സഹായി', '/p/%E0%B4%AE%E0%B5%86%E0%B4%A1%E0%B4%BF%E0%B4%B8%E0%B5%86%E0%B4%AA%E0%B5%8D-%E0%B4%9A%E0%B4%BF%E0%B4%95%E0%B4%BF%E0%B4%A4%E0%B5%8D%E0%B4%B8%E0%B4%BE-%E0%B4%B8%E0%B4%B9%E0%B4%BE%E0%B4%AF%E0%B4%BF', 'NEW', false, 11, true
WHERE NOT EXISTS (
    SELECT 1 FROM quick_links WHERE title = 'മെഡിസെപ് (MEDISEP) ചികിത്സാ സഹായി'
);
