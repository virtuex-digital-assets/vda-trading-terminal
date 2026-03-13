# 🚀 How to make VDA Trading Terminal go LIVE — step by step

Don't worry if you've never done this before. We'll go through it together,
one tiny step at a time. 🐣

---

## What are we doing?

We are going to put the trading terminal on the internet so **anyone in the world**
can open it in their browser — on their phone, their laptop, anywhere.

It will be available at this free address:

> **https://virtuex-digital-assets.github.io/vda-trading-terminal**

GitHub gives us free hosting. The app is already set up to go live automatically.
You just need to flip **one switch** in GitHub settings and then merge the PR. That's it!

---

## Before you start — things you need

| Thing | Why | Got it? |
|---|---|---|
| A GitHub account | So you can change settings | [github.com](https://github.com) — it's free |
| Owner or admin access to the repo | So you can change Settings | Ask the repo owner if unsure |

That's it. You don't need to install anything on your computer. GitHub does all the work!

---

## STEP 1 — Enable GitHub Pages

This is the **one switch** we need to flip. You only do this once, ever.

1. Open your browser and go to:
   > **[https://github.com/virtuex-digital-assets/vda-trading-terminal/settings/pages](https://github.com/virtuex-digital-assets/vda-trading-terminal/settings/pages)**

2. You'll see a section called **"Source"**

3. Click the dropdown (it probably says **"None"** or **"Deploy from a branch"**)

4. Choose **"GitHub Actions"**

5. Click **Save**

✅ Done! GitHub Pages is now turned on.

---

## STEP 2 — Merge the pull request to `main`

The code is ready — it just needs to be "merged" (like clicking Approve + Apply).

1. Go to the **Pull Requests** tab:
   > **[https://github.com/virtuex-digital-assets/vda-trading-terminal/pulls](https://github.com/virtuex-digital-assets/vda-trading-terminal/pulls)**

2. Click the open pull request

3. Scroll to the bottom and click the green **"Merge pull request"** button

4. Click **"Confirm merge"**

✅ Done! The code is now on the `main` branch.

---

## STEP 3 — Watch the robot build it 🤖

As soon as you merged, GitHub started an automatic robot job that:
- Installs the app's parts
- Builds a website from the code
- Publishes it live on the internet

This takes **about 2–3 minutes**. You can watch it:

1. Click the **Actions** tab:
   > **[https://github.com/virtuex-digital-assets/vda-trading-terminal/actions](https://github.com/virtuex-digital-assets/vda-trading-terminal/actions)**

2. You'll see a job called **"Deploy to GitHub Pages"** — it has a yellow spinning circle

3. Click on it to watch each step turn green ✅

> 💛 Yellow spinning = still working (be patient!)
> ✅ Green tick = finished!
> ❌ Red X = something went wrong (see "Help!" section below)

---

## STEP 4 — Open your live app! 🎉

Once the Actions job goes green (usually within 2–3 minutes of merging), open:

> **[https://virtuex-digital-assets.github.io/vda-trading-terminal](https://virtuex-digital-assets.github.io/vda-trading-terminal)**

The trading terminal will load and prices will start moving on their own. 📈

---

## 🔁 How updates work in the future

Every time someone pushes new code to `main`, the robot automatically:
1. Rebuilds the app
2. Puts it live again

You don't have to do anything. It just works! ✨

---

## 🏠 Want your own web address? (e.g. `www.mysite.com`)

Instead of the long GitHub address, you can use your own domain name.
Here's how — step by step:

---

### A — Buy a domain name

You need to buy a domain like `mysite.com`. Good places to buy:
- **[Namecheap](https://www.namecheap.com)** — about $10/year
- **[Google Domains](https://domains.google)** — about $12/year
- **[GoDaddy](https://www.godaddy.com)** — about $12/year

---

### B — Point your domain at GitHub

1. Log in to where you bought your domain
2. Find the **DNS settings** (sometimes called "Advanced DNS" or "Manage DNS")
3. Add these **4 A records** — copy them exactly:

   | Type | Host/Name | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

4. Also add **one CNAME record** for the `www.` version:

   | Type | Host/Name | Value |
   |---|---|---|
   | CNAME | www | virtuex-digital-assets.github.io |

5. Click Save. DNS changes can take up to **24 hours** to work (usually much faster).

---

### C — Tell GitHub your domain

1. Go to: **Settings → Pages** in your GitHub repo
2. Under **"Custom domain"**, type your domain (e.g. `www.mysite.com`)
3. Click **Save**
4. Tick **"Enforce HTTPS"** so the padlock 🔒 shows up for visitors

---

### D — Add a CNAME file to the project

This prevents GitHub from forgetting your domain after the next deploy.

1. Create a file called `CNAME` (no `.txt` extension!) inside the `public/` folder
2. Put your domain on the first line — for example:
   ```
   www.mysite.com
   ```
3. Save it, commit it to `main`, push it — the robot will pick it up automatically

---

### E — Visit your live site! 🎉

After DNS has finished spreading (up to 24 hours), open:

> **`https://www.mysite.com`**

Your trading terminal will load on your very own web address! 🌍

---

## 😰 Something went wrong?

| Problem | Fix |
|---|---|
| Settings → Pages shows an error | Make sure "Source" is set to **GitHub Actions**, not "None" |
| Actions tab shows red ❌ | Click on the failed job → scroll to the red step → read the message |
| Site shows a 404 page | Wait 2 more minutes, then hard-refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`) |
| "Permission denied" error in Actions | Make sure the workflow has `permissions: contents: write` (it already does) |
| Domain not working | DNS takes time — wait up to 24 hours, then try again |

---

## 🆘 Still stuck?

Open an issue in the repo and describe exactly what step you're on and what you see:

> **[https://github.com/virtuex-digital-assets/vda-trading-terminal/issues](https://github.com/virtuex-digital-assets/vda-trading-terminal/issues)**

---

*The app is live. Tell everyone.* 🚀
