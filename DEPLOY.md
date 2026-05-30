# Publish Restaurant L'endroit_parfait for FREE

Share a link with restaurant management — no payment required.

---

## Option A — Fastest (about 5 minutes, no coding)

**Netlify Drop** — upload your built site folder.

1. Open PowerShell in this folder and run:
   ```powershell
   cd "c:\Users\Administrator\Desktop\Nouakchott_Night"
   npm run build
   ```
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Sign up free (email or Google)
4. **Drag the entire `dist` folder** onto the page  
   (`Nouakchott_Night\dist` — not the whole project)
5. Netlify gives you a link like `https://random-name-123.netlify.app`
6. Optional: Site settings → Domain management → change site name to e.g. `nouakchott-night`

**To update later:** run `npm run build` again and drag `dist` onto Netlify again (same site if you’re logged in).

---

## Option B — Best for updates (GitHub + Vercel)

Good if you will change the site often.

### Step 1 — GitHub account

Create a free account at [https://github.com](https://github.com)

### Step 2 — Put code on GitHub

In PowerShell:

```powershell
cd "c:\Users\Administrator\Desktop\Nouakchott_Night"
git init
git add .
git commit -m "Restaurant L'endroit_parfait restaurant website"
```

On GitHub: **New repository** → name it `nouakchott-night` → Create (empty, no README).

Then (replace `YOUR_USERNAME`):

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nouakchott-night.git
git push -u origin main
```

(GitHub may ask you to log in in the browser.)

### Step 3 — Deploy on Vercel (free)

1. Go to [https://vercel.com](https://vercel.com) → Sign up with GitHub  
2. **Add New Project** → import `nouakchott-night`  
3. Settings (defaults are fine):
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**

You get a link like `https://nouakchott-night.vercel.app`

Every `git push` can auto-update the live site.

---

## GitHub Pages (your link)

URL: [https://taleb2030.github.io/nouakchott-night/](https://taleb2030.github.io/nouakchott-night/)

1. Repo **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **gh-pages** → folder **/ (root)** → Save
4. Push to `main` — GitHub Actions builds the site and updates `gh-pages`
5. Wait 2–3 minutes, then open the link (use Ctrl+F5)

**Important:** Do NOT use "main" branch as the Pages source — that shows a blank page.

---

## Option C — Cloudflare Pages (free)

1. [https://dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create  
2. Connect GitHub **or** upload `dist` (Direct Upload)  
3. Build: `npm run build` — Output: `dist`

---

## Before you publish — checklist

| Item | Action |
|------|--------|
| Videos & photos | Already in `public/assets/` — included after `npm run build` |
| Phone number | Edit `src/components/Contact.jsx` → real number |
| Build | Always run `npm run build` before upload |

---

## Video size note

Your 3 videos are ~36 MB total. Free hosts allow this for a demo. If upload fails, use **Option B** (Git push) instead of drag-and-drop.

---

## Quick test on your PC (no internet)

```powershell
npm run build
npm run preview
```

Open the URL shown (usually `http://localhost:4173`).
