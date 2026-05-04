import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/connection'
import Track from '@/lib/mongodb/models/Track'
import Task from '@/lib/mongodb/models/Task'

const COLD_EMAIL_TRACK = {
  title: 'Cold Email Copywriting',
  slug: 'cold-email-copywriting',
  category: 'copywriting' as const,
  description: 'Learn to write cold emails that get replies and earn ₦5,000–₦50,000 per campaign.',
  full_description: 'Master the art of cold email copywriting — the highest-paying remote skill in Nigeria. You will learn to research prospects, craft irresistible subject lines, write persuasive email bodies, and build full campaigns that agencies and founders pay top dollar for.',
  duration_days: 14,
  difficulty: 'beginner' as const,
  is_premium: false,
  is_published: true,
  avg_earning_naira: 25000,
  tags: ['copywriting', 'cold-email', 'freelance', 'remote'],
}

const CANVA_TRACK = {
  title: 'Canva Social Media Design',
  slug: 'canva-social-media-design',
  category: 'design' as const,
  description: 'Create stunning social media graphics with Canva and earn ₦3,000–₦30,000 per project.',
  full_description: 'Become a professional social media designer using Canva. You will master brand kits, design systems, carousel posts, infographics, video thumbnails, and pitch decks — all skills that businesses and agencies pay recurring fees for.',
  duration_days: 14,
  difficulty: 'beginner' as const,
  is_premium: false,
  is_published: true,
  avg_earning_naira: 15000,
  tags: ['design', 'canva', 'social-media', 'freelance'],
}

const COLD_EMAIL_TASKS = [
  { day_number: 1, title: 'Cold Email Anatomy', description: 'Learn the 5 parts of every high-converting cold email.', instructions: 'Study the subject line, opener, value prop, CTA, and signature. Write 3 example emails and submit the Google Doc link.', submission_type: 'link' as const, grading_rubric: { clarity: 30, structure: 40, grammar: 30 }, max_score: 100, xp_reward: 50, naira_reward: 0, resources: [{ type: 'article', title: 'Anatomy of a Cold Email', url: 'https://blog.hubspot.com/sales/cold-email' }], is_peer_reviewed: false },
  { day_number: 2, title: 'Subject Line Mastery', description: 'Write 20 subject lines for 4 different niches.', instructions: 'Create 5 subject lines each for: SaaS, E-commerce, Agency, and Local Business. Submit as a Google Doc.', submission_type: 'link' as const, grading_rubric: { creativity: 40, relevance: 30, open_rate_potential: 30 }, max_score: 100, xp_reward: 60, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 3, title: 'The Perfect Opener', description: 'Write personalised openers that do not sound like spam.', instructions: 'Research 5 real businesses (LinkedIn/website). Write a custom opener for each. Submit link.', submission_type: 'link' as const, grading_rubric: { personalization: 50, relevance: 30, tone: 20 }, max_score: 100, xp_reward: 60, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 4, title: 'Value Proposition Writing', description: 'Craft compelling value props for different industries.', instructions: 'Write value propositions for 3 industries. Each must include a specific outcome + timeframe. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { specificity: 40, outcome_focus: 40, clarity: 20 }, max_score: 100, xp_reward: 70, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 5, title: 'CTA That Converts', description: 'Write 15 different CTAs for cold email scenarios.', instructions: 'Write 3 CTAs each for: meeting booking, free audit, case study, demo, and quick question. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { low_friction: 40, clarity: 30, urgency: 30 }, max_score: 100, xp_reward: 60, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 6, title: 'First Full Cold Email', description: 'Write your first complete cold email for a SaaS company.', instructions: 'Choose a Nigerian SaaS company. Write a full cold email (subject + body + CTA). Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { clarity: 25, personalization: 25, structure: 25, cta_quality: 25 }, max_score: 100, xp_reward: 80, naira_reward: 200, resources: [], is_peer_reviewed: false },
  { day_number: 7, title: 'Personalization at Scale', description: 'Learn to personalize emails without writing each from scratch.', instructions: 'Build a cold email template with 5 personalization variables. Fill in 3 real examples. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { template_quality: 40, personalization_depth: 40, scalability: 20 }, max_score: 100, xp_reward: 70, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 8, title: 'A/B Testing Emails', description: 'Understand how to test and improve email performance.', instructions: 'Write 2 versions (A and B) of the same cold email — different subject lines and openers. Explain what you are testing. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { hypothesis: 30, variation_quality: 40, analysis: 30 }, max_score: 100, xp_reward: 70, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 9, title: 'B2B Cold Email Campaign', description: 'Write a 3-email sequence for a B2B prospect.', instructions: 'Pick a B2B niche. Write Email 1 (intro), Email 2 (follow-up), Email 3 (break-up). Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { sequence_logic: 35, tone: 25, personalization: 25, cta: 15 }, max_score: 100, xp_reward: 80, naira_reward: 300, resources: [], is_peer_reviewed: false },
  { day_number: 10, title: 'Follow-Up Sequences', description: 'Master the art of the follow-up without being annoying.', instructions: 'Write 5 follow-up emails for a prospect who has gone silent. Each must feel fresh. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { variety: 30, tone: 30, persistence: 20, cta: 20 }, max_score: 100, xp_reward: 70, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 11, title: 'Niche Swipe File', description: 'Build a personal swipe file of cold email templates.', instructions: 'Create a swipe file with 10 templates across 5 niches (2 each). Include notes on what makes each work. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { variety: 25, quality: 40, annotations: 35 }, max_score: 100, xp_reward: 80, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 12, title: 'Email Drip Sequence', description: 'Write a 5-day educational drip sequence for a service business.', instructions: 'Choose a service (web design, accounting, etc.). Write a 5-email drip that educates + sells. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { education_value: 30, sales_integration: 30, sequence_flow: 25, writing_quality: 15 }, max_score: 100, xp_reward: 90, naira_reward: 500, resources: [], is_peer_reviewed: false },
  { day_number: 13, title: 'Client Pitch Email', description: 'Write an email pitching your copywriting services to an agency.', instructions: 'Research a real digital agency in Nigeria. Write a pitch email for your cold email copywriting services. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { research_quality: 25, pitch_clarity: 30, confidence: 20, cta: 25 }, max_score: 100, xp_reward: 90, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 14, title: 'Final Cold Email Campaign', description: 'Deliver a complete cold email campaign for a mock client.', instructions: 'Build a full campaign: brief, 5-email sequence, subject line variants, and send schedule. This is your portfolio piece. Submit Google Doc.', submission_type: 'link' as const, grading_rubric: { research: 15, campaign_quality: 35, sequence_logic: 25, pricing_justification: 25 }, max_score: 100, xp_reward: 150, naira_reward: 1000, resources: [], is_peer_reviewed: true },
]

const CANVA_TASKS = [
  { day_number: 1, title: 'Canva Setup & Brand Kit', description: 'Set up a professional Canva workspace and create a brand kit.', instructions: 'Create a free Canva account. Build a brand kit (logo, 3 brand colours, 2 fonts). Export it and submit the Canva share link.', submission_type: 'link' as const, grading_rubric: { brand_kit_completion: 40, colour_harmony: 30, font_pairing: 30 }, max_score: 100, xp_reward: 50, naira_reward: 0, resources: [{ type: 'video', title: 'Canva for Beginners', url: 'https://www.youtube.com/watch?v=qpBWRLNfVns' }], is_peer_reviewed: false },
  { day_number: 2, title: 'Instagram Post Design', description: 'Design 3 Instagram posts for a fashion brand.', instructions: 'Use the brand kit from Day 1. Create 3 different post styles (product, quote, promo). Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { visual_appeal: 35, brand_consistency: 35, composition: 30 }, max_score: 100, xp_reward: 60, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 3, title: 'Carousel Post Design', description: 'Create a 7-slide educational carousel for a business coach.', instructions: 'Topic: "5 Ways to Get Your First Client". Design all 7 slides (cover + 5 tips + CTA). Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { slide_flow: 30, design_quality: 40, typography: 30 }, max_score: 100, xp_reward: 70, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 4, title: 'Facebook Ad Creative', description: 'Design 2 Facebook ad creatives for a food delivery service.', instructions: 'Create one static image ad and one story-format ad. Include headline and CTA text. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { ad_clarity: 30, visual_hierarchy: 40, cta_visibility: 30 }, max_score: 100, xp_reward: 65, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 5, title: 'Twitter/X Graphics', description: 'Design a thread header and 5 tweet image cards.', instructions: 'Thread topic: "How to earn ₦100k online in 90 days". Create header + 5 visual cards. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { consistency: 30, readability: 40, thread_flow: 30 }, max_score: 100, xp_reward: 60, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 6, title: 'Infographic Design', description: 'Create a data infographic for a fintech startup.', instructions: 'Design an infographic showing "Nigeria Fintech Growth 2020-2024" using made-up but realistic data. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { data_visualisation: 40, design_clarity: 30, colour_use: 30 }, max_score: 100, xp_reward: 80, naira_reward: 200, resources: [], is_peer_reviewed: false },
  { day_number: 7, title: 'YouTube Thumbnail Design', description: 'Design 3 YouTube thumbnails for a finance creator.', instructions: 'Topics: "I Saved ₦500k in 6 Months", "5 Side Hustles for Nigerians", "My First Million Story". Design all 3. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { clickability: 40, text_legibility: 30, colour_contrast: 30 }, max_score: 100, xp_reward: 70, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 8, title: 'Canva Animation', description: 'Create an animated Instagram story for a product launch.', instructions: 'Design a 5-second animated story for a new skincare product. Use Canva animations. Export as MP4 and share the Canva link.', submission_type: 'link' as const, grading_rubric: { animation_smoothness: 35, design_quality: 35, brand_fit: 30 }, max_score: 100, xp_reward: 80, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 9, title: 'Brand Style Guide', description: 'Create a 1-page brand style guide for a startup.', instructions: 'Design a style guide showing: logo usage, colour palette, typography rules, do/do-not examples. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { completeness: 35, design_quality: 35, clarity: 30 }, max_score: 100, xp_reward: 85, naira_reward: 300, resources: [], is_peer_reviewed: false },
  { day_number: 10, title: 'Event Flyer Design', description: 'Design a professional event flyer for a business summit.', instructions: 'Create a flyer for "Lagos Digital Marketing Summit 2026". Include: date, venue, speakers, ticket info. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { information_hierarchy: 35, visual_appeal: 35, professionalism: 30 }, max_score: 100, xp_reward: 65, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 11, title: 'Social Media Content Calendar', description: 'Design a visual content calendar template for a client.', instructions: 'Create a 30-day content calendar template in Canva that a client could fill in. Must look professional. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { usability: 40, design_quality: 30, completeness: 30 }, max_score: 100, xp_reward: 75, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 12, title: 'Pitch Deck Design', description: 'Design a 10-slide investor pitch deck for a startup.', instructions: 'Create a pitch deck for a fictional Nigerian AgriTech startup. Slides: cover, problem, solution, market, product, traction, team, ask, thank you. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { narrative_flow: 30, design_professionalism: 40, data_presentation: 30 }, max_score: 100, xp_reward: 95, naira_reward: 500, resources: [], is_peer_reviewed: false },
  { day_number: 13, title: 'Client Deliverable Package', description: 'Package and present designs professionally for a client handoff.', instructions: 'Take 5 of your best designs. Create a presentation showing each design + rationale. Add a services + pricing page. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { presentation_quality: 35, design_selection: 30, pricing_justification: 35 }, max_score: 100, xp_reward: 90, naira_reward: 0, resources: [], is_peer_reviewed: false },
  { day_number: 14, title: 'Final Design Portfolio', description: 'Build your Canva design portfolio to attract paying clients.', instructions: 'Create a portfolio deck (min 12 designs across 4 categories). Add a bio page, services, and contact info. This is your client-ready portfolio. Submit Canva share link.', submission_type: 'link' as const, grading_rubric: { design_variety: 25, quality_consistency: 35, portfolio_completeness: 25, brief_compliance: 15 }, max_score: 100, xp_reward: 150, naira_reward: 1000, resources: [], is_peer_reviewed: true },
]

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  let tracksInserted = 0
  let tasksInserted = 0
  let skipped = 0

  const pairs = [
    { track: COLD_EMAIL_TRACK, tasks: COLD_EMAIL_TASKS },
    { track: CANVA_TRACK, tasks: CANVA_TASKS },
  ]

  for (const { track: trackData, tasks } of pairs) {
    let track = await Track.findOne({ slug: trackData.slug })

    if (!track) {
      track = await Track.create(trackData)
      tracksInserted++
    } else {
      skipped++
    }

    for (const taskData of tasks) {
      const exists = await Task.findOne({ track_id: track._id, day_number: taskData.day_number })
      if (exists) continue
      await Task.create({ ...taskData, track_id: track._id })
      tasksInserted++
    }
  }

  return NextResponse.json({
    success: true,
    tracks_inserted: tracksInserted,
    tasks_inserted: tasksInserted,
    tracks_skipped: skipped,
    message: `Seeded ${tracksInserted} tracks and ${tasksInserted} tasks. ${skipped} tracks already existed.`,
  })
}
