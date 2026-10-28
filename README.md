# ftazad.com

Personal academic website for Fahim Tasneema Azad. Plain HTML and CSS, with no build step.

## Files

- `index.html`: all page content. Edit this to add news, papers, etc.
- `style.css`: colors, fonts, layout. Colors are defined at the top.
- `headshot.jpg`: **add this** (square photo, at least 400×400). Until it exists, the page shows "FTA" initials.
- `cv.pdf`: **add this** (export your LaTeX CV to PDF and name it `cv.pdf`).

## Publish on GitHub Pages

1. On GitHub, create a repository named **`ftazad.github.io`** (exactly your username + `.github.io`).
2. Upload `index.html`, `style.css`, `headshot.jpg`, and `cv.pdf` to the repository root (Add file → Upload files → Commit).
3. Go to **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
4. After a minute or two, the site is live at `https://ftazad.github.io`.

## Connect ftazad.com (after you buy the domain)

1. In the repository, go to **Settings → Pages → Custom domain**, enter `ftazad.com`, and save. GitHub adds a `CNAME` file for you.
2. At your domain registrar's DNS settings, add:
   - Four **A** records for `@` pointing to:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One **CNAME** record for `www` pointing to `ftazad.github.io`
3. DNS can take up to a day. Once GitHub shows the domain as verified, tick **Enforce HTTPS**.

Check GitHub's current docs ("Managing a custom domain for your GitHub Pages site") in case the IP addresses change.

If you also register ftazad.net, .org, or .ai, use the registrar's "URL forwarding" to redirect them to `https://ftazad.com`.

## Updating

- **News:** copy one `<li>` inside `<section id="news">` and edit it. Keep the newest at the top.
- **Papers:** copy a `<li>` in the right list under `<section id="publications">`. To add a link, put `<span class="pub-links"><a href="...">PDF</a></span>` at the end, as in the arXiv entry.
- After the job market, change or delete the `<p class="market">` line in the sidebar.

## Notes

- Your phone number is intentionally left off the public site.
- Search engines read the `<meta name="description">` at the top of `index.html`; update it if your title changes.
