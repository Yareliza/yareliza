# Yareliza — waiting page

Static landing page hosted on GitHub Pages at **https://iamyareliza.com**.

## Stack

Pure HTML / CSS / JS — no build step. Drop changes and `git push`.

## Local preview

```bash
open index.html
```

Or serve with any static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Replace the placeholder photo

Drop your final image at `assets/photo.jpg` (recommended: square, ≥ 560×560, JPG ≤ 200 KB). Same filename — no HTML change needed.

## Hook up real email capture

The form currently uses `mailto:contact@iamyareliza.com`. To collect addresses automatically, switch the `<form action="...">` in `index.html` to a service endpoint:

- **Formspree** — `https://formspree.io/f/XXXXX` (free tier: 50 / month)
- **Mailchimp embed** — paste their `<form>` block
- **ConvertKit** — paste their form HTML

## Deploy

`main` is auto-deployed by GitHub Pages on push.

```bash
git add -A
git commit -m "..."
git push
```

## Custom domain (IONOS DNS)

`CNAME` file pins the site to `iamyareliza.com`. In IONOS DNS:

| Type  | Host | Value                                       |
| ----- | ---- | ------------------------------------------- |
| A     | @    | 185.199.108.153                             |
| A     | @    | 185.199.109.153                             |
| A     | @    | 185.199.110.153                             |
| A     | @    | 185.199.111.153                             |
| CNAME | www  | yareliza.github.io                          |

Then in GitHub repo → **Settings → Pages → Enforce HTTPS**.
