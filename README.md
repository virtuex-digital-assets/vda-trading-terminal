# VDA Trading Terminal

This is a **trading app** that runs in your web browser. It shows live prices and lets you practice buying and selling currencies and other assets. 📈

![VDA Trading Terminal](https://github.com/user-attachments/assets/a222cdf7-c337-47be-94c9-011c123b3a3f)

---

## 👀 Want to see it right now?

**Just click this link and it opens in your browser — nothing to install!**

> 👉 **[https://virtuex-digital-assets.github.io/vda-trading-terminal](https://virtuex-digital-assets.github.io/vda-trading-terminal)**

That's it! The app will open and prices will start moving on their own. 🎉

---

## 💻 Want to run it on your own computer instead?

Follow these steps **one at a time**. Take your time — there's no rush!

---

### Step 1 — Download Node.js

Node.js is a helper program that lets the app run on your computer.

1. Go to 👉 **[https://nodejs.org](https://nodejs.org)**
2. Click the big green button that says **"LTS"** (that's the safe, stable version)
3. Download and install it — just click **Next** on everything, like any normal program
4. When it's done, close and reopen your terminal / command prompt

---

### Step 2 — Open your terminal (the black text window)

- **Windows**: Press the `Windows` key, type `cmd`, press `Enter`
- **Mac**: Press `Cmd + Space`, type `Terminal`, press `Enter`

---

### Step 3 — Go to the project folder

Type this and press `Enter` (change the path to wherever you saved the project):

```
cd C:\path\to\vda-trading-terminal
```

*(On Mac it looks like: `cd /Users/yourname/vda-trading-terminal`)*

---

### Step 4 — Install the app's pieces (first time only)

Type this and press `Enter`:

```
npm install
```

⏳ Wait for it to finish. You'll see a lot of text scrolling — that's normal! It usually takes about 1–2 minutes.

---

### Step 5 — Start the app

Type this and press `Enter`:

```
npm start
```

⏳ Wait about 10–20 seconds. When you see:

```
Compiled successfully!
```

...the app is ready! 🎉

---

### Step 6 — Open it in your browser

Open **Google Chrome**, **Firefox**, or any browser and go to:

> 👉 **[http://localhost:3000](http://localhost:3000)**

The trading terminal will open and prices will start moving automatically. No real money is involved — it's just a demo!

---

### Step 7 — How to stop it

When you're done, go back to the terminal and press:

```
Ctrl + C
```

That turns off the app.

---

## 🌐 Make it live online (so anyone in the world can visit it)

The app is already set up to go live for **free** using something called **GitHub Pages**. Think of it like GitHub hosting your website for you. You just need to flip one switch — here's how:

---

### Step 1 — Go to your GitHub repository

Open your browser and go to:

> 👉 **[https://github.com/virtuex-digital-assets/vda-trading-terminal](https://github.com/virtuex-digital-assets/vda-trading-terminal)**

---

### Step 2 — Open the Settings

Click the **"Settings"** tab near the top of the page (it has a gear icon ⚙️).

---

### Step 3 — Find "Pages" in the left menu

On the left side of the Settings page, scroll down and click **"Pages"**.

---

### Step 4 — Turn on GitHub Pages

Under **"Source"**, click the dropdown that says **"None"** and change it to **"GitHub Actions"**.

Then click **Save**.

---

### Step 5 — Merge this PR to main

Once the PR is merged into the `main` branch, GitHub will automatically:
1. Build the app ⚙️
2. Put it live on the internet 🚀

This takes about **2–3 minutes**.

---

### Step 6 — Visit your live site!

Once it's done, your site will be live at:

> 👉 **[https://virtuex-digital-assets.github.io/vda-trading-terminal](https://virtuex-digital-assets.github.io/vda-trading-terminal)**

Just open that link in any browser — from any device, anywhere in the world! 🌍

> Every time you push new code to `main`, the site automatically updates itself. You don't have to do anything!

---

## 🏠 Use your own domain name (e.g. `www.mysite.com`)

Want the site to have your own web address instead of the long GitHub one? Here's how — step by step.

---

### What you need first

You need to **buy a domain name** (like `mysite.com`). You can buy one from:
- [Namecheap](https://www.namecheap.com) (~$10/year)
- [Google Domains](https://domains.google) (~$12/year)
- [GoDaddy](https://www.godaddy.com) (~$12/year)

Once you've bought one, come back here and follow these steps:

---

### Step A — Point your domain to GitHub

1. Log in to wherever you bought your domain (e.g. Namecheap)
2. Find the **DNS settings** for your domain (sometimes called "Advanced DNS" or "Manage DNS")
3. Add these **4 records** (they tell the internet to send visitors to GitHub):

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

4. Also add this record (for the `www.` version):

| Type | Host | Value |
|---|---|---|
| CNAME | www | virtuex-digital-assets.github.io |

5. Save the changes. DNS can take up to **24 hours** to spread around the internet (usually much faster).

---

### Step B — Tell GitHub your domain name

1. Go back to your GitHub repo → **Settings** → **Pages**
2. Under **"Custom domain"**, type in your domain (e.g. `www.mysite.com`)
3. Click **Save**
4. GitHub will automatically turn on **HTTPS** (the padlock 🔒) for free — just tick "Enforce HTTPS" if it's not already ticked

---

### Step C — Add a CNAME file to the project

This file tells GitHub "remember my custom domain even after a new deploy":

1. In the `public/` folder of this project, create a file called `CNAME` (no file extension)
2. Inside it, put just your domain name on one line, for example:

```
www.mysite.com
```

3. Save it, commit it, and push to `main` — GitHub Pages will pick it up automatically

---

### Step D — Visit your site on your new domain!

After DNS has updated (give it up to 24 hours), open your browser and go to:

> 👉 **`https://www.mysite.com`**

Your trading terminal will load on your very own web address! 🎉

---

## 🤔 What can I do in the app?

Here's what you'll see when you open it:

| What you see | What it does |
|---|---|
| **Market Watch** (left panel) | Shows live prices for 10 currencies and assets like Gold and Bitcoin |
| **Chart** (middle) | Shows a price chart — you can switch between different time views |
| **Order Panel** (right) | Where you click BUY or SELL to practice placing a trade |
| **Positions** (bottom) | Shows trades you have open right now |
| **History** | Shows trades you already closed |
| **Account Info** | Shows your pretend balance and profit/loss |

---

## 🪙 Which assets are in the app?

`EURUSD` · `GBPUSD` · `USDJPY` · `XAUUSD` (Gold) · `USDCHF` · `AUDUSD` · `USDCAD` · `NZDUSD` · `BTCUSD` · `ETHUSD`

---

## ❓ Something not working?

| Problem | Fix |
|---|---|
| *"npm is not recognized"* | You need to install Node.js (see Step 1 above) |
| *"localhost:3000 can't be reached"* | Make sure you ran `npm start` and waited for "Compiled successfully!" |
| *Page is blank or broken* | Try a hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) |

---

## License

MIT © Virtuex Digital Assets
