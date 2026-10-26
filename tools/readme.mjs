// Writes ../README.md. The images of assets/ switch theme by themselves; the
// GitHub widgets go in a <picture> with a version for each theme.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { site, intro, now, badges, work, toolbox, activity, closing } from './content.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const own = (href, name, alt, size = 'width="100%"') => `<a href="${href}"><img ${size} alt="${alt}" src="assets/${name}.svg"></a>`
const picture = (dark, light, alt, size = 'width="100%"') =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="${dark}"><img ${size} alt="${alt}" src="${light}"></picture>`

// github-readme-stats, streak-stats and the snake with the portfolio's tokens.
// Commas are encoded because srcset would split the URL at them.
const widgets = theme => {
  const c = theme === 'dark'
    ? { bg: '172330', text: 'b5c0cd', brand: '92b7e4', accent: 'd6b27b', border: '31404e', strong: 'edf0ee', muted: 'a0adbc' }
    : { bg: 'fffefa', text: '536173', brand: '203d66', accent: 'c19350', border: 'dce0dc', strong: '162b46', muted: '657183' }
  return {
    stats: `https://github-readme-stats.vercel.app/api?username=javimoralesg&show_icons=true&include_all_commits=true&hide_rank=true&hide_title=true&hide=issues%2Ccontribs&show=prs_merged&bg_color=${c.bg}&text_color=${c.text}&icon_color=${c.accent}&title_color=${c.brand}&border_color=${c.border}&border_radius=8&line_height=32&card_width=420`,
    streak: `https://streak-stats.demolab.com?user=javimoralesg&background=${c.bg}&border=${c.border}&stroke=${c.border}&ring=${c.brand}&fire=${c.accent}&currStreakNum=${c.strong}&sideNums=${c.brand}&currStreakLabel=${c.brand}&sideLabels=${c.text}&dates=${c.muted}&border_radius=8&card_width=420&card_height=175`,
    snake: `https://raw.githubusercontent.com/javimoralesg/javimoralesg/output/github-snake${theme === 'dark' ? '-dark' : ''}.svg`,
  }
}
const [light, dark] = [widgets('light'), widgets('dark')]

const readme = [
  own(site, 'banner', `Javier Morales Galisteo. ${intro.subtitle}`),
  own(site, 'typing', intro.roles.join('. ')),
  `<p align="center">${badges.map(badge => own(badge.href, `badge-${badge.id}`, badge.label, 'height="30"')).join('&nbsp;&nbsp;')}&nbsp;&nbsp;<img height="30" alt="Profile views" src="https://komarev.com/ghpvc/?username=javimoralesg&label=Profile%20views&color=203d66&style=for-the-badge"></p>`,
  own(site, 'now', now.map(([label, value]) => `${label}: ${value}`).join('. ')),
  own(site, 'section-work', work.title),
  work.list.map(item => own(item.href, `work-${item.id}`, `${item.title}: ${item.text}`)).join('<br>\n'),
  own(site, 'section-toolbox', toolbox.title),
  own(site, 'toolbox', toolbox.groups.map(([label, items]) => `${label}: ${items.join(', ')}`).join('. ')),
  own('https://github.com/javimoralesg?tab=repositories', 'section-activity', activity.title),
  `<p>${picture(dark.stats, light.stats, 'GitHub stats', 'width="49.5%"')} ${picture(dark.streak, light.streak, 'Contribution streak', 'width="49.5%"')}</p>`,
  picture(dark.snake, light.snake, 'A snake eating my contribution graph'),
  own(closing.href, 'closing', `${closing.title} ${closing.text}`),
]
await fs.writeFile(path.join(here, '../README.md'), readme.join('\n\n') + '\n')
