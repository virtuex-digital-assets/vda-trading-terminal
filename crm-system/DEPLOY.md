# 🚀 How to make VDA CRM go LIVE — step by step (super easy!)

Don't worry — we'll do this together, one tiny step at a time. 🐣

---

## What is going to happen?

We are going to put the CRM app on the internet so **anyone in the world** can open it
in a browser. It will live at this address:

> **https://virtuex-digital-assets.github.io/vda-crm-system**

GitHub gives us free hosting — we just need to push the code there. Here's how. 👇

---

## Before you start — things you need

| Thing | Why you need it | Do you have it? |
|---|---|---|
| A computer with internet | To do everything | ✅ Yes |
| A GitHub account | The code will live there | Need to check → [github.com](https://github.com) |
| Git installed | To send code to GitHub | [download here](https://git-scm.com/downloads) |
| Node.js (v18) installed | Only needed if running locally | [download here](https://nodejs.org) |

> 💡 **Git** is already installed if you can open a Terminal (or Command Prompt on Windows)
> and type `git --version` and it shows a number.

---

## STEP 1 — Create a new GitHub repository

Think of a GitHub "repository" (repo) like a folder on the internet where your code lives.

1. Open your browser and go to **[github.com](https://github.com)**
2. Click the big green **"New"** button (top-left, next to the 🐱 logo)
3. Fill in the form:
   - **Repository name:** `vda-crm-system` ← type exactly this
   - **Description:** `VDA CRM System` ← optional but nice
   - **Public** ← make sure this circle is selected (not Private)
   - ❌ Do NOT tick "Add a README file"
   - ❌ Do NOT tick "Add .gitignore"
   - ❌ Do NOT tick "Choose a license"
4. Click the green **"Create repository"** button

✅ You now have an empty repo. Leave this browser tab open — you'll need the URL in Step 3.

---

## STEP 2 — Open a Terminal on your computer

A Terminal is a black (or white) window where you type commands.

- **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
- **Windows:** Press `Win` key, type `cmd` or `PowerShell`, press Enter
- **Linux:** Press `Ctrl + Alt + T`

You'll see a blinking cursor. That's normal! 😊

---

## STEP 3 — Go into the crm-system folder

The CRM app code is inside a folder called `crm-system`. You need to tell the Terminal
to go into that folder.

> ⚠️ Replace the path below with wherever **you** saved the `vda-trading-terminal` project.

```bash
cd /path/to/vda-trading-terminal/crm-system
```

**Example on Mac:**
```bash
cd ~/Documents/vda-trading-terminal/crm-system
```

**Example on Windows (PowerShell):**
```powershell
cd C:\Users\YourName\Documents\vda-trading-terminal\crm-system
```

Check you're in the right place by typing:
```bash
ls
```
You should see files like `package.json`, `README.md`, `src`, `public`. ✅

---

## STEP 4 — Set up Git inside the crm-system folder

Now we tell Git "hey, this folder is a project I want to track".

Type each line below and press **Enter** after each one:

```bash
git init
```
*(This makes the folder a "git project")*

```bash
git add .
```
*(The dot means "add ALL the files")*

```bash
git commit -m "first commit"
```
*(This saves a snapshot of all the files)*

---

## STEP 5 — Connect your folder to GitHub

Remember that empty GitHub repo you made in Step 1?
Go back to that browser tab. You'll see a URL that looks like:

```
https://github.com/YOUR-USERNAME/vda-crm-system.git
```

Copy that URL. Now in the Terminal type:

```bash
git remote add origin https://github.com/YOUR-USERNAME/vda-crm-system.git
```

*(Replace `YOUR-USERNAME` with your actual GitHub username)*

Then type:
```bash
git branch -M main
git push -u origin main
```

It will ask for your GitHub username and password.

> 💡 **If it asks for a password and nothing works:** GitHub now uses "tokens" instead of passwords.
> Go to GitHub → Settings → Developer Settings → Personal access tokens → Generate new token (classic).
> Give it `repo` permission. Copy the token and use it as your password.

✅ If it says "Writing objects... done." — your code is now on GitHub! 🎉

---

## STEP 6 — Turn on GitHub Pages

Now we tell GitHub "please show this as a website".

1. Go to your repo on GitHub: `https://github.com/YOUR-USERNAME/vda-crm-system`
2. Click **⚙️ Settings** (near the top of the page)
3. Click **Pages** in the left sidebar
4. Under **"Source"**, click the dropdown that says **"Deploy from a branch"**
   - It might already say that. Leave it as-is.
5. Under **"Branch"**, change the branch from `main` to **`gh-pages`**
   - (If you don't see `gh-pages` yet, skip to "Wait for the robot" below first!)
6. Click **Save**

---

## STEP 7 — Wait for the robot 🤖

When you pushed your code in Step 5, GitHub automatically started a "robot" that:
- Installs the app
- Builds it
- Puts it on the internet for you

This takes about **2–3 minutes**. You can watch it happen:

1. Go to your repo: `https://github.com/YOUR-USERNAME/vda-crm-system`
2. Click the **Actions** tab (near the top)
3. You'll see a job called **"Deploy CRM to GitHub Pages"**
4. Click on it — you can watch each step turn green ✅

> 💛 Yellow circle = still working
> ✅ Green tick = done!
> ❌ Red X = something went wrong (scroll down to see the error message)

---

## STEP 8 — Go back and set the gh-pages branch (if you skipped it earlier)

After the robot finishes in Step 7, a new branch called `gh-pages` will appear.
Go back to **Settings → Pages** and set the branch to `gh-pages`. Click Save.

---

## STEP 9 — Open your live CRM! 🎉

Wait about **1 more minute** after setting the branch, then open:

> **https://YOUR-USERNAME.github.io/vda-crm-system**

You should see the VDA CRM System dashboard with demo client data! 🥳

---

## 🔁 How to update the app in the future

Every time you want to push new changes:

```bash
git add .
git commit -m "describe what you changed"
git push
```

The robot will automatically rebuild and redeploy in ~2 minutes. Easy!

---

## 😰 Something went wrong?

| Problem | Fix |
|---|---|
| `git: command not found` | Install Git from [git-scm.com](https://git-scm.com/downloads) |
| `npm: command not found` | Install Node.js from [nodejs.org](https://nodejs.org) |
| `Permission denied (publickey)` | Use HTTPS URL (not SSH) — make sure your URL starts with `https://` |
| `remote: Repository not found` | Double-check the GitHub URL you used in Step 5 |
| Page shows 404 after deploy | Wait 2 more minutes, then hard-refresh the page (`Ctrl+Shift+R`) |
| Actions tab shows red ❌ | Click on the failed job → scroll to the red step → read the error message |

---

## 🆘 Need help?

Open an issue in the repo and describe what step you're stuck on:
[https://github.com/virtuex-digital-assets/vda-crm-system/issues](https://github.com/virtuex-digital-assets/vda-crm-system/issues)

---

*You did it! The CRM is live. Tell your friends.* 🚀
