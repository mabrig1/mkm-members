import Anthropic from '@anthropic-ai/sdk'
import { AIGradingResult } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GradingInput {
  task_title: string
  task_description: string
  task_instructions: string
  submission_type: string
  grading_rubric: Record<string, number>
  user_submission: string
  skill_category: string
}

export async function gradeSubmission(input: GradingInput): Promise<AIGradingResult> {
  const rubricText = Object.entries(input.grading_rubric)
    .map(([criterion, points]) => `- ${criterion}: ${points} points`)
    .join('\n')

  const maxScore = Object.values(input.grading_rubric).reduce((a, b) => a + b, 0)

  const prompt = `You are an expert skill evaluator for SkillVest, a platform that trains Nigerian university students to earn income online through digital skills.

TASK BEING EVALUATED:
Title: ${input.task_title}
Category: ${input.skill_category}
Description: ${input.task_description}
Instructions given to student: ${input.task_instructions}

GRADING RUBRIC (Total: ${maxScore} points):
${rubricText}

STUDENT SUBMISSION:
${input.user_submission}

GRADING INSTRUCTIONS:
1. Score the submission against each criterion in the rubric
2. Be encouraging but honest — this student is learning to earn their first income
3. Focus feedback on actionable improvements they can implement immediately
4. Consider the Nigerian market context where relevant

Respond ONLY with a valid JSON object in this exact format:
{
  "criteria_scores": {
    "criterion_name": score_number
  },
  "total_score": number,
  "max_score": ${maxScore},
  "percentage": number,
  "passed": boolean,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "overall_feedback": "2-3 sentence encouraging but honest assessment"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  const result = JSON.parse(clean)

  return {
    ...result,
    passed: result.percentage >= 60,
  }
}

export async function getIncomeCoachResponse(
  userMessage: string,
  userContext: {
    role: string
    track?: string
    earnings: number
    streak: number
  }
): Promise<string> {
  const systemPrompt = `You are the SkillVest Income Coach — a direct, practical, motivating advisor for Nigerian university students learning to earn online.

USER CONTEXT:
- Level: ${userContext.role}
- Current track: ${userContext.track || 'not enrolled yet'}
- Total earnings: ₦${userContext.earnings.toLocaleString()}
- Current streak: ${userContext.streak} days

YOUR PERSONALITY:
- Direct and practical — no fluff
- Deeply familiar with Nigerian market realities (Fiverr, Upwork, WhatsApp marketing, Paystack, etc.)
- Motivating but honest — celebrate progress, don't sugarcoat problems
- Use Nigerian context in examples (Lagos clients, Abuja SMEs, UNILAG students, etc.)
- Keep responses under 200 words unless a detailed template is requested
- When asked for templates (pitch emails, proposals, WhatsApp messages), provide complete, ready-to-use copies`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function generateGigMatchScore(
  userProfile: {
    avg_score: number
    level: string
    streak: number
    completed_gigs: number
    category_scores: Record<string, number>
  },
  gigRequirements: {
    category: string
    min_level: string
    min_score: number
    deadline_hours: number
    budget: number
  }
): Promise<{ match_score: number; recommendation: string }> {
  const levelOrder = ['novice', 'apprentice', 'pro', 'mentor']
  const userLevelIdx = levelOrder.indexOf(userProfile.level)
  const reqLevelIdx = levelOrder.indexOf(gigRequirements.min_level)

  if (userLevelIdx < reqLevelIdx) {
    return { match_score: 0, recommendation: 'Level requirement not met' }
  }

  const categoryScore = userProfile.category_scores[gigRequirements.category] || 0
  const matchScore = Math.round(
    categoryScore * 0.4 +
      userProfile.avg_score * 0.3 +
      Math.min(userProfile.streak * 2, 20) * 0.15 +
      Math.min(userProfile.completed_gigs * 5, 15) * 0.15
  )

  return {
    match_score: Math.min(matchScore, 100),
    recommendation:
      matchScore >= 70
        ? 'Strong match — apply now'
        : matchScore >= 50
          ? 'Good fit — strengthen your pitch'
          : 'Borderline — complete more tasks first',
  }
}
