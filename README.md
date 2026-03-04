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
