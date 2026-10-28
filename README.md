# ftazad.com — personal website

The personal academic website of **Fahim Tasneema Azad**, built from this repository and published
automatically on GitHub Pages at **https://ftazad.com**.

Based on the open-source (MIT-licensed) site code of Dr. Tanzima Z. Islam; see `LICENSE`.

| Page | URL | What it is |
|---|---|---|
| Home | `/` (`index.html`) | Roles, links, photo, stats, bio, future lab, awards, funding, contact |
| Research | `/research.html` | Under construction notice (for now) |
| Publications | `/publications.html` | All publications, grouped by type |
| Teaching & Leadership | `/teaching.html` | Teaching, service and mentoring, talks, memberships, press |

**Stack:** React 19 + Vite 6 + TypeScript. No database or backend; it builds to plain static files.

---

## 1. Where to change what

**You almost never touch the code.** Content lives in the `contents/` folder. On github.com you can
open any of these files, click the **pencil icon**, edit, and click **Commit changes**. The site
rebuilds and goes live by itself in about 2 minutes.

### Lists → CSV files in `contents/`
The row order in the file is the order shown on the page.

| File | Section on the site | Columns |
|---|---|---|
| `awards.csv` | Awards & Honors (Home) | `text`, `highlight` |
| `funding.csv` | Research Funding and Grants (Home) | `text`, `highlight`, `new` |
| `publications.csv` | Publications page | `group`, `id`, `title`, `authors`, `venue`, `year`, `link`, `new` |
| `teaching.csv` | Teaching and Faculty Appointments | `text`, `highlight` |
| `service.csv` | Service, Mentoring, and Leadership | `text`, `highlight` |
| `talks.csv` | Invited Talks | `text`, `highlight` |
| `membership.csv` | Honor Societies and Memberships (shown as pills) | `text` |
| `press.csv` | In the News | `text`, `url` |

- **`highlight`**: put `true` to make the row **bold** with an orange bullet. Leave blank otherwise.
- **`new`**: put `true` to show an orange **NEW** badge.
- **`group`** (publications): rows with the same group appear under one heading, in file order.

**Editing on github.com (plain text):** any cell containing a comma must be wrapped in double quotes,
for example `"Best Paper Award, KDD, 2027",true`. A literal `"` inside a cell is written `""`.
Copying an existing line and changing its words is the safest way to add a row.

### Identity, bio, links, stats → `contents/profile.json`
Edit the text **between the quotes** only, and keep the commas:
- `name`, `credential`, `roles` (title → place lines under your name)
- `bio` (one entry per paragraph), `futureLab` (the call-out box), `contactNote`
- `links` (Scholar, GitHub, LinkedIn), `stats` (the four number cards)
- `jobMarket` (the small card above your photo), `researchNotice` (the Research page text)

### Photo and CV → `public/`
- **Photo:** `public/headshot.jpeg` (square works best). Until it exists, your initials show.
- **CV:** `public/cv.pdf`.

### Section headings (rare)
Edit the headings near the bottom of `src/data/loadContent.ts`.

### Colors / fonts (rare)
`src/index.css`, the `:root` blocks at the top (light and dark themes).

---

## 2. Publishing (already automatic)

Every commit to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it.
Watch progress in the repository's **Actions** tab; a green check means it's live.

One-time settings:
- **Settings → Pages → Build and deployment → Source: GitHub Actions**
- **Custom domain:** `ftazad.com`, then tick **Enforce HTTPS** once DNS is verified.
- `public/CNAME` contains `ftazad.com`. Keep it.
- DNS (Squarespace): four `A` records for `@` → `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153`; one `CNAME` for `www` → `ftazad.github.io`.

---

## 3. Optional: preview on your own computer

Needs Node.js 20+.

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build into dist/
npm run lint       # type-check
```

---

## 4. Search and AI discoverability

- `public/llms.txt`: a plain summary of your research for AI assistants. Update it when your focus changes.
- `public/robots.txt` and `public/sitemap.xml`: let search engines and AI crawlers index every page.
- Each page's `.html` file at the top level holds its title, description and keywords.
- After the domain is live, add the site to Google Search Console and submit `sitemap.xml`.
