import { useRef, useState } from 'react'
import { analyze, type Report } from './engine/analyze'
import { SAMPLE_JD, SAMPLE_RESUME } from './samples'

function Ring({ value }: { value: number }) {
  const tone = value >= 75 ? 'good' : value >= 50 ? 'ok' : 'low'
  return (
    <div className={`ring ${tone}`} style={{ ['--v' as string]: value }}>
      <strong>{value}</strong><span>/ 100</span>
    </div>
  )
}

function Bar({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="bar">
      <div className="bar-head"><span>{label}</span><b>{value}%</b></div>
      <div className="track"><div style={{ width: `${value}%` }} /></div>
      <small>{hint}</small>
    </div>
  )
}

function toMarkdown(r: Report): string {
  const have = r.skills.filter((s) => s.inResume).map((s) => s.name).join(', ') || '—'
  const miss = r.skills.filter((s) => !s.inResume).map((s) => s.name).join(', ') || '—'
  return [`# ResumeFit report — ${r.score}/100`, '',
    `Skills ${r.parts.skills}% · Keywords ${r.parts.keywords}% · Resume quality ${r.parts.quality}%`, '',
    `**Matched skills:** ${have}`, `**Missing skills:** ${miss}`,
    `**Missing keywords:** ${r.missingKeywords.join(', ') || '—'}`, '', '## To do',
    ...r.suggestions.map((s) => `- ${s}`), '', '## Bullets to improve',
    ...r.tips.flatMap((t) => [`- "${t.bullet}"`, ...t.issues.map((i) => `  - ${i}`)]),
  ].join('\n')
}

export default function App() {
  const [jd, setJd] = useState('')
  const [cv, setCv] = useState('')
  const [report, setReport] = useState<Report | null>(null)
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState(false)
  const out = useRef<HTMLElement>(null)

  const run = (j = jd, c = cv) => {
    const r = analyze(j, c)
    setReport(r)
    requestAnimationFrame(() => out.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setStatus(`Reading ${f.name}…`)
    try {
      const text = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        ? await (await import('./pdf')).pdfToText(f)
        : await f.text()
      setCv(text)
      setStatus(text.trim() ? `Loaded ${f.name}. Check the text below, then analyse.` : 'No text found. Is it a scanned PDF? Paste the text instead.')
    } catch {
      setStatus('Could not read that file. Paste the text instead.')
    }
  }

  const groups: Array<[string, Report['skills']]> = []
  for (const s of report?.skills ?? []) {
    const g = groups.find(([c]) => c === s.category)
    if (g) g[1].push(s); else groups.push([s.category, [s]])
  }

  return (
    <div className="page">
      <header className="top">
        <div className="brand"><span className="logo">R<em>f</em></span>ResumeFit</div>
        <a href="https://github.com/anshraj6200/resumefit" target="_blank" rel="noopener">Source on GitHub</a>
      </header>

      <section className="hero">
        <h1>How well does your resume fit <span>this job</span>?</h1>
        <p>Paste a job description and your resume. ResumeFit finds the skills the job asks for, checks which ones your resume proves, and tells you exactly what to fix before you apply.</p>
        <p className="note">Runs entirely in your browser. Your resume is never uploaded anywhere.</p>
      </section>

      <form className="inputs" onSubmit={(e) => { e.preventDefault(); run() }}>
        <div className="field">
          <label htmlFor="jd">Job description</label>
          <textarea id="jd" value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job post, including requirements…" rows={14} />
        </div>
        <div className="field">
          <div className="label-row">
            <label htmlFor="cv">Your resume</label>
            <label className="upload">
              Upload PDF or .txt
              <input type="file" accept=".pdf,.txt,application/pdf,text/plain" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>
          <textarea id="cv" value={cv} onChange={(e) => setCv(e.target.value)} placeholder="Paste your resume text, or upload a PDF…" rows={14} />
          {status && <p className="status" role="status">{status}</p>}
        </div>
        <div className="buttons">
          <button type="button" className="link" onClick={() => { setJd(SAMPLE_JD); setCv(SAMPLE_RESUME); run(SAMPLE_JD, SAMPLE_RESUME) }}>Try with a sample</button>
          <button type="submit" className="go" disabled={!jd.trim() || !cv.trim()}>Analyse fit</button>
        </div>
      </form>

      {report && (
        <section className="report" ref={out} aria-live="polite">
          <div className="summary">
            <Ring value={report.score} />
            <div className="bars">
              <Bar label="Skills match" value={report.parts.skills} hint="Required skills count 1.5×, nice-to-have 0.6×" />
              <Bar label="Keyword similarity" value={report.parts.keywords} hint="TF-IDF cosine similarity of the two texts" />
              <Bar label="Resume quality" value={report.parts.quality} hint="Contact, sections, numbers, action verbs" />
            </div>
            <button className="copy" onClick={async () => { await navigator.clipboard.writeText(toMarkdown(report)); setCopied(true); setTimeout(() => setCopied(false), 1800) }}>
              {copied ? 'Copied' : 'Copy report'}
            </button>
          </div>

          {report.suggestions.length > 0 && (
            <div className="card todo">
              <h2>Fix these first</h2>
              <ol>{report.suggestions.map((s) => <li key={s}>{s}</li>)}</ol>
            </div>
          )}

          <div className="two">
            <div className="card">
              <h2>Skills the job asks for</h2>
              {report.skills.length === 0 && <p className="muted">No known skills found in the job description.</p>}
              {groups.map(([cat, list]) => (
                <div className="group" key={cat}>
                  <h3>{cat}</h3>
                  <ul className="chips">
                    {list.map((s) => (
                      <li key={s.name} className={s.inResume ? 'have' : 'miss'} title={`Importance ${s.weight.toFixed(2)}`}>
                        {s.inResume ? '✓' : '✗'} {s.name}{s.weight >= 1.5 ? <sup>req</sup> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="card">
              <h2>Resume checks</h2>
              <ul className="checks">
                {report.checks.map((c) => (
                  <li key={c.id} className={c.pass ? 'pass' : 'fail'}>
                    <span>{c.pass ? '✓' : '!'}</span>
                    <div><b>{c.label}</b><small>{c.detail}</small></div>
                  </li>
                ))}
              </ul>
              {report.missingKeywords.length > 0 && (
                <>
                  <h3 className="kw">Other words from the job post that your resume doesn’t use</h3>
                  <ul className="chips plain">{report.missingKeywords.map((k) => <li key={k}>{k}</li>)}</ul>
                </>
              )}
            </div>
          </div>

          {report.tips.length > 0 && (
            <div className="card">
              <h2>Bullets to make stronger</h2>
              <ul className="tips">
                {report.tips.map((t) => (
                  <li key={t.bullet}><q>{t.bullet}</q><ul>{t.issues.map((i) => <li key={i}>{i}</li>)}</ul></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="how">
        <h2>How the score works</h2>
        <div className="how-grid">
          <div><b>60% · Skills</b><p>A taxonomy of about 100 skills and their aliases (k8s → Kubernetes, sklearn → Scikit-learn) is matched against both texts. Skills under “requirements” weigh more than “nice to have”.</p></div>
          <div><b>25% · Keywords</b><p>Both texts become TF-IDF vectors of words and word pairs. Cosine similarity measures how close your wording is to the job post.</p></div>
          <div><b>15% · Quality</b><p>Eight checks recruiters care about: contact details, standard sections, length, quantified results, action verbs and no “I/my”.</p></div>
        </div>
      </section>

      <footer className="foot">Built by <a href="https://anshraj6200.github.io" target="_blank" rel="noopener">Ansh Raj</a> · React, TypeScript, pdf.js</footer>
    </div>
  )
}
