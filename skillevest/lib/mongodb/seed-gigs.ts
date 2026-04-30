import { connectDB } from './connection'
import Gig from './models/Gig'
import Profile from './models/Profile'
import bcrypt from 'bcryptjs'

const SEED_GIGS = [
  {
    title: 'Write 10 Instagram captions for a Lagos beauty brand',
    description:
      'A Lagos-based beauty brand selling skincare and makeup needs engaging Instagram captions for their product posts. We target Nigerian women aged 18–35 who love affordable glam.',
    category: 'copywriting',
    budget_naira: 3500,
    platform_fee_naira: 350,
    deadline_hours: 48,
    requirements:
      '- Strong command of English and Nigerian slangs (slay, lit, etc.)\n- Must understand beauty/skincare vocabulary\n- Samples of past social media copy preferred',
    deliverables:
      '- 10 unique captions (100–150 words each)\n- Each with 3–5 hashtag suggestions\n- Delivered in a Google Doc',
    min_level: 'novice',
    min_score: 60,
    escrow_held: true,
  },
  {
    title: 'Design 5 social media flyers for an Abuja restaurant',
    description:
      'We are a fast-casual restaurant in Abuja (Wuse 2) launching weekly specials. We need 5 eye-catching Canva flyers for Instagram and WhatsApp promotion. Bold, colourful, with our brand colours (red + gold).',
    category: 'design',
    budget_naira: 5000,
    platform_fee_naira: 500,
    deadline_hours: 72,
    requirements:
      '- Must have Canva Pro or Canva free (advanced skills)\n- Portfolio of at least 3 previous flyer designs\n- Available for 1 revision round',
    deliverables:
      '- 5 flyers in 1080x1080px (Instagram square format)\n- Editable Canva links\n- PNG exports for WhatsApp',
    min_level: 'novice',
    min_score: 65,
    escrow_held: true,
  },
  {
    title: 'Write 3 WhatsApp broadcast messages for a fashion store',
    description:
      'Our Kano-based online fashion store runs weekly promos via WhatsApp. We need 3 broadcast messages that drive clicks and purchases. Short, punchy, with urgency.',
    category: 'copywriting',
    budget_naira: 2000,
    platform_fee_naira: 200,
    deadline_hours: 24,
    requirements:
      '- Understand Nigerian WhatsApp marketing style\n- Each message must be under 200 words\n- Must include emoji and a clear CTA',
    deliverables:
      '- 3 broadcast message drafts in a Google Doc\n- Optional: Subject line / opening hook variants',
    min_level: 'novice',
    min_score: 60,
    escrow_held: true,
  },
  {
    title: 'Data entry: transcribe 50 customer records into Google Sheets',
    description:
      'We have 50 scanned customer registration forms from our Lagos store that need to be entered into a Google Sheet template (name, phone, email, purchase date, amount). Accuracy is critical.',
    category: 'data_entry',
    budget_naira: 4000,
    platform_fee_naira: 400,
    deadline_hours: 36,
    requirements:
      '- Attention to detail — zero errors tolerated\n- Fast typing (minimum 40 WPM)\n- Google Sheets familiarity\n- Must sign a simple NDA for customer data',
    deliverables:
      '- Completed Google Sheet with all 50 records\n- Accuracy report (any ambiguous entries flagged)',
    min_level: 'novice',
    min_score: 60,
    escrow_held: true,
  },
  {
    title: 'Write product descriptions for 20 items on a clothing website',
    description:
      'We are launching an e-commerce clothing brand targeting young professionals in Lagos and Abuja. Need compelling product descriptions (SEO-friendly) for 20 clothing items — shirts, dresses, trousers.',
    category: 'copywriting',
    budget_naira: 6000,
    platform_fee_naira: 600,
    deadline_hours: 96,
    requirements:
      '- SEO knowledge (basic keyword integration)\n- Fashion writing experience preferred\n- Each description: 80–120 words\n- Warm, aspirational tone that resonates with young Nigerians',
    deliverables:
      '- 20 product descriptions in a Google Doc\n- SEO title + meta description for each item (bonus)',
    min_level: 'apprentice',
    min_score: 70,
    escrow_held: true,
  },
  {
    title: 'Create a social media content calendar for a tech startup',
    description:
      'A Lagos-based fintech startup needs a 30-day content calendar covering Twitter/X, LinkedIn, and Instagram. We want to build thought leadership and attract talent. Topics: product updates, team culture, fintech trends, Nigerian market insights.',
    category: 'social_media',
    budget_naira: 8500,
    platform_fee_naira: 850,
    deadline_hours: 120,
    requirements:
      '- Experience with B2B social media strategy\n- Understanding of Nigerian fintech landscape\n- Must include content themes, post formats, and posting times\n- Familiarity with Notion or Google Sheets for calendar',
    deliverables:
      '- 30-day content calendar in Notion/Google Sheets\n- 5 sample posts (fully written)\n- Platform-specific recommendations\n- Hashtag strategy document',
    min_level: 'apprentice',
    min_score: 70,
    escrow_held: true,
  },
]

export async function seedGigs(): Promise<void> {
  await connectDB()

  // Find or create a platform client profile
  let platformClient = await Profile.findOne({ email: 'clients@skillvest.ng' }).lean()
  if (!platformClient) {
    const hash = await bcrypt.hash('SkillVest@2025!', 10)
    platformClient = await Profile.create({
      full_name: 'SkillVest Clients',
      email: 'clients@skillvest.ng',
      role: 'admin',
      password_hash: hash,
      onboarding_completed: true,
    })
  }

  let inserted = 0
  let skipped = 0

  for (const gig of SEED_GIGS) {
    const exists = await Gig.findOne({ title: gig.title }).lean()
    if (exists) { skipped++; continue }

    await Gig.create({
      ...gig,
      client_id: platformClient._id,
      status: 'open',
    })
    inserted++
  }

  console.log(`Seed complete: ${inserted} gigs inserted, ${skipped} skipped (already exist)`)
}
