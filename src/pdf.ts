import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

/** Extract text from a PDF in the browser, rebuilding lines from item positions. */
export async function pdfToText(file: File): Promise<string> {
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const pages: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const content = await (await doc.getPage(p)).getTextContent()
    const lines = new Map<number, Array<{ x: number; s: string }>>()
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue
      const y = Math.round(item.transform[5] / 2) * 2
      if (!lines.has(y)) lines.set(y, [])
      lines.get(y)!.push({ x: item.transform[4], s: item.str })
    }
    pages.push([...lines.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) => items.sort((a, b) => a.x - b.x).map((i) => i.s).join(' ').replace(/\s+/g, ' '))
      .join('\n'))
  }
  return pages.join('\n\n')
}
