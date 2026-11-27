// Resume quality checks a recruiter or ATS would notice.
export interface Check {
  id: string
  label: string
  pass: boolean
  detail: string
}

export interface BulletTip {
  bullet: string
  issues: string[]
}

const WEAK = [
  [/^(responsible for|in charge of)\b/i, 'Starts with "responsible for". Lead with what you did, e.g. "Built…" or "Led…".'],
  [/^(worked on|working on|involved in|helped( to)?|assisted( in)?|participated in)\b/i, 'Starts with a weak verb. Say what you built, improved or decided.'],
  [/^(i|my)\b/i, 'Drop "I/my". Resume bullets start with a verb.'],
] as const

const ACTION = /^(built|developed|designed|created|implemented|led|launched|improved|reduced|increased|optimi[sz]ed|automated|migrated|deployed|analy[sz]ed|trained|wrote|shipped|integrated|refactored|scaled|architected|delivered|engineered|cut|raised|owned|drove|established|introduced|streamlined|resolved|presented|researched|tested|maintained|added|made|set up)\b/i

export function bullets(resume: string): string[] {
  return resume
    .split(/\n|•|●|▪|◦|(?<=\.)\s+(?=[A-Z])/)
    .map((l) => l.replace(/^[\s\-–*>]+/, '').trim())
    .filter((l) => l.split(/\s+/).length >= 6 && l.split(/\s+/).length <= 60)
}

export function bulletTips(resume: string): BulletTip[] {
  const tips: BulletTip[] = []
  for (const b of bullets(resume)) {
    const issues: string[] = []
    for (const [re, msg] of WEAK) if (re.test(b)) issues.push(msg)
    if (!/\d|%|x\b/.test(b) && (ACTION.test(b) || issues.length)) issues.push('No number. Add scale or impact if you can (users, %, time saved, data size).')
    if (b.split(/\s+/).length > 35) issues.push('Long bullet. Aim for one or two lines.')
    if (issues.length) tips.push({ bullet: b, issues })
  }
  return tips.slice(0, 8)
}

export function qualityChecks(resume: string): Check[] {
  const r = resume
  const wc = r.split(/\s+/).filter(Boolean).length
  const bs = bullets(r)
  const withNum = bs.filter((b) => /\d/.test(b)).length
  const actionStart = bs.filter((b) => ACTION.test(b)).length
  const has = (re: RegExp) => re.test(r)
  return [
    { id: 'email', label: 'Email address', pass: has(/[\w.+-]+@[\w-]+\.[\w.]+/), detail: 'Recruiters need a way to reach you.' },
    { id: 'phone', label: 'Phone number', pass: has(/(\+?\d[\d\s-]{8,}\d)/), detail: 'Include a phone number with country code.' },
    { id: 'links', label: 'GitHub / LinkedIn / portfolio link', pass: has(/github\.com|linkedin\.com|\.github\.io|https?:\/\//i), detail: 'For software roles, a GitHub or live project link is strong proof.' },
    { id: 'sections', label: 'Standard sections', pass: ['experience|internship|work', 'education', 'skills', 'project'].every((s) => new RegExp(s, 'i').test(r)), detail: 'ATS parsers look for Experience, Education, Skills and Projects headings.' },
    { id: 'length', label: 'Length', pass: wc >= 250 && wc <= 900, detail: `${wc} words. 350–700 fits one page for students and early-career roles.` },
    { id: 'numbers', label: 'Quantified results', pass: bs.length > 0 && withNum / bs.length >= 0.3, detail: `${withNum} of ${bs.length} bullets have a number. Aim for at least a third.` },
    { id: 'verbs', label: 'Bullets start with action verbs', pass: bs.length > 0 && actionStart / bs.length >= 0.5, detail: `${actionStart} of ${bs.length} bullets start with a strong verb.` },
    { id: 'pronouns', label: 'No first-person pronouns', pass: !/(^|\n|•)\s*(i|my)\s/i.test(r), detail: 'Write "Built X", not "I built X".' },
  ]
}
