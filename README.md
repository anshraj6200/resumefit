# ResumeFit

**Paste a job description and your resume, and see how well they match and what to fix before you apply.**

**Live demo:** https://anshraj6200.github.io/resumefit/

Most companies screen resumes with an ATS (applicant tracking system) and a recruiter who reads for a few seconds. Students often send one resume everywhere and never learn why they get no replies. ResumeFit shows, for a specific job:

- which **required skills** your resume proves and which it is missing
- how close your **wording** is to the job post, and which important words you never use
- **resume quality** problems a recruiter notices: missing contact details, missing sections, no numbers, weak bullet openings like "Responsible for…"
- a short **to-do list**, plus a report you can copy

Everything runs in the browser, **including PDF parsing**, so a resume (with phone number and address) is never uploaded.

## How the score works

| Part | Weight | Method |
|---|---|---|
| Skills | 60% | A taxonomy of 97 skills with aliases (k8s → Kubernetes, sklearn → Scikit-learn) is matched in both texts. Skills listed under "Requirements" count 1.5×, "Nice to have" 0.6×. Tools imply the general skill (MySQL → SQL, Next.js → React). |
| Keywords | 25% | Both texts become TF-IDF vectors of words and word pairs (IDF computed over the sentences of both documents). Cosine similarity measures how close the wording is. The highest-weighted job-post words missing from the resume are listed. |
| Quality | 15% | Eight rule-based checks: email, phone, links, standard sections, length, quantified bullets, action verbs, no first-person pronouns. |

### Tricky matching cases (all covered by tests)

- **Java vs JavaScript**: word-boundary matching, longest alias first
- **React Native vs React**: a matched span is "consumed" so it cannot also match a shorter skill
- **C / C++ / C#**: kept separate, and "Grade C" is not read as the C language
- **Go**: counted only in a programming context, so "go the extra mile" is ignored
- **"the rest of the team"** is not read as REST APIs

## Tech stack

React 19 · TypeScript · Vite · pdf.js (lazy-loaded with a Web Worker) · Vitest · GitHub Actions · GitHub Pages

## Run it locally

```bash
npm install
npm run dev     # http://localhost:5173/resumefit/
npm test
npm run build
```

## Project structure

```
src/engine/skills.ts    skill taxonomy, alias matching, implied skills
src/engine/text.ts      tokeniser, TF-IDF, cosine similarity
src/engine/checks.ts    resume quality checks and bullet tips
src/engine/analyze.ts   weighting, scoring, suggestions
src/pdf.ts              in-browser PDF → text (pdf.js)
src/App.tsx             UI
.github/workflows/      test → build → deploy on every push to main
```

## Limitations and ideas

- The taxonomy is hand-curated and focused on software and data roles.
- Scanned (image-only) PDFs have no text layer. OCR with Tesseract.js would fix that.
- Next ideas: section-aware parsing, a bullet rewriter, and support for .docx uploads.

---
Built by [Ansh Raj](https://anshraj6200.github.io) · MIT License
