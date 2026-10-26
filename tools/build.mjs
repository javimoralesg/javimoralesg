// Draws the README images (../assets/*.svg) with the visual identity of
// javimoralesg.com: its tokens, its three typefaces and its gold rules.
// Everything is plain SVG with subset fonts inlined, because GitHub only
// shows README images.
//
// Each image carries both themes: its colours are CSS variables that switch
// with prefers-color-scheme, which in an <img> follows the page's theme. Where
// a browser keeps images light (Safari), the white background keeps them legible.
//
//   npm install && npm run build
//
// It needs Google Chrome (to measure text) and the portfolio
// next to this repo, or its path in PORTFOLIO_DIR.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import subsetFont from 'subset-font'
import { intro, now, badges, work, toolbox, activity, closing } from './content.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const portfolio = path.resolve(process.env.PORTFOLIO_DIR || path.join(here, '../../MyServer/homePage/portfolio'))
const outDir = path.join(here, '../assets')
const W = 880

// [light, dark]: the tokens of html.portfolio-preview (src/portfolio/preview.css);
// the band takes the navy of the portfolio's lanyard card.
const tokens = {
  page: ['#ffffff', 'transparent'],
  elevated: ['#eeefe9', '#1f2d3c'],
  brand: ['#203d66', '#92b7e4'],
  brandBorder: ['#203d6630', '#92b7e440'],
  text: ['#162b46', '#edf0ee'],
  text2: ['#536173', '#b5c0cd'],
  accent: ['#c19350', '#d6b27b'],
  border: ['#dce0dc', '#31404e'],
  award: ['#805519', '#e8c58b'],
  inverse: ['#ffffff', '#080c14'],
  mark: ['#d6b27b', '#6b4a16'],
  bandA: ['#162b46', '#15263b'],
  bandB: ['#203d66', '#1f3a5e'],
  bandC: ['#2f5689', '#2c4e7a'],
  bandInk: ['#faf9f3', '#faf9f3'],
  bandMuted: ['#dce5f0', '#c9d7e8'],
  bandAccent: ['#a7c8ef', '#a7c8ef'],
}
const t = Object.fromEntries(Object.keys(tokens).map(key => [key, `var(--${key})`]))
const palette = theme => `:root{${Object.entries(tokens).map(([key, pair]) => `--${key}:${pair[theme]}`).join(';')}}`
const themeCss = `${palette(0)}@media (prefers-color-scheme:dark){${palette(1)}}`

const faces = {
  sans: { family: 'Inter', style: 'normal', file: 'inter-normal-latin.woff2', fallback: 'Helvetica, Arial, sans-serif' },
  serif: { family: 'Playfair Display', style: 'normal', file: 'playfair-display-normal-latin.woff2', fallback: 'Georgia, serif' },
  serifItalic: { family: 'Playfair Display', style: 'italic', file: 'playfair-display-italic-latin.woff2', fallback: 'Georgia, serif' },
  mono: { family: 'JetBrains Mono', style: 'normal', file: 'jetbrains-mono-normal-latin.woff2', fallback: 'Menlo, monospace' },
}
for (const face of Object.values(faces)) face.data = await fs.readFile(path.join(portfolio, 'public/fonts', face.file))

// Lucide icons, the set the portfolio uses.
const lucide = {
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  trophy: '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
}
const icon = (name, x, y, size, color, width = 2) =>
  `<g transform="translate(${n(x)} ${n(y)}) scale(${n(size / 24, 4)})" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${lucide[name]}</g>`

const n = (value, digits = 2) => String(+value.toFixed(digits))
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const rule = (x1, y, x2, color = t.border) => `<line x1="${n(x1)}" y1="${n(y + .5)}" x2="${n(x2)}" y2="${n(y + .5)}" stroke="${color}"/>`

// ── Browser: measures text with the real fonts ──
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.setContent(`<style>${Object.values(faces).map(face => fontFace(face, face.data)).join('')}</style><canvas></canvas>`)
await page.evaluate(() => Promise.all([...document.fonts].map(font => font.load())))

function fontFace(face, data) {
  return `@font-face{font-family:'${face.family}';font-style:${face.style};font-weight:100 900;src:url(data:font/woff2;base64,${data.toString('base64')}) format('woff2')}`
}

const widths = new Map()
async function measure(text, f) {
  const key = JSON.stringify([text, f])
  if (!widths.has(key)) {
    const face = faces[f.face]
    widths.set(key, await page.evaluate(([text, font, spacing]) => {
      const ctx = document.querySelector('canvas').getContext('2d')
      ctx.font = font
      ctx.letterSpacing = `${spacing}px`
      return ctx.measureText(text).width
    }, [text, `${face.style} ${f.weight} ${f.size}px "${face.family}"`, f.ls || 0]))
  }
  return widths.get(key)
}

async function wrap(text, f, max) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && await measure(next, f) > max) { lines.push(line); line = word } else line = next
  }
  return [...lines, line]
}

// ── SVG document ──
class Drawing {
  constructor() {
    this.parts = []
    this.defs = []
    this.chars = Object.fromEntries(Object.keys(faces).map(key => [key, new Set(' ')]))
    this.count = 0
  }
  id(prefix) { return `${prefix}${++this.count}` }
  add(...parts) { this.parts.push(...parts) }
  text(x, y, value, f, fill, extra = '') {
    for (const char of value) this.chars[f.face].add(char)
    const face = faces[f.face]
    const spacing = f.ls ? ` letter-spacing="${n(f.ls, 3)}"` : ''
    return `<text x="${n(x)}" y="${n(y)}" font-family="'${face.family}', ${face.fallback}" font-size="${f.size}" font-weight="${f.weight}"${face.style === 'italic' ? ' font-style="italic"' : ''}${spacing} fill="${fill}"${extra}>${esc(value)}</text>`
  }
  async svg(w, h, title) {
    const fonts = []
    for (const [key, chars] of Object.entries(this.chars)) {
      if (chars.size < 2) continue
      fonts.push(fontFace(faces[key], await subsetFont(faces[key].data, [...chars].join(''), { targetFormat: 'woff2' })))
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(w)}" height="${n(h)}" viewBox="0 0 ${n(w)} ${n(h)}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>${themeCss}${fonts.join('')}</style><defs>${this.defs.join('')}</defs><rect width="100%" height="100%" fill="${t.page}"/>${this.parts.join('')}</svg>`
  }
}

// The portfolio's type: mono labels, serif titles, sans text.
const type = {
  label: { face: 'mono', size: 11.5, weight: 500, ls: 1.1 },
  name: { face: 'serif', size: 54, weight: 500, ls: -2.2 },
  nameItalic: { face: 'serifItalic', size: 54, weight: 500, ls: -2.2 },
  subtitle: { face: 'mono', size: 12.5, weight: 500, ls: 2.2 },
  typing: { face: 'mono', size: 19, weight: 500 },
  badge: { face: 'mono', size: 12, weight: 600, ls: 1.3 },
  fact: { face: 'sans', size: 16, weight: 600, ls: -.2 },
  link: { face: 'mono', size: 13, weight: 500, ls: 1.3 },
  section: { face: 'serif', size: 40, weight: 500, ls: -1.6 },
  index: { face: 'mono', size: 12, weight: 500 },
  rowTitle: { face: 'serif', size: 30, weight: 500, ls: -.9 },
  body: { face: 'sans', size: 16, weight: 400 },
  tags: { face: 'mono', size: 12.5, weight: 500 },
  item: { face: 'sans', size: 15.5, weight: 400 },
  closing: { face: 'serif', size: 34, weight: 500, ls: -1.2 },
  wordmark: { face: 'serif', size: 26, weight: 600, ls: -.6 },
}

const outputs = []
const save = (name, svg) => outputs.push([`${name}.svg`, svg])

// ── Banner: the name on a navy band whose lower edge waves ──
async function drawBanner() {
  const d = new Drawing()
  const H = 214
  // Waves one length wider than the banner, so sliding them by a length loops.
  const wave = (base, amplitude, length, phase = 0) => {
    const points = []
    for (let x = 0; x <= W + length; x += 8) points.push([x, base + amplitude * Math.sin(x / length * Math.PI * 2 + phase)])
    return points
  }
  const fill = points => `M0 0H${points.at(-1)[0]}V${n(points.at(-1)[1])}${points.slice().reverse().map(([x, y]) => `L${x} ${n(y)}`).join('')}Z`
  const slide = (length, seconds) => `<animateTransform attributeName="transform" type="translate" from="0 0" to="${-length} 0" dur="${seconds}s" repeatCount="indefinite"/>`
  const back = wave(H - 24, 11, 440, 1.2)
  const front = wave(H - 40, 9, 520)
  // The gradient stays still: only the mask that cuts its edge moves.
  const gradient = d.id('band')
  const mask = d.id('edge')
  d.defs.push(`<linearGradient id="${gradient}" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="${t.bandA}"/><stop offset=".55" stop-color="${t.bandB}"/><stop offset="1" stop-color="${t.bandC}"/></linearGradient>`,
    `<mask id="${mask}"><g>${slide(520, 16)}<path d="${fill(front)}" fill="#fff"/></g></mask>`)
  d.add(`<g opacity=".5">${slide(440, 11)}<path d="${fill(back)}" fill="${t.bandC}"/></g>`,
    `<rect width="${W}" height="${H}" fill="url(#${gradient})" mask="url(#${mask})"/>`,
    `<g>${slide(520, 16)}<polyline points="${front.map(([x, y]) => `${x},${n(y)}`).join(' ')}" fill="none" stroke="${t.accent}" stroke-opacity=".85" stroke-width="1.3"/></g>`)

  // The portfolio's network of dots, faint on the navy.
  let seed = 11
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const dots = Array.from({ length: 30 }, () => [random() * W, 8 + random() * (H - 80), .8 + random() * 1.5])
  for (const [i, [ax, ay]] of dots.entries()) {
    for (const [bx, by] of dots.slice(i + 1)) {
      if (Math.hypot(ax - bx, ay - by) < 95) d.add(`<line x1="${n(ax)}" y1="${n(ay)}" x2="${n(bx)}" y2="${n(by)}" stroke="#faf9f3" stroke-opacity=".07"/>`)
    }
  }
  for (const [x, y, r] of dots) d.add(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="#faf9f3" fill-opacity=".18"/>`)

  const firstW = await measure(`${intro.first} `, type.name)
  const lastW = await measure(intro.last, type.nameItalic)
  const x = (W - firstW - lastW) / 2
  d.add(`<g><animate attributeName="opacity" values="0;1" dur="1.2s"/>${d.text(x, 92, intro.first, type.name, t.bandInk)}${d.text(x + firstW, 92, intro.last, type.nameItalic, t.bandAccent)}`,
    `<line x1="${W / 2 - 32}" y1="117" x2="${W / 2 + 32}" y2="117" stroke="${t.accent}" stroke-width="2"/>`,
    `${d.text(W / 2, 146, intro.subtitle.toUpperCase(), type.subtitle, t.bandMuted, ' text-anchor="middle"')}</g>`)
  save('banner', await d.svg(W, H, `Javier Morales Galisteo. ${intro.subtitle}`))
}

// ── A centred line that types itself, one role after another ──
async function drawTyping() {
  const d = new Drawing()
  const y = 29
  const timeline = []
  const roles = []
  let clock = .4
  for (const role of intro.roles) {
    const steps = [0]
    for (let i = 1; i <= role.length; i++) steps.push(await measure(role.slice(0, i), type.typing))
    const x = (W - steps.at(-1)) / 2
    const events = []
    steps.slice(1).forEach((w, i) => events.push([clock + i * .045, w]))
    clock += role.length * .045 + 1.8
    steps.slice(0, -1).reverse().forEach((w, i) => events.push([clock + i * .025, w]))
    clock += role.length * .025 + .3
    roles.push({ role, x, width: steps.at(-1), events })
    timeline.push(...events.map(([at, w]) => [at, x + w + 2]))
  }
  const total = clock
  const discrete = (events, first) => {
    const times = [0, ...events.map(([at]) => at / total)]
    const values = [first, ...events.map(([, v]) => v)]
    return `values="${values.map(v => n(v)).join(';')}" keyTimes="${times.map(v => n(v, 5)).join(';')}" dur="${n(total)}s" calcMode="discrete" repeatCount="indefinite"`
  }
  for (const [i, { role, x, width, events }] of roles.entries()) {
    const clip = d.id('role')
    // Without SMIL the first role stays written.
    d.defs.push(`<clipPath id="${clip}"><rect x="${n(x - 1)}" y="4" width="${i ? 0 : n(width + 2)}" height="36"><animate attributeName="width" ${discrete(events.map(([at, w]) => [at, w ? w + 2 : 0]), 0)}/></rect></clipPath>`)
    d.add(`<g clip-path="url(#${clip})">${d.text(x, y, role, type.typing, t.brand)}</g>`)
  }
  d.add(`<rect x="${n(roles[0].x + roles[0].width + 2)}" y="10" width="2" height="24" fill="${t.accent}"><animate attributeName="x" ${discrete(timeline, roles[0].x + 2)}/><animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect>`)
  save('typing', await d.svg(W, 44, intro.roles.join('. ')))
}

// ── What I am doing now, with a dot that breathes beside it ──
async function drawNow() {
  const d = new Drawing()
  const colW = W / 3
  d.add(rule(0, 0, W))
  for (const [i, [label, value]] of now.entries()) {
    const x = i * colW
    const dot = i === 0 ? 14 : 0
    if (dot) d.add(`<circle cx="4" cy="26" r="3.5" fill="${t.accent}"><animate attributeName="opacity" values="1;.25;1" dur="2.4s" repeatCount="indefinite"/></circle>`)
    if (i) d.add(`<line x1="${n(x - 18.5)}" y1="14" x2="${n(x - 18.5)}" y2="60" stroke="${t.border}"/>`)
    d.add(d.text(x + dot, 30, label.toUpperCase(), type.label, t.text2), d.text(x, 56, value, type.fact, t.text))
  }
  d.add(rule(0, 73, W))
  save('now', await d.svg(W, 74, now.map(([label, value]) => `${label}: ${value}`).join('. ')))
}

// ── Badges: navy labels with a gold mark ──
async function drawBadge(badge) {
  const d = new Drawing()
  const label = badge.label.toUpperCase()
  const w = await measure(label, type.badge)
  const bw = 26 + w + 9 + 13 + 12
  d.add(`<rect width="${n(bw)}" height="30" rx="4" fill="${t.brand}"/>`, `<rect x="12" y="12.5" width="5" height="5" fill="${t.mark}"/>`,
    d.text(26, 19.5, label, type.badge, t.inverse), icon('arrowUpRight', 26 + w + 9, 8.5, 13, t.inverse))
  save(`badge-${badge.id}`, await d.svg(bw, 30, badge.label))
}

// ── Section titles: the number in gold, the serif title and a hairline ──
async function drawSection(name, index, title) {
  const d = new Drawing()
  const y = 56
  const titleW = await measure(title, type.section)
  d.add(d.text(0, y, index, type.index, t.accent), d.text(32, y, title, type.section, t.text), rule(32 + titleW + 22, y - 12, W))
  save(name, await d.svg(W, 76, title))
}

// ── Work: one row per project, like the index of a magazine ──
const textX = 318
const textW = W - textX - 52
async function layoutRows() {
  const rows = []
  for (const item of work.list) rows.push({ item, lines: await wrap(item.text, type.body, textW) })
  return { rows, lines: Math.max(...rows.map(row => row.lines.length)) }
}

async function drawRow({ item, lines }, index, maxLines, last) {
  const d = new Drawing()
  const h = 34 + maxLines * 26 + 22 + 22
  d.add(rule(0, 0, W), d.text(0, 44, String(index + 1).padStart(2, '0'), type.index, t.text2), d.text(36, 48, item.title, type.rowTitle, t.text))
  let metaX = 36
  if (item.award) { d.add(icon('trophy', 36, 64, 13, t.accent, 1.8)); metaX += 19 }
  d.add(d.text(metaX, 75, item.meta.toUpperCase(), type.label, item.award ? t.award : t.text2))
  let y = 42
  for (const line of lines) { d.add(d.text(textX, y, line, type.body, t.text2)); y += 26 }
  d.add(d.text(textX, 42 + maxLines * 26 + 8, item.tags.join(' · '), type.tags, t.brand), icon('arrowUpRight', W - 20, 26, 18, t.brand))
  if (last) d.add(rule(0, h - 1, W))
  save(`work-${item.id}`, await d.svg(W, h, `${item.title}. ${item.text}`))
}

// ── Toolbox: four columns of plain names ──
async function drawToolbox() {
  const d = new Drawing()
  const gap = 28
  const colW = (W - gap * 3) / 4
  let bottom = 0
  for (const [i, [label, items]] of toolbox.groups.entries()) {
    const x = i * (colW + gap)
    d.add(`<rect x="${n(x)}" y="11" width="6" height="6" fill="${t.accent}"/>`, d.text(x + 14, 18, label.toUpperCase(), type.label, t.text2), rule(x, 32, x + colW))
    let y = 60
    for (const item of items) { d.add(d.text(x, y, item, type.item, t.text)); y += 27 }
    bottom = Math.max(bottom, y)
  }
  save('toolbox', await d.svg(W, bottom - 8, toolbox.groups.map(([label, items]) => `${label}: ${items.join(', ')}`).join('. ')))
}

// ── Closing: where to read more ──
async function drawClosing() {
  const d = new Drawing()
  d.add(rule(0, 0, W), d.text(0, 62, closing.title, type.closing, t.text))
  let y = 98
  for (const line of await wrap(closing.text, type.body, 540)) { d.add(d.text(0, y, line, type.body, t.text2)); y += 27 }
  y += 22
  const label = closing.link.toUpperCase()
  const w = await measure(label, type.link)
  d.add(d.text(0, y, label, type.link, t.brand), `<line x1="0" y1="${y + 7.5}" x2="${n(w - 1.3)}" y2="${y + 7.5}" stroke="${t.accent}" stroke-width="1.5"/>`,
    icon('arrowUpRight', w + 5, y - 12, 14, t.brand))
  // The site's name, set as on the lanyard's ribbon.
  const markW = await measure('javimoralesg', type.wordmark)
  d.add(`<circle cx="${n(W - markW - 16)}" cy="54" r="3.5" fill="${t.accent}"/>`, d.text(W, 62, 'javimoralesg', type.wordmark, t.text, ' text-anchor="end"'),
    d.text(W, 86, 'MADRID · UPM', type.label, t.text2, ' text-anchor="end"'))
  save('closing', await d.svg(W, y + 16, `${closing.title} ${closing.text}`))
}

await drawBanner()
await drawTyping()
await drawNow()
for (const badge of badges) await drawBadge(badge)
await drawSection('section-work', work.index, work.title)
const layout = await layoutRows()
for (const [i, row] of layout.rows.entries()) await drawRow(row, i, layout.lines, i === layout.rows.length - 1)
await drawSection('section-toolbox', toolbox.index, toolbox.title)
await drawToolbox()
await drawSection('section-activity', activity.index, activity.title)
await drawClosing()
await browser.close()

await fs.rm(outDir, { recursive: true, force: true })
await fs.mkdir(outDir, { recursive: true })
for (const [name, svg] of outputs) await fs.writeFile(path.join(outDir, name), svg)
console.log(outputs.map(([name, svg]) => `${name.padEnd(28)} ${(svg.length / 1024).toFixed(0).padStart(4)} KB`).join('\n'))
