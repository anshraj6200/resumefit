import { extractSkills, resumeSkills, SKILL_BY_NAME, type Category } from './skills'
import { cosine, idfFrom, sentences, terms, tfidf, words } from './text'
import { bulletTips, qualityChecks, type BulletTip, type Check } from './checks'

export interface SkillHit { name: string; category: Category; weight: number; inResume: boolean }

export interface Report {
  score: number
  parts: { skills: number; keywords: number; quality: number }
  skills: SkillHit[]
  missingKeywords: string[]
  checks: Check[]
  tips: BulletTip[]
  suggestions: string[]
}

const REQUIRED = /\b(must|required|requirements?|minimum|qualifications?|you have|you will need|need to have|mandatory|proficien)/i
const OPTIONAL = /\b(nice to have|preferred|bonus|plus|good to have|desirable|optional)\b/i

/** How important each skill is in the job description: required lines count more, "nice to have" less. */
export function weightedJdSkills(jd: string): Map<string, number> {
  const weights = new Map<string, number>()
  let mode: 'req' | 'opt' | 'none' = 'none'
  for (const line of jd.split(/\n+/)) {
    if (OPTIONAL.test(line)) mode = 'opt'
    else if (REQUIRED.test(line)) mode = 'req'
    const factor = mode === 'req' ? 1.5 : mode === 'opt' ? 0.6 : 1
    for (const [name, count] of extractSkills(line)) {
      const w = factor * (1 + 0.25 * Math.min(count - 1, 2))
      weights.set(name, Math.max(weights.get(name) ?? 0, w) + (weights.has(name) ? 0.25 : 0))
    }
  }
  return weights
}

function suggest(s: SkillHit): string {
  if (s.category === 'CS fundamentals') return `${s.name} is asked for. Mention relevant coursework, competitive programming, or a project where you used it.`
  if (s.category === 'Soft skills') return `${s.name} is asked for. Show it with a bullet about a team project, a presentation or something you led.`
  return `${s.name} is missing. If you have used it, name it in a project or experience bullet, not only in Skills: e.g. "Built … with ${s.name}".`
}

export function analyze(jd: string, resume: string): Report {
  const jdSkills = weightedJdSkills(jd)
  const cvSkills = resumeSkills(resume)

  const skills: SkillHit[] = [...jdSkills].map(([name, weight]) => ({
    name, weight, category: SKILL_BY_NAME.get(name)!.category, inResume: cvSkills.has(name),
  })).sort((a, b) => b.weight - a.weight)
  const total = skills.reduce((s, k) => s + k.weight, 0)
  const skillScore = total ? skills.filter((k) => k.inResume).reduce((s, k) => s + k.weight, 0) / total : 0

  // Keyword overlap beyond the taxonomy: TF-IDF over the sentences of both texts.
  const jdSents = sentences(jd).map(terms)
  const cvSents = sentences(resume).map(terms)
  const idf = idfFrom([...jdSents, ...cvSents])
  const jdVec = tfidf(terms(jd), idf)
  const cvVec = tfidf(terms(resume), idf)
  const sim = cosine(jdVec, cvVec)
  const keywordScore = Math.min(1, sim / 0.45) // ~0.45 cosine is already a very close match

  const cvWords = new Set(words(resume))
  const known = new Set(skills.map((s) => s.name.toLowerCase()))
  const missingKeywords = [...jdVec]
    .filter(([t]) => !t.includes(' ') && t.length > 3 && !cvWords.has(t) && !known.has(t) && !/^\d/.test(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([t]) => t)

  const checks = qualityChecks(resume)
  const qualityScore = checks.filter((c) => c.pass).length / checks.length

  const score = Math.round(100 * (0.6 * skillScore + 0.25 * keywordScore + 0.15 * qualityScore))

  const missing = skills.filter((s) => !s.inResume)
  const suggestions = [
    ...missing.slice(0, 4).map((s) => suggest(s)),
    ...checks.filter((c) => !c.pass).slice(0, 3).map((c) => `${c.label}: ${c.detail}`),
  ]

  return {
    score,
    parts: { skills: Math.round(skillScore * 100), keywords: Math.round(keywordScore * 100), quality: Math.round(qualityScore * 100) },
    skills, missingKeywords, checks, tips: bulletTips(resume), suggestions,
  }
}
