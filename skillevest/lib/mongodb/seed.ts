import { connectDB } from './connection'
import Track from './models/Track'
import Task from './models/Task'
import { seedGigs } from './seed-gigs'

/* ─── Track 1: Cold Email Copywriting ───────────────────────── */
const COLD_EMAIL_TRACK = {
  title: 'Cold Email Copywriting',
  slug: 'cold-email-copywriting',
  category: 'copywriting' as const,
  description: 'Learn to write cold emails that actually get replies — and land your first paid gig within 14 days.',
  full_description: `Cold email is the highest-ROI skill for Nigerian freelancers right now. Brands pay ₦5,000–₦50,000 per campaign, and most writers don't know how to do it. In 14 days you'll go from zero to a portfolio of proven cold emails — and apply for your first real gig on SkillVest.`,
  duration_days: 14,
  difficulty: 'beginner' as const,
  is_premium: false,
  is_published: true,
  avg_earning_naira: 12000,
  tags: ['copywriting', 'email', 'freelance', 'beginner'],
}

const COLD_EMAIL_TASKS = [
  {
    day_number: 1,
    title: 'Anatomy of a Winning Cold Email',
    description: 'Study the 5-part structure every high-converting cold email shares, then write a breakdown.',
    instructions: `Read the following structure carefully:\n\n1. **Subject line** — one job: get the open\n2. **Opening line** — personalised, never generic\n3. **Value proposition** — what's in it for THEM in one sentence\n4. **Social proof / credibility** — one line max\n5. **Call to action** — single, low-friction ask\n\nYour task: Find a real cold email online (LinkedIn, Reddit, newsletters) and write a 200-word breakdown analysing each of the 5 parts. Be specific — quote lines from the email you found.`,
    submission_type: 'text' as const,
    grading_rubric: { clarity: 30, relevance: 30, structure: 20, grammar: 20 },
    max_score: 100,
    xp_reward: 50,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [
      { title: 'Cold Email Masterclass — Lemlist', url: 'https://blog.lemlist.com/cold-email-masterclass/' },
      { title: 'Why Most Cold Emails Fail', url: 'https://backlinko.com/cold-email' },
    ],
  },
  {
    day_number: 2,
    title: 'Write a Cold Email for a Nigerian E-Commerce Brand',
    description: 'Apply the 5-part structure to write a real cold email pitching your copywriting service.',
    instructions: `Choose a real Nigerian e-commerce brand (Jumia seller, Instagram shop, any brand you can find). Research them for 10 minutes.\n\nWrite a cold email (150–200 words) pitching yourself as a copywriter who can improve their product descriptions or email campaigns.\n\nRequirements:\n- Subject line: must not start with "I"\n- Opening line: must reference something specific about their brand\n- One concrete value prop (e.g. "I helped a Lagos fashion brand increase WhatsApp click-throughs by 40%")\n- One CTA asking for a 15-minute call or a reply\n\nPaste the full email in your submission. Add 2 sentences explaining why you chose that brand.`,
    submission_type: 'text' as const,
    grading_rubric: { personalization: 35, value_proposition: 30, call_to_action: 20, grammar: 15 },
    max_score: 100,
    xp_reward: 60,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 3,
    title: 'Personalization at Scale — Research + Write',
    description: 'Learn how top copywriters research prospects and write emails that feel 1-to-1.',
    instructions: `Personalization is what separates replies from silence.\n\nStep 1: Pick a real company (any Nigerian startup, SME, or brand with an online presence).\nStep 2: Spend 15 minutes researching them — website, Instagram, LinkedIn, recent news.\nStep 3: Write down 5 "personalization triggers" you found (e.g. "they just launched a new product", "their last Instagram post got 2k likes", "their website copy is weak").\nStep 4: Write a cold email using at least 2 of those triggers naturally in the email.\n\nSubmit: Your 5 triggers + the full cold email (150–200 words).`,
    submission_type: 'text' as const,
    grading_rubric: { research_depth: 30, personalization: 35, email_quality: 25, grammar: 10 },
    max_score: 100,
    xp_reward: 65,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 4,
    title: 'Subject Line Mastery — Write 10, Grade Peers',
    description: 'The subject line determines everything. Write 10 for different scenarios and review classmates.',
    instructions: `Subject lines are the most important 5–8 words in any cold email.\n\nWrite 10 subject lines for the following scenarios (2 per scenario):\n1. Pitching email copywriting to a Lagos restaurant\n2. Offering social media captions to a beauty brand in Abuja\n3. Proposing product descriptions to a fashion e-commerce store\n4. Offering WhatsApp broadcast writing to a fintech app\n5. Pitching a content calendar to a startup founder\n\nRules:\n- No subject line can start with "I"\n- None can be longer than 8 words\n- At least 3 must use curiosity/open loops\n- At least 2 must use numbers\n\nSubmit all 10 with a 1-sentence explanation of your strategy for each.`,
    submission_type: 'text' as const,
    grading_rubric: { creativity: 30, rule_compliance: 25, strategy: 25, variety: 20 },
    max_score: 100,
    xp_reward: 70,
    naira_reward: 0,
    is_peer_reviewed: true,
    resources: [],
  },
  {
    day_number: 5,
    title: 'Send Your First Real Pitch — Screenshot the Result',
    description: 'Take it live. Send a real cold email to a real brand and submit proof.',
    instructions: `Today you send a real cold email to a real business.\n\nFind a Nigerian brand (Instagram shop, website, LinkedIn company) that could benefit from better copy. Send them the email you wrote on Day 2 or 3 (polished).\n\nSubmit:\n1. A link to the brand's website or Instagram\n2. A screenshot or copy-paste of the exact email you sent (with recipient's name redacted if preferred)\n3. A screenshot showing the email was sent (sent folder, WhatsApp DM, etc.)\n4. 2–3 sentences: What do you expect to happen? What did you learn from the process of sending it?\n\nNote: A reply is NOT required for a passing grade. Sending = win. This task awards bonus XP if you get a reply.`,
    submission_type: 'link' as const,
    grading_rubric: { proof_of_send: 50, email_quality: 30, reflection: 20 },
    max_score: 100,
    xp_reward: 100,
    naira_reward: 500,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 6,
    title: 'Follow-Up Sequences — The Money Is in the Follow-Up',
    description: '80% of deals close on follow-up 2–5. Learn to write a 3-email sequence.',
    instructions: `Most freelancers send one email and give up. The pros send a sequence.\n\nWrite a 3-email cold outreach sequence for a Nigerian copywriter pitching to e-commerce brands:\n- Email 1: Initial pitch (you can reuse/adapt Day 2's email)\n- Email 2 (3 days later): Soft follow-up, add new value or insight — max 80 words\n- Email 3 (7 days later): Breakup email — light humour, last attempt, max 50 words\n\nFor each email include: Subject line + body + send timing note.\n\nTotal submission: all 3 emails properly labelled.`,
    submission_type: 'text' as const,
    grading_rubric: { sequence_logic: 30, tone_progression: 30, value_per_email: 25, grammar: 15 },
    max_score: 100,
    xp_reward: 75,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 7,
    title: 'Niche Down — Write for 3 Industries',
    description: 'Generalists get ignored. Specialists get hired. Write industry-specific cold emails.',
    instructions: `Brands hire specialists, not generalists. "I write emails for Lagos restaurants" beats "I write emails" every time.\n\nPick 3 industries from this list:\n- Nigerian restaurants / food brands\n- Fashion and beauty brands\n- Fintech / financial services\n- Real estate agencies\n- EdTech / online courses\n\nFor each industry:\n1. List 3 pain points brands in that niche have with their current emails/copy\n2. Write a 150-word cold email that speaks directly to those pain points\n3. Add a 1-line tagline you'd use as a niche specialist (e.g. "Email copy for Nigerian fashion brands that sell")\n\nSubmit all 3 sets.`,
    submission_type: 'text' as const,
    grading_rubric: { niche_insight: 35, email_quality: 35, tagline: 15, grammar: 15 },
    max_score: 100,
    xp_reward: 75,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 8,
    title: 'A/B Testing Your Subject Lines',
    description: 'Learn how to split-test and which metrics matter for cold email campaigns.',
    instructions: `Professional copywriters test everything. Today you learn A/B testing.\n\nWrite 2 versions (A and B) of a complete cold email for a Nigerian fashion brand. The emails must be identical except for:\n- Version A: curiosity-driven subject line\n- Version B: benefit-driven subject line\n\nThen write a 200-word analysis predicting which will perform better and WHY, referencing:\n- Open rate (subject line impact)\n- Reply rate (body quality)\n- What you would change after seeing results\n\nSubmit: Both full emails + your analysis.`,
    submission_type: 'text' as const,
    grading_rubric: { email_quality: 30, ab_understanding: 35, analysis_depth: 25, grammar: 10 },
    max_score: 100,
    xp_reward: 75,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 9,
    title: 'Cold Email for B2B — Agency to Brand',
    description: 'Shift from freelancer pitch to agency-style outreach with a higher price anchor.',
    instructions: `B2B cold emails have a different tone — more formal, more ROI-focused, shorter.\n\nScenario: You run a small copywriting agency called "Inkforge Creative" (or name it yourself). You're pitching to the marketing manager of a Nigerian bank's digital arm.\n\nWrite a B2B cold email (max 150 words) that:\n- Opens with a relevant industry insight (not a compliment)\n- Quantifies the value you deliver (use made-up but realistic numbers)\n- Ends with a specific, easy CTA (link to calendar, ask for intro call)\n\nAlso write 3 alternative subject lines for this email.\n\nSubmit: The email + 3 subject lines + a note on how this differs from a freelancer pitch.`,
    submission_type: 'text' as const,
    grading_rubric: { b2b_tone: 30, roi_framing: 30, subject_lines: 25, grammar: 15 },
    max_score: 100,
    xp_reward: 80,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 10,
    title: 'Handling Objections in Email',
    description: 'Write emails that pre-empt "we have someone already" and "not interested" before they happen.',
    instructions: `Top 3 objections cold email recipients have:\n1. "We already have a copywriter"\n2. "Your prices are too high"\n3. "We don't have budget right now"\n\nFor each objection:\n1. Write a 2-sentence rebuttal that could appear in your original email to pre-empt it\n2. Write a 60-word reply you'd send if they responded with that objection\n\nThen write one complete cold email that pre-empts all 3 objections naturally (without sounding defensive).\n\nSubmit: 3 rebuttals + 3 objection replies + the full email.`,
    submission_type: 'text' as const,
    grading_rubric: { objection_handling: 35, email_quality: 30, naturalness: 25, grammar: 10 },
    max_score: 100,
    xp_reward: 80,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 11,
    title: 'Build Your Cold Email Swipe File',
    description: 'Collect, analyse, and document 5 real-world cold emails into your personal swipe file.',
    instructions: `A swipe file is every professional copywriter's secret weapon — a curated library of emails that work.\n\nFind 5 real cold emails (LinkedIn posts, Reddit r/copywriting, email newsletters, examples shared online).\n\nFor each email:\n1. Paste the full email (or a summary if you can't find the full text)\n2. Rate it 1–10 with justification\n3. Identify: What worked? What failed?\n4. Rewrite the weakest part (subject line or opening) to make it stronger\n\nSubmit: All 5 analyses in a structured format.`,
    submission_type: 'text' as const,
    grading_rubric: { analysis_quality: 35, rewrites: 30, variety: 20, grammar: 15 },
    max_score: 100,
    xp_reward: 80,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 12,
    title: 'Write a 5-Email Drip Sequence for a Nigerian SaaS',
    description: 'Level up from cold email to full email sequence — a premium freelance offering.',
    instructions: `SaaS companies pay ₦15,000–₦80,000 for a welcome/nurture email sequence. Today you write one.\n\nScenario: "PayTrack" is a Nigerian invoicing SaaS for freelancers. They need a 5-email onboarding drip for new signups.\n\nWrite all 5 emails:\n- Email 1 (Day 0): Welcome + one quick win\n- Email 2 (Day 2): Feature highlight — invoicing\n- Email 3 (Day 5): Social proof — success story\n- Email 4 (Day 8): Handle objection / FAQ\n- Email 5 (Day 14): Upgrade CTA (paid plan)\n\nEach email: subject line + 100–150 word body.\n\nSubmit all 5 emails labelled clearly.`,
    submission_type: 'text' as const,
    grading_rubric: { sequence_flow: 30, each_email_quality: 35, cta_strength: 20, grammar: 15 },
    max_score: 100,
    xp_reward: 90,
    naira_reward: 0,
    is_peer_reviewed: true,
    resources: [],
  },
  {
    day_number: 13,
    title: 'Portfolio Email — Your Best Work, Documented',
    description: 'Compile your 3 best emails from this track into a portfolio-ready document.',
    instructions: `Clients want proof before they pay. Today you build your portfolio.\n\nFrom Days 1–12, select your 3 best emails. For each one:\n1. Write a 50-word context note: "Who is the brand, what problem does this email solve?"\n2. Polish the email — fix any grammar, sharpen the subject line, tighten the CTA\n3. Write a "results hypothesis": If this was sent to 100 people, what open rate and reply rate would you predict? Why?\n\nFormat it as a clean document (Google Doc link or well-structured plain text).\n\nSubmit: Link to your Google Doc OR the full formatted text with all 3 emails.`,
    submission_type: 'text' as const,
    grading_rubric: { portfolio_quality: 35, context_notes: 25, polish: 25, results_thinking: 15 },
    max_score: 100,
    xp_reward: 90,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 14,
    title: 'Final Project — Full Cold Email Campaign for a Real Brand',
    description: 'Deliver a complete, client-ready cold email campaign. Your graduation assignment.',
    instructions: `This is your graduation project. Treat it like a real client brief.\n\nChoose any Nigerian brand (real or fictional but realistic). Deliver a complete cold email campaign package:\n\n**1. Brand Research Summary** (100 words)\n- Who they are, what they sell, what their current marketing looks like\n\n**2. Target Audience Profile** (50 words)\n- Who you'd be emailing on their behalf\n\n**3. Campaign: 3-Email Outreach Sequence**\n- Email 1: Initial pitch\n- Email 2: Follow-up (Day 3)\n- Email 3: Final follow-up (Day 7)\n\n**4. 5 Subject Line Variants** for Email 1 (for A/B testing)\n\n**5. Pricing Proposal** — what would you charge for this if the client hired you? Justify it.\n\nSubmit as a Google Doc link or fully formatted text. This becomes part of your SkillVest verified portfolio.`,
    submission_type: 'link' as const,
    grading_rubric: { research: 20, campaign_quality: 35, sequence_logic: 25, pricing_justification: 20 },
    max_score: 100,
    xp_reward: 150,
    naira_reward: 1000,
    is_peer_reviewed: true,
    resources: [],
  },
]

/* ─── Track 2: Canva Social Media Design ────────────────────── */
const CANVA_TRACK = {
  title: 'Canva Social Media Design',
  slug: 'canva-social-media-design',
  category: 'design' as const,
  description: 'Go from zero design experience to a portfolio of professional social media graphics — and win your first paid gig.',
  full_description: `Nigerian brands spend millions on social media content but most don't have an in-house designer. In 14 days you'll master Canva, build a real portfolio, and land your first paid design gig. No prior design experience needed.`,
  duration_days: 14,
  difficulty: 'beginner' as const,
  is_premium: false,
  is_published: true,
  avg_earning_naira: 8000,
  tags: ['design', 'canva', 'social-media', 'beginner', 'portfolio'],
}

const CANVA_TASKS = [
  {
    day_number: 1,
    title: 'Set Up Canva Pro and Complete Your Brand Kit',
    description: 'Get Canva Pro free (student trial) and set up your first brand kit.',
    instructions: `Canva Pro is free for students. Get it now.\n\n**Step 1: Activate Canva Pro**\nGo to canva.com/education — sign up with your .edu email or apply for Canva for Education access.\n\n**Step 2: Create Your Personal Brand Kit**\nIn Canva, go to Brand Kit and set up:\n- 2 primary colours (pick colours that represent your personality)\n- 1 accent colour\n- 2 fonts (one heading, one body)\n- Upload a simple logo (use Canva to design one if you don't have one)\n\n**Step 3: Explore Canva Pro features**\nSpend 20 minutes exploring: Background Remover, Magic Resize, Animate, Brand Kit templates.\n\n**Submit**: A link to your Canva Brand Kit (set to "Anyone with link can view") + a screenshot of your Brand Kit page.`,
    submission_type: 'link' as const,
    grading_rubric: { brand_kit_completion: 40, colour_harmony: 30, font_pairing: 20, link_works: 10 },
    max_score: 100,
    xp_reward: 50,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [
      { title: 'Canva for Education', url: 'https://www.canva.com/education/' },
      { title: 'Brand Kit Tutorial', url: 'https://www.canva.com/learn/brand-kit/' },
    ],
  },
  {
    day_number: 2,
    title: 'Design an Instagram Post for a Lagos Restaurant',
    description: 'Your first real design brief. A Lagos restaurant needs a promo post.',
    instructions: `**Client Brief:**\nYou're designing for "Obalende Suya Spot" — a popular suya and grills restaurant in Lagos. They want a post promoting their Friday Night Special: "Buy 2 skewers, get 1 free."\n\n**Brand colours**: Red (#E63946) and Gold (#F4A261)\n**Vibe**: Bold, urban, appetising. Target: Lagos young professionals aged 22–35.\n\n**Requirements:**\n- Size: 1080 × 1080px (Instagram square)\n- Must include: Restaurant name, the offer, a call to action ("Order on WhatsApp")\n- Use at least one food photo (from Canva's free library or Unsplash)\n- Apply the red + gold colour scheme\n\n**Submit**: A public Canva link to your design.`,
    submission_type: 'link' as const,
    grading_rubric: { visual_appeal: 35, brief_compliance: 30, typography: 20, colour_use: 15 },
    max_score: 100,
    xp_reward: 60,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 3,
    title: 'Design a 3-Post Instagram Carousel for a Fashion Brand',
    description: 'Carousels get 3x more engagement. Learn to design a swipeable story.',
    instructions: `**Client Brief:**\n"Afro Drip Lagos" — an Afrocentric streetwear brand. They want a 3-slide carousel titled: "3 Ways to Style Your Ankara This Week"\n\n**Requirements:**\n- Slide 1: Eye-catching cover (title + brand name + bold image)\n- Slide 2: Look 1 — outfit name, brief style tip (1 sentence)\n- Slide 3: Look 2 + Look 3 — grid or split layout\n- Consistent colour theme across all 3 slides\n- Last slide must end with a CTA ("DM us to shop")\n\n**Size**: 1080 × 1080px each\n\n**Submit**: A Canva link containing all 3 slides (in one Canva design, multi-page).`,
    submission_type: 'link' as const,
    grading_rubric: { carousel_consistency: 30, visual_appeal: 30, typography: 20, cta_clarity: 20 },
    max_score: 100,
    xp_reward: 65,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 4,
    title: 'Design a WhatsApp Promo Flyer',
    description: 'WhatsApp is Nigeria\'s #1 marketing channel. Design a flyer optimised for it.',
    instructions: `WhatsApp flyers need to work on a phone screen with no zoom. They must be readable in 2 seconds.\n\n**Client Brief:**\n"GlowUp Skincare" — a Lagos skincare brand. They want a WhatsApp flyer for their "Black Friday in April" promo: 40% off all serums, this weekend only.\n\n**Requirements:**\n- Size: 1080 × 1080px\n- Must be readable as a thumbnail (test by zooming out)\n- Include: Brand name, offer (40% off), product name (serums), urgency (weekend only), contact (use a placeholder number)\n- Use no more than 3 fonts\n- Include a price crossed out vs new price (e.g. ₦8,000 → ₦4,800)\n\n**Submit**: Canva link + a screenshot of how it looks at 50% zoom (thumbnail size).`,
    submission_type: 'link' as const,
    grading_rubric: { readability: 35, visual_hierarchy: 30, brief_compliance: 25, thumbnail_test: 10 },
    max_score: 100,
    xp_reward: 65,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 5,
    title: 'Design a Twitter/X Banner and Profile Package',
    description: 'Many Nigerian brands have poor Twitter branding. You\'ll fix that.',
    instructions: `**Client Brief:**\nA Lagos-based freelance photographer, "Tunde Visuals", needs a complete Twitter/X profile package.\n\n**Deliverables:**\n1. **Profile picture frame** — 400 × 400px, circular-safe, with a subtle branded border/ring\n2. **Twitter banner** — 1500 × 500px — must work on both desktop and mobile (keep key content in centre 60%)\n3. **Pinned post graphic** — 1200 × 675px — a "services" graphic listing 3 photography packages\n\nBrand vibe: dark, cinematic, professional. Colours: Black, white, and one accent (your choice).\n\n**Submit**: Canva link with all 3 designs on separate pages.`,
    submission_type: 'link' as const,
    grading_rubric: { banner_mobile_safety: 30, brand_consistency: 30, visual_quality: 25, all_three_delivered: 15 },
    max_score: 100,
    xp_reward: 75,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 6,
    title: 'Typography Deep-Dive — Design 5 Quote Cards',
    description: 'Typography IS design. Learn to make words look incredible.',
    instructions: `Quote cards are one of the highest-engagement post types for Nigerian brands.\n\nDesign 5 quote cards (1080 × 1080px each), each with a different typographic treatment:\n\n1. **Minimalist** — white background, black text, one accent line\n2. **Bold/Expressive** — large font fills 80% of the canvas\n3. **Dark luxury** — dark background, gold or white text, subtle texture\n4. **Handwritten feel** — use a script font as the main quote\n5. **Layered** — quote overlaid on a photo with proper contrast treatment\n\nUse this quote for all 5:\n*"The best investment you can make is in yourself." — Warren Buffett*\n\nAdd the brand name "SkillVest" as a small watermark on each.\n\n**Submit**: Canva link with all 5 on separate pages.`,
    submission_type: 'link' as const,
    grading_rubric: { typographic_variety: 35, readability: 30, visual_quality: 25, watermark: 10 },
    max_score: 100,
    xp_reward: 75,
    naira_reward: 0,
    is_peer_reviewed: true,
    resources: [],
  },
  {
    day_number: 7,
    title: 'Design a Full Instagram Grid Plan (9 Posts)',
    description: 'Top designers don\'t design posts — they design feeds. Plan and create a cohesive 9-post grid.',
    instructions: `A consistent grid makes a brand's Instagram look professional and trustworthy.\n\n**Client Brief:**\n"NutriNaija" — a Nigerian health and wellness brand selling smoothie packs.\n\n**Your task:**\n1. Plan a 9-post grid layout (sketch on paper or use Canva — there are grid planning templates)\n2. Design 3 of those 9 posts at full quality (1080 × 1080px)\n3. Create 6 "placeholder" thumbnails showing colour/layout for the other 6\n\nThe grid should have a recognisable pattern — alternating colours, consistent borders, or a colour palette that looks unified when viewed together.\n\n**Submit**: Canva link showing the grid plan + 3 finished posts clearly labelled.`,
    submission_type: 'link' as const,
    grading_rubric: { grid_cohesion: 35, three_post_quality: 35, planning_shown: 20, brand_fit: 10 },
    max_score: 100,
    xp_reward: 80,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 8,
    title: 'Infographic Design — Turn Data into Visuals',
    description: 'Infographics command premium prices. Learn the layout principles and design one.',
    instructions: `Brands pay ₦8,000–₦25,000 for a good infographic. Here's your chance to learn.\n\n**Topic:** "5 Digital Skills Nigerian Students Can Monetise in 2025"\n\n**Requirements:**\n- Size: 1080 × 1920px (portrait — shareable on Instagram Stories and WhatsApp)\n- Include: A title section, 5 numbered sections (one per skill), icons for each, a closing CTA\n- Use a consistent colour palette (max 3 colours)\n- Each skill section must have: Skill name + 1-line description + estimated earning range\n\nUse realistic Nigerian earning ranges you've researched.\n\n**Submit**: Canva link to the infographic.`,
    submission_type: 'link' as const,
    grading_rubric: { information_hierarchy: 30, visual_design: 30, readability: 25, accuracy: 15 },
    max_score: 100,
    xp_reward: 80,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 9,
    title: 'Design a Canva Presentation (Pitch Deck — 8 Slides)',
    description: 'Canva presentations are a high-value offering. Design an 8-slide startup pitch deck.',
    instructions: `Many Nigerian startups need pitch deck redesigns. This is a premium service.\n\n**Scenario:** "FarmLink" is a Nigerian agritech startup connecting smallholder farmers to buyers. They need a clean 8-slide pitch deck.\n\n**Design 8 slides:**\n1. Cover: Company name, tagline, logo\n2. Problem: What pain does FarmLink solve?\n3. Solution: How FarmLink solves it\n4. Market size: Nigerian agri market stats (you can make realistic numbers)\n5. How it works: 3-step visual flow\n6. Traction: Made-up but realistic metrics\n7. Team: 3 fictional team members with roles\n8. Ask: Investment ask + use of funds\n\nKeep slides clean — max 30 words per slide. Let visuals do the talking.\n\n**Submit**: Canva presentation link (Anyone with link can view).`,
    submission_type: 'link' as const,
    grading_rubric: { slide_design: 35, content_clarity: 30, consistency: 25, storytelling: 10 },
    max_score: 100,
    xp_reward: 85,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 10,
    title: 'Canva Video — Design a 15-Second Animated Post',
    description: 'Video content gets 5x more reach. Learn Canva\'s animation and video tools.',
    instructions: `Canva Pro has powerful animation and video tools that most designers ignore.\n\n**Brief:** Design a 15-second animated Instagram Reel/Story for a Nigerian food delivery app called "QuickChow".\n\n**Requirements:**\n- Start with a hook frame (bold text or image, 0–3 seconds)\n- Middle section: show 3 food categories with animation (3–12 seconds)\n- End frame: app name + CTA + logo (12–15 seconds)\n- Add background music from Canva's audio library\n- Export and re-upload to Canva or submit the Canva link with video preview\n\n**Animations to use:** At minimum, apply "Rise", "Fade", or "Pan" to 3 different elements.\n\n**Submit**: Canva link with video playable (or a Google Drive link to the exported MP4).`,
    submission_type: 'link' as const,
    grading_rubric: { animation_quality: 35, storytelling: 25, brand_execution: 25, duration_accuracy: 15 },
    max_score: 100,
    xp_reward: 85,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 11,
    title: 'Reverse-Engineer a Top Brand\'s Design',
    description: 'Study how professional brands design, then recreate their style in Canva.',
    instructions: `The fastest way to improve your design is to study and recreate the pros.\n\n**Step 1:** Find a Nigerian brand with excellent Instagram design (MTN, Piggyvest, Flutterwave, Sabi, or any brand you admire).\n\n**Step 2:** Screenshot 3 of their posts.\n\n**Step 3:** Recreate ONE of those 3 posts in Canva as closely as possible (different text/content, same layout and style).\n\n**Step 4:** Write a 150-word "design breakdown" covering:\n- What makes their design work?\n- What fonts/colours/layouts do they favour?\n- What did you learn from recreating it?\n\n**Submit**: Original screenshot + your Canva recreation link + written breakdown.`,
    submission_type: 'link' as const,
    grading_rubric: { recreation_accuracy: 35, analysis_quality: 30, learning_articulated: 25, screenshot_provided: 10 },
    max_score: 100,
    xp_reward: 85,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 12,
    title: 'Price Your Services — Build a Canva Design Rate Card',
    description: 'Most designers undercharge because they don\'t know their worth. Fix that today.',
    instructions: `Before you take a paid gig, you need to know what to charge.\n\n**Part 1: Market Research**\nFind 3 Nigerian freelance designers on Fiverr, Instagram, or Twitter. Note what they charge for:\n- Instagram post (single)\n- 3-post carousel\n- Logo design\n- WhatsApp flyer\n- Full month's content (12 posts)\n\n**Part 2: Your Rate Card**\nUsing what you learned, design a professional Rate Card in Canva (A4 or square format) listing your services and prices. Make it look like something you'd actually send a client.\n\nStart slightly below market rate (you're building your portfolio) but not too low (underselling hurts everyone).\n\n**Submit**: Canva link to your Rate Card + a brief note on your pricing rationale.`,
    submission_type: 'link' as const,
    grading_rubric: { rate_card_design: 35, market_research_shown: 30, pricing_rationale: 25, professionalism: 10 },
    max_score: 100,
    xp_reward: 85,
    naira_reward: 0,
    is_peer_reviewed: false,
    resources: [],
  },
  {
    day_number: 13,
    title: 'Build Your Design Portfolio in Canva',
    description: 'Compile your best work into a shareable portfolio that wins clients.',
    instructions: `Clients want to see your work before they hire you. Today you build your portfolio.\n\n**Design a portfolio presentation in Canva** — at least 8 slides:\n\n1. Cover: Your name + "Canva Social Media Designer" + contact info\n2. About me: 3 sentences + what you specialise in\n3–7: Your 5 best designs from this track (one per slide, with a 1-line project description)\n8. Services & Rates: Brief summary of what you offer and starting prices\n9. Contact slide: WhatsApp number, email, Instagram handle (or placeholders)\n\nMake the portfolio itself demonstrate your design skills — it IS your first impression.\n\n**Submit**: Canva link to portfolio (Anyone with link can view).`,
    submission_type: 'link' as const,
    grading_rubric: { portfolio_design_quality: 35, work_showcase: 30, professionalism: 25, contact_slide: 10 },
    max_score: 100,
    xp_reward: 90,
    naira_reward: 0,
    is_peer_reviewed: true,
    resources: [],
  },
  {
    day_number: 14,
    title: 'Final Project — Design a Complete Social Media Package for a Real Brand',
    description: 'Graduate with a full client-ready design package in your portfolio.',
    instructions: `This is your graduation project. Deliver a complete social media design package.\n\n**Choose a real or realistic Nigerian brand** (restaurant, fashion brand, startup, personal brand).\n\n**Deliver:**\n\n1. **Brand Style Guide** (1 slide): Colours (hex codes), fonts, logo usage rules\n2. **5 Instagram posts** (1080 × 1080px): Variety — at least 1 promo, 1 quote, 1 carousel (3 slides), 1 infographic, 1 Reel cover\n3. **1 WhatsApp flyer** for a specific promo or event\n4. **1 Instagram Story** (1080 × 1920px)\n5. **Pricing proposal**: What would you charge a real client for this full package? Justify it.\n\n**Submit**: A single Canva link containing all deliverables on separate pages, clearly labelled.`,
    submission_type: 'link' as const,
    grading_rubric: { package_completeness: 25, design_quality: 35, brand_consistency: 25, pricing_justification: 15 },
    max_score: 100,
    xp_reward: 150,
    naira_reward: 1000,
    is_peer_reviewed: true,
    resources: [],
  },
]

/* ─── seeder ─────────────────────────────────────────────────── */
async function seedTracks(): Promise<void> {
  await connectDB()

  let tracksInserted = 0
  let tasksInserted = 0
  let skipped = 0

  for (const [trackData, tasks] of [
    [COLD_EMAIL_TRACK, COLD_EMAIL_TASKS],
    [CANVA_TRACK, CANVA_TASKS],
  ] as const) {
    let track = await Track.findOne({ slug: trackData.slug }).lean()

    if (!track) {
      track = await Track.create(trackData)
      tracksInserted++
      console.log(`✓ Track created: ${trackData.title}`)
    } else {
      skipped++
      console.log(`→ Track exists: ${trackData.title}`)
    }

    for (const taskData of tasks) {
      const exists = await Task.findOne({ track_id: track._id, day_number: taskData.day_number }).lean()
      if (exists) continue

      await Task.create({ ...taskData, track_id: track._id })
      tasksInserted++
    }

    console.log(`  ${tasks.length} tasks seeded for "${trackData.title}"`)
  }

  console.log(`\nTrack seed complete: ${tracksInserted} tracks inserted, ${skipped} skipped`)
  console.log(`Task seed complete: ${tasksInserted} tasks inserted`)
}

async function main() {
  console.log('=== SkillVest Seed Script ===\n')
  await seedTracks()
  console.log('\n--- Seeding gigs ---')
  await seedGigs()
  console.log('\n=== Seed complete ===')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
