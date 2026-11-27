import { describe, expect, it } from 'vitest'
import { extractSkills } from '../skills'
import { analyze, weightedJdSkills } from '../analyze'
import { cosine, idfFrom, tfidf, terms } from '../text'
import { bulletTips, qualityChecks } from '../checks'

const names = (t: string) => [...extractSkills(t).keys()].sort()

describe('skill extraction', () => {
  it('does not confuse Java with JavaScript', () => {
    expect(names('Strong JavaScript skills')).toEqual(['JavaScript'])
    expect(names('Java and JavaScript')).toEqual(['Java', 'JavaScript'])
  })
  it('counts React Native without also counting React', () => {
    expect(names('Built apps in React Native')).toEqual(['React Native'])
  })
  it('handles C, C++ and C# separately', () => {
    expect(names('Languages: C, C++, C#')).toEqual(['C', 'C#', 'C++'])
    expect(names('Grade C in physics')).toEqual([])
  })
  it('only treats Go as a language in a language context', () => {
    expect(names('Experience with Go, Python')).toEqual(['Go', 'Python'])
    expect(names('Ready to go the extra mile')).toEqual([])
  })
  it('matches aliases', () => {
    expect(names('Used sklearn, k8s and postgres')).toEqual(['Kubernetes', 'PostgreSQL', 'Scikit-learn'])
    expect(names('Node.js REST API with JWT')).toEqual(['Authentication', 'Node.js', 'REST APIs'])
  })
  it('does not read "the rest of the team" as REST APIs', () => {
    expect(names('worked with the rest of the team')).not.toContain('REST APIs')
  })
})

describe('job description weighting', () => {
  it('weights required skills above nice-to-have ones', () => {
    const w = weightedJdSkills('Requirements:\n- Python and SQL\nNice to have:\n- Docker')
    expect(w.get('Python')!).toBeGreaterThan(w.get('Docker')!)
  })
})

describe('similarity', () => {
  it('scores identical text 1 and unrelated text 0', () => {
    const a = terms('react typescript frontend'); const b = terms('cooking recipes kitchen')
    const idf = idfFrom([a, b])
    expect(cosine(tfidf(a, idf), tfidf(a, idf))).toBeCloseTo(1)
    expect(cosine(tfidf(a, idf), tfidf(b, idf))).toBe(0)
  })
})

describe('resume checks', () => {
  it('flags weak bullets and missing numbers', () => {
    const tips = bulletTips('- Responsible for maintaining the internal dashboard for the sales team\n- Built a REST API serving 2,000 daily users')
    expect(tips).toHaveLength(1)
    expect(tips[0].issues.join(' ')).toMatch(/responsible for/i)
  })
  it('finds contact details', () => {
    const c = qualityChecks('Ansh Raj ansh@example.com +91 98765 43210 github.com/ansh')
    expect(c.find((x) => x.id === 'email')!.pass).toBe(true)
    expect(c.find((x) => x.id === 'links')!.pass).toBe(true)
  })
})

describe('analyze', () => {
  const jd = 'Requirements:\n- React and TypeScript\n- REST APIs and Node.js\n- Git\nNice to have: Docker'
  it('scores higher when the resume covers more required skills', () => {
    const weak = analyze(jd, 'Skills: Python. Projects: built a calculator.')
    const strong = analyze(jd, 'Built a React and TypeScript app on a Node.js REST API, deployed with Docker; code on Git.')
    expect(strong.score).toBeGreaterThan(weak.score)
    expect(strong.parts.skills).toBe(100)
  })
  it('lists what is missing', () => {
    const r = analyze(jd, 'Built a React app')
    expect(r.skills.filter((s) => !s.inResume).map((s) => s.name)).toEqual(expect.arrayContaining(['TypeScript', 'Node.js', 'REST APIs']))
  })
  it('handles empty input without crashing', () => {
    expect(analyze('', '').score).toBeGreaterThanOrEqual(0)
  })
})

describe('implied skills', () => {
  it('counts MySQL as SQL and Next.js as React', () => {
    const r = analyze('Requirements: SQL and React', 'Built a Next.js app backed by MySQL')
    expect(r.parts.skills).toBe(100)
  })
})
