// Small text utilities: tokenising, TF-IDF and cosine similarity.
export const STOPWORDS = new Set(`a about above after again all also am an and any are as at be because been before being below between both but by can could did do does doing down during each etc few for from further had has have having he her here hers him his how i if in into is it its itself just know like ll me more most my no nor not now of off on once only or other our ours out over own per plus re same she should so some such than that the their theirs them then there these they this those through to too under until up us use used using very via was we well were what when where which while who whom why will with within would you your yours
ability able across work working works role team teams strong good great excellent experience experienced years year required requirements preferred plus must nice candidate candidates looking join responsibilities responsible including include includes etc knowledge understanding skills skill familiarity familiar new related relevant based day help ensure company opportunity software engineer engineers engineering intern interns internship full stack fullstack about build building built features thousands millions small large businesses business product products platform platforms users customers world fast growing startup mission office hybrid remote apply salary benefits position`.split(/\s+/))

export function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.]*[a-z0-9+#]|[a-z]/g) ?? []).filter((w) => !STOPWORDS.has(w) && w.length > 1)
}

export function terms(text: string): string[] {
  const w = words(text)
  const out = [...w]
  for (let i = 0; i + 1 < w.length; i++) out.push(`${w[i]} ${w[i + 1]}`)
  return out
}

export function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|\n+|•|·|;/).map((s) => s.trim()).filter((s) => s.length > 2)
}

/** IDF computed over the sentences of both documents (smooth, like scikit-learn). */
export function idfFrom(docs: string[][]): Map<string, number> {
  const df = new Map<string, number>()
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1)
  const n = docs.length
  const idf = new Map<string, number>()
  for (const [t, c] of df) idf.set(t, Math.log((1 + n) / (1 + c)) + 1)
  return idf
}

export function tfidf(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = new Map<string, number>()
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
  const v = new Map<string, number>()
  for (const [t, c] of tf) v.set(t, (1 + Math.log(c)) * (idf.get(t) ?? 1))
  return v
}

export function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0
  for (const [, x] of a) na += x * x
  for (const [t, y] of b) { nb += y * y; const x = a.get(t); if (x) dot += x * y }
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}
