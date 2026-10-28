# ftazad.com

Personal academic website for Fahim Tasneema Azad. Plain HTML, CSS and one small script, with no build step. Hosted on GitHub Pages.

## Files

| File | What it is |
|---|---|
| `index.html` | Home: name, roles, links, photo, headline numbers, bio, future lab, awards, funding, contact |
| `research.html` | Research overview, four thrusts, future directions, projects, invited talks |
| `publications.html` | All publications, grouped by type |
| `teaching.html` | Teaching, appointments, service, mentoring, honor societies, press |
| `style.css` | Colors, fonts and layout for every page. Colors are at the top. |
| `site.js` | The light/dark mode button |
| `headshot.jpg` | **You add this.** A portrait photo (roughly 4:5, at least 600 px wide). Until it exists, "FTA" shows instead. |
| `cv.pdf` | **You add this.** Your CV as a PDF. |

## Replacing the old version on GitHub

1. Open your `ftazad.github.io` repository on github.com.
2. Click **Add file** → **Upload files** and drag in all the files above. Files with the same name are replaced.
3. Click **Commit changes**. The site updates in a minute or two.

Don't delete the `CNAME` file in the repository; it keeps ftazad.com connected.

## Editing

Open any `.html` file on GitHub, click the pencil icon, edit, and click **Commit changes**.

- **Add an award, grant or service item:** copy one `<li>...</li>` line in that list and change the text. `<li class="highlight">` gives it the gold highlight. Add `<span class="badge-new">NEW</span>` before `</li>` to show a NEW badge.
- **Add a publication:** in `publications.html`, copy one `<li>...</li>` in the right list and edit it.
- **Change the headline numbers:** search `index.html` for `class="stats"`.
- **After the job market:** in `index.html`, change or delete the `market-card` link next to the photo and the "Future research lab" box.

The navigation bar and footer are repeated at the top and bottom of each page, so a change there (for example, adding a page) needs to be made in all four files.

## Connecting ftazad.com

See the steps in our conversation: four A records for `@` (185.199.108.153, .109.153, .110.153, .111.153) and a CNAME for `www` pointing to `ftazad.github.io`, with Squarespace Defaults removed. Then set the custom domain under Settings → Pages and tick Enforce HTTPS.
