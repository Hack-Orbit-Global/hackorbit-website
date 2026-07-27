# 🧸 The Super-Duper Simple Guide to Setting Up Hack Orbit! 🚀

Hello! Welcome to the step-by-step guide for setting up Hack Orbit. We are going to build the database and hook up the login screens. We will explain everything step-by-step, page-by-page, and button-by-button. No step is too small!

---

## 🗺️ What Are We Doing? (A Simple Map)

Imagine we are building a digital clubhouse:
1. **The Google Spreadsheet**: This is our **Sticker Book** (Database). Every time a member joins or earns a badge, we write their name and details on a page here.
2. **Google Apps Script**: This is our **Magical Assistant** (API Server). It sits next to the Sticker Book, waits for instructions from our website, and writes down the information neatly.
3. **Vercel**: This is the **Cloudhouse** (Hosting Platform) where our website lives so anyone in the world can open it.
4. **OAuth Providers (GitHub, Discord, Google)**: These are the **Security Guards** (Login Systems). They verify that people are who they say they are so we don't have to keep passwords ourselves.

---

## 🎨 Phase 1: Create the Google Sheets Database

First, we need to create our Sticker Book (Spreadsheet).

1. Open your web browser (like Google Chrome, Safari, or Firefox).
2. Type [sheets.google.com](https://sheets.google.com) in the address bar at the top and press the **Enter** (or **Return**) key on your keyboard.
3. You will see a button with a big colorful **plus sign (+)** that says **Blank** underneath it. Click on that plus sign! This creates a brand new spreadsheet.
4. In the top-left corner, click where it says `Untitled spreadsheet` and type `Hack Orbit DB`, then press **Enter**. Now your file has a name!

---

## ✍️ Phase 2: Give the Magical Assistant Its Code

Now, we need to teach our Magical Assistant (Apps Script) how to manage our spreadsheet.

1. In the menu bar at the top of your Google Sheet, click on the word **Extensions**.
2. A menu will drop down. Click on the option that says **Apps Script** (it has a small orange icon next to it that looks like `< >`).
3. A new tab will open in your browser. This is the code editor! It will have a file named `Code.gs` on the left side, and some code that looks like `function myFunction() { ... }` in the middle.
4. We need to create **7 files** inside this editor to match the files in your project directory:

### How to Create and Name Files in Apps Script:
- Look at the left panel. Find the word **Files** and the small **plus sign (+)** next to it.
- Click that **plus sign (+)**.
- A tiny menu will pop up. Click on **Script** (first option).
- A text box will appear. Type the name of the file (for example, `members`) and press **Enter**. (Note: Google will automatically add `.gs` at the end, so you only need to type the name!).

Here are the 7 files you need to create. For each file, click the **plus sign (+)**, create the file, delete any template code inside it, and paste the code from your computer's workspace:

| File Name in Apps Script | Where to find the code on your computer | What it does |
| :--- | :--- | :--- |
| **`Code.gs`** | `apps-script/Code.gs` | The main controller that receives questions from Vercel. |
| **`members.gs`** | `apps-script/members.gs` | Handles adding new members and editing their profile pages. |
| **`contributions.gs`** | `apps-script/contributions.gs` | Keeps track of code changes and helpers. |
| **`badges.gs`** | `apps-script/badges.gs` | Gives badges to cool people. |
| **`certificates.gs`** | `apps-script/certificates.gs` | Generates graduation-style certificates. |
| **`counters.gs`** | `apps-script/counters.gs` | Helps count member IDs (like `HO-000001`, `HO-000002`). |
| **`setup.gs`** | `apps-script/setup.gs` | The installer script that builds the spreadsheet tabs. |

> [!TIP]
> **Keyboard Shortcuts for Copy-Pasting:**
> - **To select all code on your computer:** Click inside the file on your computer, then press `Ctrl + A` (Windows/Linux) or `Cmd + A` (Mac).
> - **To copy code:** Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac).
> - **To paste code into Apps Script:** Click inside the empty Apps Script editor box, then press `Ctrl + V` (Windows/Linux) or `Cmd + V` (Mac).

Once you have created all 7 files and pasted their code, save your project by clicking the **Save Project** icon at the top of the editor (it looks like a small blue floppy disk 💾, located next to the "Run" and "Debug" buttons).

---

## ⚡ Phase 3: Build the Spreadsheet (Run the Installer)

Now we will tell the assistant to automatically set up the sheets and style them with dark headers.

1. Look at the top menu bar of the Apps Script page. You will see a dropdown menu (it might say `myFunction` or `doPost`).
2. Click that dropdown menu and select the function named **`setupSheets`**.
3. Now, click the **Run** button to the left of the dropdown (it looks like a black triangle pointing right ▶️).

### 🚨 How to Pass the Google Security Warning Screens:
Google wants to make sure you know what this code is doing, so it will show some scary warnings. Don't worry! This is your own code on your own account. Here is exactly what to click:

1. A popup will appear saying **"Authorization Required"**. Click the gray button that says **Review permissions**.
2. A new small window will open. Click on your **Google Account name / email address**.
3. A scary window will show up saying **"Google hasn't verified this app"**.
4. Look at the bottom left of that warning box. There is a tiny link that says **"Advanced"**. Click on the word **Advanced**.
5. The warning box will expand with more text at the bottom. Click the link that says **"Go to Hack Orbit DB (unsafe)"**.
6. On the next screen, scroll down and click the blue button that says **Allow**.

Now look at the bottom of the Apps Script page. You will see "Execution started" and then "Execution completed". 

Go back to your Google Sheet browser tab. Magic! You will see **11 colored tabs** created at the bottom of the screen (`Members`, `IdentityConnections`, `Projects`, `Contributions`, `Badges`, `MemberBadges`, `Certificates`, `Events`, `AdminRecords`, `AuditLog`, `Counters`). The headers will be styled in a beautiful dark blue color with bold font!

---

## 🔑 Phase 4: Create a Secret Password (Service Key)

We don't want anyone else editing our spreadsheet database, so we will set up a secret password that only our website (Vercel) and our spreadsheet share.

1. In the Apps Script page, look at the very far-left menu. There is a column of icons:
   - `< >` (Editor)
   - 🕒 (Triggers)
   - ⚙️ (Project Settings - a gear shape)
2. Click the **gear icon ⚙️ (Project Settings)**.
3. Scroll all the way down to the bottom of the settings page until you see a section named **Script Properties**.
4. Click the button that says **Edit script properties**.
5. Click the button that says **Add script property**.
6. Two empty text boxes will appear:
   - In the **Property** box, type exactly: `HO_SERVICE_KEY`
   - In the **Value** box, type a long random password. You can make it up by typing random letters, numbers, and symbols (for example: `MySuperSecretPassword123!!##`). *Write down this password somewhere safe, we will need it in Phase 6!*
7. Click the blue button that says **Save script properties**.

---

## 🚀 Phase 5: Deploy the Assistant (Web App)

Now we make the assistant live on the internet so Vercel can send instructions to it.

1. In the top-right corner of the Apps Script page, click the big blue button that says **Deploy**.
2. Click **New deployment** from the dropdown menu.
3. A popup will open. Look at the word **Select type** with a gear icon ⚙️ next to it. Click that gear icon.
4. Click the option that says **Web app**.
5. Fill in the settings exactly like this:
   - **Description**: Type `Hack Orbit API`
   - **Execute as**: Select **Me (your-email@gmail.com)**
   - **Who has access**: Select **Anyone** (This is very important! It allows Vercel to connect. The script properties will still keep it safe).
6. Click the blue **Deploy** button at the bottom.
7. Wait a few seconds. A screen will appear with a title **"Deployment successfully updated"**.
8. Look for the section named **Web app**. Underneath it, you will see a box with a long URL that looks like `https://script.google.com/macros/s/AKfycb.../exec`.
9. Click the **Copy** button next to that URL. *Keep this URL copied, we will need it in the next phase!*

---

## 🌐 Phase 6: Configure Vercel Settings

Now we will teach Vercel where to find the spreadsheet database and tell it the secret password.

1. Open a new tab in your web browser, type [vercel.com](https://vercel.com) and log in.
2. Click on your **Hack Orbit** project name from your dashboard.
3. Look at the tab menu under your project name near the top of the page. Click on the tab that says **Settings** (next to *Deployments* and *Analytics*).
4. On the left side of the screen, click on the menu option called **Environment Variables**.
5. You will see two boxes to add new settings: **Key** (the name) and **Value** (the secret code).
6. Enter the following variables one by one:

| Key Name | What to put in the Value box | What it is |
| :--- | :--- | :--- |
| **`APPS_SCRIPT_URL`** | *[Paste the Web App URL you copied in Phase 5]* | The address of your magical assistant. |
| **`HO_SERVICE_KEY`** | *[Paste the exact secret password you typed in Phase 4]* | The secret password to access the sheet. |
| **`JWT_SECRET`** | *[Type a long random string of letters and numbers]* | A key to make secure login tickets. |
| **`CRON_SECRET`** | *[Type another random string of letters and numbers]* | A secret key to allow automated background updates. |
| **`NEXT_PUBLIC_BASE_URL`** | `https://hackorbitglobal.vercel.app` (or your Vercel URL) | The address of your website. |

*How to add each one:* Type the Key, type/paste the Value, and click the blue **Add** button.

---

## 🔒 Phase 7: Set Up Login Buttons (OAuth)

When members click "Login with GitHub", "Login with Discord", or "Login with Google", we need to register our app with those services first. Here is how to get the keys for each one.

### 🐱 Option A: Set Up GitHub Login
1. Go to [github.com](https://github.com) and sign in.
2. Click your profile picture in the top-right corner, scroll down the menu, and click **Settings**.
3. Scroll all the way down on the left sidebar and click **Developer settings**.
4. Click on **OAuth Apps** on the left.
5. Click the green button on the right that says **Register a new application**.
6. Fill in the form:
   - **Application name**: `Hack Orbit`
   - **Homepage URL**: `https://hackorbitglobal.vercel.app` (or your Vercel URL)
   - **Authorization callback URL**: Type your homepage URL followed by `/api/auth/github/callback` (for example: `https://hackorbitglobal.vercel.app/api/auth/github/callback`).
7. Click the green **Register application** button.
8. You will see a client page:
   - Copy the **Client ID** (a mix of letters and numbers). Go to your Vercel Settings and add it as **`GITHUB_CLIENT_ID`**.
   - Click the button that says **Generate a new client secret**. Copy the secret code that appears (it only shows once!). Go to Vercel Settings and add it as **`GITHUB_CLIENT_SECRET`**.

---

### 👾 Option B: Set Up Discord Login
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) and sign in.
2. Click the blue button in the top-right corner that says **New Application**.
3. Type `Hack Orbit` in the Name box, check the agreement box, and click **Create**.
4. On the left sidebar, click on **OAuth2**.
5. Look for the **Redirects** section on the page. Click the **Add Redirect** button.
6. Type your website URL followed by `/api/auth/discord/callback` (for example: `https://hackorbitglobal.vercel.app/api/auth/discord/callback`).
7. Click the green **Save Changes** button at the bottom of the page.
8. Scroll back up to the top of the OAuth2 page:
   - Copy the **Client ID**. Add it to Vercel as **`DISCORD_CLIENT_ID`**.
   - Click the **Reset Secret** button under *Client Secret*, confirm it, and copy the new secret. Add it to Vercel as **`DISCORD_CLIENT_SECRET`**.

---

### 🔍 Option C: Set Up Google Login
1. Go to [console.cloud.google.com](https://console.cloud.google.com) and log in with your Google account.
2. Click the dropdown menu at the very top left (next to the Google Cloud logo) and click **New Project**. Type `Hack Orbit` and click **Create**.
3. Make sure your project is selected in that same dropdown menu.
4. Click the hamburger menu icon (three lines ☰) in the top-left corner, hover over **APIs & Services**, and click **OAuth consent screen**.
5. Choose **External** and click **Create**.
6. Fill in the required fields:
   - **App name**: `Hack Orbit`
   - **User support email**: Choose your email from the dropdown.
   - **Developer contact information**: Type your email address.
   - Click **Save and Continue** at the bottom.
7. Click **Save and Continue** on the Scopes screen.
8. Click **Save and Continue** on the Test Users screen.
9. Click **Back to Dashboard** at the end.
10. Click on **Credentials** on the left menu sidebar.
11. Click the **+ Create Credentials** button at the top of the page, and select **OAuth client ID**.
12. In the **Application type** dropdown, select **Web application**.
13. In the Name field, type `Hack Orbit Web client`.
14. Under **Authorized redirect URIs**, click **+ Add URI**.
15. Type your homepage URL followed by `/api/auth/google/callback` (for example: `https://hackorbitglobal.vercel.app/api/auth/google/callback`).
16. Click the blue **Create** button.
17. A popup will show you:
    - **Your Client ID**: Copy this and add it to Vercel as **`GOOGLE_CLIENT_ID`**.
    - **Your Client Secret**: Copy this and add it to Vercel as **`GOOGLE_CLIENT_SECRET`**.

---

## 🎉 Phase 8: You Are All Done!

That's it! Let's double check your checklist:
- [ ] Spreadsheets named `Hack Orbit DB` with 11 custom-styled sheets? **Yes!**
- [ ] Apps Script saved and running the custom sheet layout? **Yes!**
- [ ] Service key secret password set up on both Google Script and Vercel? **Yes!**
- [ ] Login keys from GitHub, Discord, and Google pasted into Vercel? **Yes!**

Now, rebuild your Vercel project by pushing a code update or clicking **Redeploy** on the Vercel dashboard. Your website is ready for members to log in, register, and automatically write their profiles into your Google Sheet database! 🥳🎈
