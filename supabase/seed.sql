-- Placeholder seed data for neetu-portfolio. NOT real content.
-- Load with: npx supabase db push --include-seed
--
-- Safe to run more than once: existing rows (by slug / key) are skipped.
-- Matches the mockups' numbers: 34 published leaf works (catalog), a series,
-- a poetry collection, an anthology, one draft, 3 featured works.
-- All links point to example.com. No images: pages show the cloth-cover fallback.
-- Bracketed text like [प्रकाशक का नाम] is a placeholder, as in the mockups.

-- ---------------------------------------------------------------------------
-- Platforms (names in Latin script, as on the release buttons)
-- ---------------------------------------------------------------------------

insert into public.platforms (slug, name_hi, name_en, profile_url, description_hi, description_en, sort_order) values
  ('pratilipi', 'Pratilipi', 'Pratilipi', 'https://example.com/pratilipi/neetu', 'कहानियाँ, कविताएँ और उपन्यास पढ़ें', 'Read stories, poems and novels', 1),
  ('kuku-fm',   'Kuku FM',   'Kuku FM',   'https://example.com/kuku-fm/neetu',   'ऑडियोबुक सुनें',                     'Listen to audiobooks',           2),
  ('amazon',    'Amazon',    'Amazon',    'https://example.com/amazon/neetu',    'छपी किताबें और ई-बुक ख़रीदें',          'Buy printed books and ebooks',   3)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Genres
-- ---------------------------------------------------------------------------

insert into public.genres (slug, name_hi, name_en) values
  ('parivarik', 'पारिवारिक', 'Family'),
  ('prem',      'प्रेम',      'Love'),
  ('rahasya',   'रहस्य',     'Mystery'),
  ('samajik',   'सामाजिक',   'Social')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Works
-- ---------------------------------------------------------------------------

insert into public.works (slug, kind, status, title_hi, synopsis_hi, published_on) values
  -- From the mockups
  ('khamoshi',              'poem',  'published', 'ख़ामोशी',              'जो कहा नहीं गया, वही सबसे ज़्यादा सुना गया।', '2026-09-12'),
  ('aakhiri-bus',           'story', 'published', 'आख़िरी बस',            'रात की आख़िरी बस में मिले दो अजनबी, और एक सफ़र जो उतरने के बाद भी चलता रहा।', '2026-08-20'),
  ('adhuri-kahani',         'novel', 'published', 'अधूरी कहानी',          'एक लेखिका की अधूरी पांडुलिपि, जो धीरे-धीरे उसकी अपनी ज़िंदगी जैसी होने लगती है।', '2026-07-15'),
  ('purana-ghar',           'story', 'published', 'पुराना घर',            'बचपन का घर बिकने से पहले की आख़िरी शाम, और दीवारों पर लिखी पुरानी लकीरें।', '2026-06-10'),
  ('maa-ki-chitthi',        'story', 'published', 'माँ की चिट्ठी',          'बरसों बाद अलमारी में मिली एक चिट्ठी, जो कभी भेजी ही नहीं गई थी।', '2026-05-08'),
  ('rishton-ki-dor-bhag-2', 'novel', 'published', 'रिश्तों की डोर, भाग 2', 'डायरी के आख़िरी पन्नों के साथ बहनों के सामने वह सच आता है जिससे माँ उन्हें बचाती रहीं।', '2026-04-18'),
  ('barish-ki-raat',        'story', 'published', 'बारिश की रात',         'एक सुनसान स्टेशन, लगातार बरसता पानी और एक मुसाफ़िर जो किसी का इंतज़ार कर रहा है।', '2026-03-22'),
  ('chaand-se-baatein',     'poem',  'published', 'चाँद से बातें',          'छत पर अकेली रात और चाँद से कही गई वे बातें जो किसी और से न कही जा सकीं।', '2026-02-14'),
  ('subah-ki-dhoop',        'poem',  'published', 'सुबह की धूप',           'हर रोज़ नई शुरुआत की उम्मीद पर एक छोटी, उजली कविता।', '2026-01-05'),
  ('rishton-ki-dor-bhag-1', 'novel', 'published', 'रिश्तों की डोर, भाग 1', 'दो बहनें, एक पुराना घर और माँ की डायरी, जिसके पहले पन्ने खुलते ही पुरानी चुप्पी टूटने लगती है।', '2025-12-12'),
  -- More leaf works, for pagination and filters
  ('sawan-ke-jhoole',       'story', 'published', 'सावन के झूले',          'सावन की एक दोपहर, झूले पर बैठी दो सहेलियाँ और बरसों पुराना एक वादा।', '2025-11-20'),
  ('aangan-ki-tulsi',       'story', 'published', 'आँगन की तुलसी',          'सास और बहू के बीच अनकहा रिश्ता, जो आँगन की तुलसी के बहाने बँधता है।', '2025-10-18'),
  ('roti-ka-hisaab',        'story', 'published', 'रोटी का हिसाब',          'एक ढाबे पर काम करने वाले लड़के की कहानी, जो हर रोटी का हिसाब रखता है।', '2025-09-25'),
  ('kaanch-ke-rishte',      'novel', 'published', 'काँच के रिश्ते',          'एक संयुक्त परिवार, जहाँ हर रिश्ता नाज़ुक काँच जैसा है।', '2025-08-14'),
  ('dahleez',               'story', 'published', 'दहलीज़',               'शादी के बाद पहली बार मायके लौटी बेटी, और दहलीज़ पर ठहरे सवाल।', '2025-07-09'),
  ('peepal-wali-gali',      'story', 'published', 'पीपल वाली गली',         'एक मोहल्ला, एक पुराना पीपल और उसके नीचे बदलती पीढ़ियाँ।', '2025-06-16'),
  ('nani-ki-kahaniyan',     'story', 'published', 'नानी की कहानियाँ',       'गर्मी की छुट्टियाँ, नानी का घर और रात को सुनाई जाने वाली कहानियाँ।', '2025-05-11'),
  ('band-darwaza',          'story', 'published', 'बंद दरवाज़ा',            'हवेली का वह कमरा जिसका दरवाज़ा बरसों से किसी ने नहीं खोला।', '2025-04-03'),
  ('aakhiri-khat',          'story', 'published', 'आख़िरी ख़त',             'युद्ध से लौटे एक सिपाही का वह ख़त, जो उसकी मंगेतर तक देर से पहुँचा।', '2025-03-19'),
  ('badalte-mausam',        'poem',  'published', 'बदलते मौसम',           'मौसमों के बहाने बदलते शहर और बदलते लोगों पर एक कविता।', '2025-02-07'),
  ('maa',                   'poem',  'published', 'माँ',                  'माँ के हाथों की ख़ुशबू और उनकी चुप्पी में छिपी बातें।', '2025-01-12'),
  ('chitthi-aayi-hai',      'story', 'published', 'चिट्ठी आई है',          'फ़ौजी पति की चिट्ठियों का इंतज़ार करती एक पत्नी।', '2024-12-15'),
  ('intezaar',              'poem',  'published', 'इंतज़ार',              'स्टेशन की बेंच पर बैठे इंतज़ार की एक कविता।', '2024-11-08'),
  ('gaon-ki-pagdandi',      'poem',  'published', 'गाँव की पगडंडी',         'शहर से लौटकर गाँव की पगडंडी पर चलते हुए याद आती बातें।', '2024-10-21'),
  ('betiyan',               'poem',  'published', 'बेटियाँ',               'घर की रौनक़ और सपनों की उड़ान, बेटियों पर एक कविता।', '2024-09-30'),
  ('khwabon-ka-shahar',     'poem',  'published', 'ख़्वाबों का शहर',         'एक शहर जो सिर्फ़ ख़्वाबों में बसता है।', '2024-08-17'),
  ('sannate-ki-awaaz',      'story', 'published', 'सन्नाटे की आवाज़',        'एक सूने गाँव में रात को आती अजीब आवाज़ों का रहस्य।', '2024-07-06'),
  ('ghar-wapsi',            'story', 'published', 'घर वापसी',             'बीस साल बाद विदेश से लौटा बेटा, और बदला हुआ घर।', '2024-06-13'),
  ('kiraye-ka-makaan',      'story', 'published', 'किराए का मकान',         'एक छोटे शहर में किराए के मकान की तलाश और मकान-मालकिन की शर्तें।', '2024-05-02'),
  ('ankahe-rishte',         'novel', 'published', 'अनकहे रिश्ते',           'दो परिवारों के बीच एक पुराना राज़, जो तीसरी पीढ़ी में खुलता है।', '2024-04-10'),
  ('dhundh',                'novel', 'published', 'धुंध',                 'सर्दियों की धुंध में गुम हुई एक लड़की और उसे ढूँढता एक भाई।', '2024-03-04'),
  ('pehli-tankhwah',        'story', 'published', 'पहली तनख़्वाह',          'पहली नौकरी की पहली तनख़्वाह, और उससे पूरे होने वाले छोटे-छोटे सपने।', '2024-02-15'),
  ('bargad',                'poem',  'published', 'बरगद',                 'गाँव के चौपाल का बरगद, जो सब देखता है और कुछ नहीं कहता।', '2024-01-20'),
  ('aaina',                 'poem',  'published', 'आईना',                 'आईने से की गई एक ईमानदार बातचीत।', '2024-01-02'),
  -- Groupings
  ('rishton-ki-dor', 'series',     'published', 'रिश्तों की डोर', 'दो बहनें, एक पुराना घर और माँ की डायरी। पहले भाग में डायरी के पन्ने बरसों पुरानी चुप्पी तोड़ते हैं; दूसरे भाग में वह सच सामने आता है जिससे माँ अपनी बेटियों को हमेशा बचाती रहीं।', '2025-12-12'),
  ('dhoop-ke-rang',  'collection', 'published', 'धूप के रंग',     'रोज़मर्रा की ज़िंदगी, रिश्तों और मौसमों पर नीतू सिंह की कविताओं का पहला संग्रह।', '2025-10-01'),
  ('nayi-aawazein',  'anthology',  'published', 'नई आवाज़ें',     '28 लेखकों की कहानियों का संकलन, जो आज के घरों, रिश्तों और छोटे शहरों की ज़िंदगी को अलग-अलग नज़रों से देखती हैं।', '2026-05-01'),
  -- Draft: must never appear on the public site
  ('adhoora-masauda', 'story', 'draft', 'अधूरा मसौदा', 'यह मसौदा है और सार्वजनिक साइट पर नहीं दिखना चाहिए।', '2026-09-30')
on conflict (slug) do nothing;

-- Featured works (home carousel), excerpt and anthology details
update public.works set featured = true
  where slug in ('rishton-ki-dor', 'adhuri-kahani', 'dhoop-ke-rang');

update public.works set excerpt_hi = E'बस हिचकोले लेती हुई आगे बढ़ी।\n"आप रोज़ इसी बस से जाती हैं?" उसने पूछा।\nमैंने कहा, "नहीं, आज पहली बार।"\nवह मुस्कराया, जैसे उसे यह पहले से पता हो।'
  where slug = 'aakhiri-bus';

update public.works set
  editor = '[संपादक का नाम]',
  featured_contributors = array['[प्रमुख लेखक 1]', '[प्रमुख लेखक 2]', '[प्रमुख लेखक 3]'],
  contributors_total = 28
  where slug = 'nayi-aawazein';

-- ---------------------------------------------------------------------------
-- Members: series parts, collection poems, anthology piece
-- ---------------------------------------------------------------------------

insert into public.work_members (parent_id, child_id, position)
select p.id, c.id, m.position
from (values
  ('rishton-ki-dor', 'rishton-ki-dor-bhag-1', 1),
  ('rishton-ki-dor', 'rishton-ki-dor-bhag-2', 2),
  ('dhoop-ke-rang',  'chaand-se-baatein',     1),
  ('dhoop-ke-rang',  'subah-ki-dhoop',        2),
  ('nayi-aawazein',  'maa-ki-chitthi',        1)
) as m (parent_slug, child_slug, position)
join public.works p on p.slug = m.parent_slug
join public.works c on c.slug = m.child_slug
on conflict (parent_id, child_id) do nothing;

-- ---------------------------------------------------------------------------
-- Genres per work
-- ---------------------------------------------------------------------------

insert into public.work_genres (work_id, genre_id)
select w.id, g.id
from (values
  ('khamoshi', 'prem'),
  ('aakhiri-bus', 'prem'), ('aakhiri-bus', 'rahasya'),
  ('adhuri-kahani', 'rahasya'), ('adhuri-kahani', 'prem'),
  ('purana-ghar', 'parivarik'), ('purana-ghar', 'samajik'),
  ('maa-ki-chitthi', 'parivarik'),
  ('rishton-ki-dor-bhag-2', 'parivarik'),
  ('barish-ki-raat', 'rahasya'),
  ('chaand-se-baatein', 'prem'),
  ('subah-ki-dhoop', 'samajik'),
  ('rishton-ki-dor-bhag-1', 'parivarik'),
  ('sawan-ke-jhoole', 'prem'),
  ('aangan-ki-tulsi', 'parivarik'),
  ('roti-ka-hisaab', 'samajik'),
  ('kaanch-ke-rishte', 'parivarik'), ('kaanch-ke-rishte', 'prem'),
  ('dahleez', 'parivarik'), ('dahleez', 'samajik'),
  ('peepal-wali-gali', 'samajik'),
  ('nani-ki-kahaniyan', 'parivarik'),
  ('band-darwaza', 'rahasya'),
  ('aakhiri-khat', 'prem'),
  ('badalte-mausam', 'samajik'),
  ('maa', 'parivarik'),
  ('chitthi-aayi-hai', 'prem'),
  ('intezaar', 'prem'),
  ('gaon-ki-pagdandi', 'samajik'),
  ('betiyan', 'samajik'), ('betiyan', 'parivarik'),
  ('khwabon-ka-shahar', 'prem'),
  ('sannate-ki-awaaz', 'rahasya'),
  ('ghar-wapsi', 'parivarik'),
  ('kiraye-ka-makaan', 'samajik'),
  ('ankahe-rishte', 'parivarik'), ('ankahe-rishte', 'prem'),
  ('dhundh', 'rahasya'),
  ('pehli-tankhwah', 'samajik'), ('pehli-tankhwah', 'parivarik'),
  ('bargad', 'samajik'),
  ('aaina', 'samajik'),
  ('rishton-ki-dor', 'parivarik'),
  ('dhoop-ke-rang', 'samajik'), ('dhoop-ke-rang', 'prem'),
  ('nayi-aawazein', 'parivarik'), ('nayi-aawazein', 'samajik'),
  ('adhoora-masauda', 'prem')
) as x (work_slug, genre_slug)
join public.works w on w.slug = x.work_slug
join public.genres g on g.slug = x.genre_slug
on conflict (work_id, genre_id) do nothing;

-- ---------------------------------------------------------------------------
-- Releases
-- ---------------------------------------------------------------------------

-- Every leaf work (and the draft) is online on Pratilipi.
insert into public.releases (work_id, format, platform_id, url, released_on, chapter_count)
select w.id, 'online', p.id, 'https://example.com/pratilipi/' || w.slug, w.published_on,
  case w.slug
    when 'adhuri-kahani'         then 42
    when 'rishton-ki-dor-bhag-1' then 18
    when 'rishton-ki-dor-bhag-2' then 16
    when 'kaanch-ke-rishte'      then 28
    when 'ankahe-rishte'         then 35
    when 'dhundh'                then 24
  end
from public.works w
join public.platforms p on p.slug = 'pratilipi'
where w.kind in ('poem', 'story', 'novel')
  and not exists (
    select 1 from public.releases r
    where r.work_id = w.id and r.format = 'online' and r.platform_id = p.id
  );

-- Audiobooks, print and ebooks.
insert into public.releases (work_id, format, platform_id, url, released_on, narrator, publisher, isbn)
select w.id, x.format::public.release_format, p.id, x.url, x.released_on::date, x.narrator, x.publisher, x.isbn
from (values
  ('rishton-ki-dor',   'audiobook', 'kuku-fm', 'https://example.com/kuku-fm/rishton-ki-dor',   '2026-06-01', '[वाचक का नाम]', null,               null),
  ('kaanch-ke-rishte', 'audiobook', 'kuku-fm', 'https://example.com/kuku-fm/kaanch-ke-rishte', '2025-11-01', '[वाचक का नाम]', null,               null),
  ('aakhiri-bus',      'audiobook', 'kuku-fm', 'https://example.com/kuku-fm/aakhiri-bus',      '2026-09-01', '[वाचक का नाम]', null,               null),
  ('aakhiri-bus',      'print',     'amazon',  'https://example.com/amazon/aakhiri-bus',       '2026-09-15', null,            '[प्रकाशक का नाम]', '[ISBN]'),
  ('aakhiri-bus',      'ebook',     'amazon',  'https://example.com/amazon/aakhiri-bus-kindle','2026-09-15', null,            '[प्रकाशक का नाम]', null),
  ('sawan-ke-jhoole',  'print',     'amazon',  'https://example.com/amazon/sawan-ke-jhoole',   '2026-01-10', null,            '[प्रकाशक का नाम]', '[ISBN]'),
  ('dhoop-ke-rang',    'print',     'amazon',  'https://example.com/amazon/dhoop-ke-rang',     '2025-10-01', null,            '[प्रकाशक का नाम]', '[ISBN]'),
  ('nayi-aawazein',    'print',     'amazon',  'https://example.com/amazon/nayi-aawazein',     '2026-05-01', null,            '[प्रकाशक का नाम]', '[ISBN]')
) as x (work_slug, format, platform_slug, url, released_on, narrator, publisher, isbn)
join public.works w on w.slug = x.work_slug
join public.platforms p on p.slug = x.platform_slug
where not exists (
  select 1 from public.releases r
  where r.work_id = w.id and r.format = x.format::public.release_format and r.platform_id = p.id
);

-- ---------------------------------------------------------------------------
-- Author profile (single row)
-- ---------------------------------------------------------------------------

insert into public.author_profile (id, tagline_hi, intro_hi, bio_hi, quote_hi, email, social_links) values (
  true,
  'हिंदी कहानीकार और कवयित्री',
  'नीतू सिंह हिंदी में कहानियाँ, कविताएँ और उपन्यास लिखती हैं। उनकी रचनाओं में घर, रिश्ते और रोज़मर्रा की ज़िंदगी के छोटे-छोटे पल बार-बार लौटते हैं। उनकी रचनाएँ प्रतिलिपि पर पढ़ी जा सकती हैं, कुछ कुकू एफ़एम पर सुनी जा सकती हैं, और कुछ किताबों के रूप में छपी हैं।',
  E'[यहाँ उनके लेखन की शुरुआत के बारे में दो-तीन वाक्य: कब और कैसे लिखना शुरू किया, पहली रचना कौन-सी थी।]\n\n[यहाँ उनके विषयों और लिखने के तरीक़े के बारे में: वे किन बातों पर लिखती हैं, किन लेखकों से प्रेरणा मिली, पाठकों से उनका रिश्ता।]\n\n[यहाँ अब तक के काम का सार: कितनी रचनाएँ, कौन-सी किताबें, कौन-से ऑडियोबुक।]',
  '[उनके अपने शब्दों में लिखने के बारे में एक-दो पंक्तियाँ]',
  '[ईमेल पता]',
  '[{"name": "Instagram", "url": "https://example.com/instagram/neetu"}, {"name": "Facebook", "url": "https://example.com/facebook/neetu"}]'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Awards: 3 featured + 8 others (2024–2026)
-- ---------------------------------------------------------------------------

insert into public.awards (title_hi, organiser_hi, year, featured, sort_order)
select x.title_hi, x.organiser_hi, x.year, x.featured, x.sort_order
from (values
  ('[प्रमुख सम्मान 1]', '[संस्था]', 2026, true,  1),
  ('[प्रमुख सम्मान 2]', '[संस्था]', 2025, true,  2),
  ('[प्रमुख सम्मान 3]', '[संस्था]', 2024, true,  3),
  ('[सम्मान 1]',       '[संस्था]', 2026, false, 0),
  ('[सम्मान 2]',       '[संस्था]', 2026, false, 0),
  ('[सम्मान 3]',       '[संस्था]', 2026, false, 0),
  ('[सम्मान 4]',       '[संस्था]', 2025, false, 0),
  ('[सम्मान 5]',       '[संस्था]', 2025, false, 0),
  ('[सम्मान 6]',       '[संस्था]', 2025, false, 0),
  ('[सम्मान 7]',       '[संस्था]', 2024, false, 0),
  ('[सम्मान 8]',       '[संस्था]', 2024, false, 0)
) as x (title_hi, organiser_hi, year, featured, sort_order)
where not exists (select 1 from public.awards a where a.title_hi = x.title_hi);
